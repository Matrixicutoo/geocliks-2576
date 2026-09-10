import { z } from "zod";
import { orgProc } from "../middleware/auth";
import { presignGet, presignPut } from "../lib/s3";
import { id } from "../lib/ids";

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);

export const upload = {
  /** Presign a direct PUT for a captured photo. The client uploads straight to storage. */
  presignPhoto: orgProc
    .input(z.object({ filename: z.string(), contentType: z.string().default("image/jpeg") }))
    .handler(async ({ input, context }) => {
      const key = `orgs/${context.org.id}/photos/${id("ph")}-${safeName(input.filename)}`;
      const url = await presignPut(key, input.contentType);
      return { url, key };
    }),

  /** Presign a batch — the mobile offline queue drains many photos at once. */
  presignBatch: orgProc
    .input(
      z.object({
        files: z
          .array(z.object({ filename: z.string(), contentType: z.string().default("image/jpeg") }))
          .max(50),
      }),
    )
    .handler(async ({ input, context }) => {
      return Promise.all(
        input.files.map(async (file) => {
          const key = `orgs/${context.org.id}/photos/${id("ph")}-${safeName(file.filename)}`;
          return { url: await presignPut(key, file.contentType), key, filename: file.filename };
        }),
      );
    }),

  /** Presign a direct PUT for a verified video clip. */
  presignVideo: orgProc
    .input(z.object({ filename: z.string(), contentType: z.string().default("video/mp4") }))
    .handler(async ({ input, context }) => {
      const key = `orgs/${context.org.id}/videos/${id("vid")}-${safeName(input.filename)}`;
      const url = await presignPut(key, input.contentType, 60 * 30);
      return { url, key };
    }),

  /** Presign an image attachment for an internal message. */
  presignMessageImage: orgProc
    .input(z.object({ filename: z.string(), contentType: z.string().default("image/jpeg") }))
    .handler(async ({ input, context }) => {
      const key = `orgs/${context.org.id}/messages/${id("mim")}-${safeName(input.filename)}`;
      const url = await presignPut(key, input.contentType);
      return { url, key };
    }),

  /** Presign a logo / business-card upload used by branded watermarks. */
  presignLogo: orgProc
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .handler(async ({ input, context }) => {
      const key = `orgs/${context.org.id}/brand/${id("logo")}-${safeName(input.filename)}`;
      const url = await presignPut(key, input.contentType);
      // SigV4 caps presigned GETs at 7 days, so a 30-day preview link threw and the upload
      // failed with a 500. The template stores the bare `key`; `publicUrl` is a short preview only.
      return { url, key, publicUrl: await presignGet(key, 60 * 60 * 12) };
    }),
};
