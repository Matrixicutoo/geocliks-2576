import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { db } from "../database";
import * as schema from "../database/schema";
import { logAdmin, requireSuperadmin, staffProc } from "../middleware/auth";
import { SITE_SETTINGS_ID, loadSocialLinks } from "./site";

/**
 * Either empty (icon hidden) or an absolute http(s) URL. Rejecting anything else
 * keeps `javascript:` and other scheme injections out of a link rendered on a
 * public page.
 */
const socialUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), {
    message: "Must be empty or start with https://",
  });

const socialsInput = z.object({
  facebookUrl: socialUrl,
  instagramUrl: socialUrl,
  linkedinUrl: socialUrl,
  youtubeUrl: socialUrl,
  xUrl: socialUrl,
});

/** Company-wide marketing-site settings. Superadmin only — this edits the public site. */
export const adminSite = {
  socials: staffProc.handler(async () => loadSocialLinks()),

  updateSocials: staffProc.input(socialsInput).handler(async ({ input, context }) => {
    requireSuperadmin(context.staffRole);
    try {
      await db
        .insert(schema.siteSettings)
        .values({ id: SITE_SETTINGS_ID, ...input, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: schema.siteSettings.id,
          set: { ...input, updatedAt: new Date() },
        });
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: error instanceof Error ? error.message : "Could not save site settings",
      });
    }
    const shown = Object.entries(input)
      .filter(([, value]) => value !== "")
      .map(([key]) => key.replace("Url", ""));
    await logAdmin(
      context.actor.id,
      "site.socials",
      SITE_SETTINGS_ID,
      shown.length ? shown.join(", ") : "all hidden",
    );
    return loadSocialLinks();
  }),
};
