import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { fieldProc, isManager, orgProc, requireRole, visibleProjectIds } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id, photoCode } from "../lib/ids";
import { planOf, videoAllowance } from "../lib/plans";
import { photoUrl } from "../lib/media";
import { deleteObject, getObjectBytes } from "../lib/s3";
import { resolveClock, sha256, sign, verifySignature } from "../lib/verify";
import { burnStamp, hasFfmpeg, posterFrame } from "../lib/video";

const tagEnum = z.enum([
  "general",
  "before",
  "after",
  "issue",
  "arrival",
  "departure",
  "pickup",
  "delivery",
]);

/** Field crews capture evidence; removing it is a manager-and-above decision. */
const DELETE_DENIED = "Field members can't delete captures. Ask a manager or admin.";

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export type PhotoRow = typeof schema.photos.$inferSelect;

export async function decoratePhotos(rows: PhotoRow[]) {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      url: await photoUrl(row.storageKey),
      posterUrl: row.posterKey ? await photoUrl(row.posterKey) : null,
    })),
  );
}

/**
 * Cards show the project a capture is filed under. The photo row only carries `projectId`, so
 * without this lookup every card fell back to "Unassigned" even after the photo was filed.
 * One extra query for the whole page, not one per row.
 */
async function withProjectNames<T extends { projectId: string | null }>(rows: T[]) {
  const ids = [...new Set(rows.map((r) => r.projectId).filter((v): v is string => !!v))];
  if (ids.length === 0) return rows.map((r) => ({ ...r, projectName: null as string | null }));
  const found = await db
    .select({ id: schema.projects.id, name: schema.projects.name })
    .from(schema.projects)
    .where(inArray(schema.projects.id, ids));
  const names = new Map(found.map((p) => [p.id, p.name]));
  return rows.map((r) => ({
    ...r,
    projectName: r.projectId ? (names.get(r.projectId) ?? null) : null,
  }));
}

export const photos = {
  /** Teamspace feed — every crew photo, newest first, with filters. */
  list: orgProc
    .input(
      z
        .object({
          projectId: z.string().nullish(),
          /**
           * Personal captures: everything not filed under a project yet. Anything shot
           * without an account arrives this way, and so does a signed-in capture left on
           * "Unassigned". Kept as a filter rather than an auto-created project so it never
           * eats one of the three projects a free workspace is allowed.
           */
          unassigned: z.boolean().optional(),
          /** Split the personal page into stills and clips. */
          kind: z.enum(["photo", "video"]).optional(),
          userId: z.string().nullish(),
          tag: tagEnum.nullish(),
          search: z.string().nullish(),
          from: z.number().nullish(),
          to: z.number().nullish(),
          limit: z.number().min(1).max(200).default(60),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .handler(async ({ input, context }) => {
      const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
      const filters = [eq(schema.photos.orgId, context.org.id)];
      if (input?.projectId) filters.push(eq(schema.photos.projectId, input.projectId));
      if (input?.unassigned) filters.push(isNull(schema.photos.projectId));
      if (input?.kind) filters.push(eq(schema.photos.kind, input.kind));
      if (input?.userId) filters.push(eq(schema.photos.userId, input.userId));
      if (input?.tag) filters.push(eq(schema.photos.tag, input.tag));
      if (input?.from) filters.push(gte(schema.photos.capturedAt, new Date(input.from)));
      if (input?.to) filters.push(lte(schema.photos.capturedAt, new Date(input.to)));
      if (input?.search) {
        const term = `%${input.search.toLowerCase()}%`;
        filters.push(
          sql`(lower(coalesce(${schema.photos.address}, '')) like ${term} or lower(coalesce(${schema.photos.note}, '')) like ${term} or lower(${schema.photos.photoCode}) like ${term})`,
        );
      }
      if (allowed) {
        // A field member sees the projects they are assigned to, PLUS their own personal
        // captures — anything they shot that is not filed under a project yet, which is how
        // everything captured before signing in arrives. Never anyone else's unfiled work,
        // and note a field member with no project assignments still has a personal page,
        // so this can no longer return early on an empty assignment list.
        const own = and(
          isNull(schema.photos.projectId),
          eq(schema.photos.userId, context.user.id),
        )!;
        filters.push(
          allowed.length === 0 ? own : or(inArray(schema.photos.projectId, allowed), own)!,
        );
      }

      const where = and(...filters);
      const rows = await db
        .select()
        .from(schema.photos)
        .where(where)
        .orderBy(desc(schema.photos.capturedAt))
        .limit(input?.limit ?? 60)
        .offset(input?.offset ?? 0);
      const [total] = await db.select({ value: count() }).from(schema.photos).where(where);

      return {
        photos: await withProjectNames(await decoratePhotos(rows)),
        total: total?.value ?? 0,
      };
    }),

  get: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    const [photo] = await db
      .select()
      .from(schema.photos)
      .where(and(eq(schema.photos.id, input.id), eq(schema.photos.orgId, context.org.id)));
    if (!photo) throw new ORPCError("NOT_FOUND", { message: "Photo not found" });

    // Scope-restricted roles (field crew, drivers) may only open a photo they could already
    // see in their own feed: one filed under a project they are assigned to, or one they shot
    // themselves. Without this, knowing an id was enough to read any photo in the workspace.
    // NOT_FOUND rather than FORBIDDEN so the reply never confirms the id exists.
    const scoped = await visibleProjectIds(context.org.id, context.user.id, context.role);
    if (
      scoped &&
      photo.userId !== context.user.id &&
      !(photo.projectId && scoped.includes(photo.projectId))
    ) {
      throw new ORPCError("NOT_FOUND", { message: "Photo not found" });
    }

    const events = await db
      .select()
      .from(schema.photoEvents)
      .where(eq(schema.photoEvents.photoId, photo.id))
      .orderBy(schema.photoEvents.at);

    const [project] = photo.projectId
      ? await db.select().from(schema.projects).where(eq(schema.projects.id, photo.projectId))
      : [null];

    const [author] = await db
      .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email })
      .from(schema.user)
      .where(eq(schema.user.id, photo.userId));

    return {
      ...photo,
      url: await photoUrl(photo.storageKey),
      posterUrl: photo.posterKey ? await photoUrl(photo.posterKey) : null,
      events,
      project: project ?? null,
      author: author ?? null,
    };
  }),

  /** Register an uploaded photo. The server stamps verified time and signs the metadata. */
  create: orgProc
    .input(
      z.object({
        storageKey: z.string(),
        projectId: z.string().nullish(),
        capturedAt: z.number(),
        /**
         * serverTime - deviceTime, measured by the device against the server while
         * online. Optional so older app builds keep uploading.
         */
        clockOffsetMs: z.number().nullish(),
        /** Device clock when that offset was measured. */
        clockSyncedAt: z.number().nullish(),
        lat: z.number().nullish(),
        lng: z.number().nullish(),
        accuracyM: z.number().nullish(),
        altitudeM: z.number().nullish(),
        heading: z.number().nullish(),
        address: z.string().max(240).nullish(),
        note: z.string().max(1000).nullish(),
        tag: tagEnum.default("general"),
        assetType: z.string().max(40).nullish(),
        weather: z.string().max(60).nullish(),
        deviceModel: z.string().max(80).nullish(),
        platform: z.string().max(40).nullish(),
        templateId: z.string().nullish(),
        contentHash: z.string().max(80).nullish(),
        recipient: z.string().max(120).nullish(),
        signaturePath: z.string().max(20000).nullish(),
        signatureBox: z.string().max(40).nullish(),
        width: z.number().nullish(),
        height: z.number().nullish(),
        bytes: z.number().nullish(),
        kind: z.enum(["photo", "video"]).default("photo"),
        durationMs: z.number().nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      const plan = planOf(context.org.plan);
      if (plan.limits.photosPerMonth !== -1) {
        const [used] = await db
          .select({ value: count() })
          .from(schema.photos)
          .where(
            and(
              eq(schema.photos.orgId, context.org.id),
              gte(schema.photos.verifiedAt, startOfMonth()),
            ),
          );
        if ((used?.value ?? 0) >= plan.limits.photosPerMonth) {
          throw new ORPCError("PAYMENT_REQUIRED", {
            status: 402,
            message: `${plan.name} covers ${plan.limits.photosPerMonth} photos per month. Upgrade to keep capturing.`,
          });
        }
      }

      // Video is on every plan, but Free only inside its trial window, and clip
      // length is capped per plan.
      let burn: Awaited<ReturnType<typeof burnStamp>> | null = null;
      if (input.kind === "video") {
        const allowance = videoAllowance(plan, context.org.createdAt);
        if (!allowance.enabled) {
          throw new ORPCError("PAYMENT_REQUIRED", {
            status: 402,
            message: `Verified video on ${plan.name} runs for the first ${allowance.trialDays} days. Upgrade to keep recording clips.`,
          });
        }
        const seconds = (input.durationMs ?? 0) / 1000;
        if (seconds > allowance.maxSeconds + 1) {
          throw new ORPCError("PAYMENT_REQUIRED", {
            status: 402,
            message: `${plan.name} clips are capped at ${allowance.maxSeconds}s. This one is ${Math.round(seconds)}s.`,
          });
        }
      }

      const verifiedAt = Date.now();
      const clock = resolveClock({
        capturedAt: input.capturedAt,
        verifiedAt,
        clockOffsetMs: input.clockOffsetMs,
        clockSyncedAt: input.clockSyncedAt,
      });
      const skew = clock.skewMs;
      const code = photoCode();

      const stampData = {
        at: new Date(input.capturedAt).toISOString(),
        code,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        accuracyM: input.accuracyM ?? null,
        address: input.address ?? null,
        project: null as string | null,
        company: context.org.name,
      };

      // A clip with no poster frame leaves every gallery with nothing to draw but a black tile,
      // so when the burn-in pass fails we still try to pull frame 1 + the duration out of it.
      let salvage: { posterKey: string | null; durationMs: number | null } | null = null;
      if (input.kind === "video") {
        burn = await burnStamp(input.storageKey, stampData);
        if (!burn.burned) salvage = await posterFrame(input.storageKey);
      }

      // The content hash has to be taken from the bytes that are really in storage, read back
      // by the server after any burn-in pass rewrote them. A hash sent by the device proves
      // nothing — the client could put any string in that field — so it is a fallback only,
      // used when the object cannot be read back. Hashing happens before signing so the HMAC
      // covers it.
      const storedBytes = await getObjectBytes(input.storageKey);
      const contentHash = storedBytes ? await sha256(storedBytes) : (input.contentHash ?? null);

      const signature = await sign({
        photoCode: code,
        orgId: context.org.id,
        userId: context.user.id,
        storageKey: input.storageKey,
        capturedAt: input.capturedAt,
        verifiedAt,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        contentHash,
      });

      const [photo] = await db
        .insert(schema.photos)
        .values({
          id: id("pho"),
          orgId: context.org.id,
          userId: context.user.id,
          photoCode: code,
          storageKey: input.storageKey,
          projectId: input.projectId ?? null,
          capturedAt: new Date(input.capturedAt),
          verifiedAt: new Date(verifiedAt),
          clockSkewMs: skew,
          uploadDelayMs: clock.uploadDelayMs,
          timeSource: clock.timeSource,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          accuracyM: input.accuracyM ?? null,
          altitudeM: input.altitudeM ?? null,
          heading: input.heading ?? null,
          address: input.address ?? null,
          note: input.note ?? null,
          tag: input.tag,
          assetType: input.assetType ?? null,
          weather: input.weather ?? null,
          deviceModel: input.deviceModel ?? null,
          platform: input.platform ?? null,
          templateId: input.templateId ?? null,
          contentHash,
          recipient: input.recipient ?? null,
          signaturePath: input.signaturePath ?? null,
          signatureBox: input.signatureBox ?? null,
          width: input.width ?? null,
          height: input.height ?? null,
          bytes: burn?.bytes ?? input.bytes ?? null,
          kind: input.kind,
          durationMs: burn?.durationMs ?? salvage?.durationMs ?? input.durationMs ?? null,
          posterKey: burn?.posterKey ?? salvage?.posterKey ?? null,
          stampBurned: burn?.burned ?? false,
          stampData,
          signature,
          integrity: clock.integrity,
        })
        .returning();

      await db.insert(schema.photoEvents).values([
        {
          id: id("evt"),
          photoId: photo!.id,
          orgId: context.org.id,
          type: "captured",
          actor: context.user.name || context.user.email,
          detail: `Device clock ${new Date(input.capturedAt).toISOString()}`,
          at: new Date(input.capturedAt),
        },
        {
          id: id("evt"),
          photoId: photo!.id,
          orgId: context.org.id,
          type: "verified",
          actor: "GeoCliks server",
          detail: `Network time stamped, clock skew ${Math.round(skew / 1000)}s, upload delay ${Math.round(clock.uploadDelayMs / 1000)}s, signature ${signature.slice(0, 16)}…`,
          at: new Date(verifiedAt),
        },
      ]);

      if (input.kind === "video") {
        await db.insert(schema.photoEvents).values({
          id: id("evt"),
          photoId: photo!.id,
          orgId: context.org.id,
          type: "processed",
          actor: "GeoCliks server",
          detail: burn?.burned
            ? "Stamp burned into video pixels (ffmpeg) and poster frame extracted"
            : salvage?.posterKey
              ? `Stamp kept as signed metadata and rendered at playback, poster frame extracted (${burn?.reason ?? "unprocessed"})`
              : `Stamp kept as signed metadata and rendered at playback (${burn?.reason ?? "unprocessed"})`,
          at: new Date(),
        });
      }

      return {
        ...photo!,
        url: await photoUrl(photo!.storageKey),
        posterUrl: photo!.posterKey ? await photoUrl(photo!.posterKey) : null,
      };
    }),

  /**
   * What this workspace may record right now, and whether the stored file itself
   * will carry the burned-in stamp or an overlay rendered at playback.
   */
  videoPolicy: orgProc.handler(async ({ context }) => {
    const plan = planOf(context.org.plan);
    const allowance = videoAllowance(plan, context.org.createdAt);
    return {
      ...allowance,
      planName: plan.name,
      /** true = the stamp is burned into the pixels of stored clips. */
      burnsStamp: await hasFfmpeg(),
    };
  }),

  /** Re-check the signature chain for a photo and record the audit event. */
  verify: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    const [photo] = await db
      .select()
      .from(schema.photos)
      .where(and(eq(schema.photos.id, input.id), eq(schema.photos.orgId, context.org.id)));
    if (!photo) throw new ORPCError("NOT_FOUND");

    const ok = await verifySignature(
      {
        photoCode: photo.photoCode,
        orgId: photo.orgId,
        userId: photo.userId,
        storageKey: photo.storageKey,
        capturedAt: photo.capturedAt.getTime(),
        verifiedAt: photo.verifiedAt.getTime(),
        lat: photo.lat,
        lng: photo.lng,
        contentHash: photo.contentHash,
      },
      photo.signature,
    );

    await db.insert(schema.photoEvents).values({
      id: id("evt"),
      photoId: photo.id,
      orgId: context.org.id,
      type: "verified",
      actor: context.user.name || context.user.email,
      detail: ok ? "Signature match — metadata intact" : "Signature mismatch — metadata altered",
    });

    return {
      ok,
      photoCode: photo.photoCode,
      contentHash: photo.contentHash,
      signature: photo.signature,
      capturedAt: photo.capturedAt,
      verifiedAt: photo.verifiedAt,
      clockSkewMs: photo.clockSkewMs,
      timeSource: photo.timeSource,
    };
  }),

  update: fieldProc
    .input(
      z.object({
        id: z.string(),
        projectId: z.string().nullish(),
        note: z.string().max(1000).nullish(),
        tag: tagEnum.optional(),
        assetType: z.string().max(40).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { id: photoId, ...patch } = input;
      const [photo] = await db
        .update(schema.photos)
        .set(patch)
        .where(and(eq(schema.photos.id, photoId), eq(schema.photos.orgId, context.org.id)))
        .returning();
      if (!photo) throw new ORPCError("NOT_FOUND");
      return photo;
    }),

  move: fieldProc
    .input(z.object({ ids: z.array(z.string()).min(1), projectId: z.string().nullable() }))
    .handler(async ({ input, context }) => {
      await db
        .update(schema.photos)
        .set({ projectId: input.projectId })
        .where(and(eq(schema.photos.orgId, context.org.id), inArray(schema.photos.id, input.ids)));
      return { moved: input.ids.length };
    }),

  /**
   * Delete one capture (still or clip) with its stored bytes.
   * Field crews can never delete — evidence they shot has to survive them changing their mind.
   * Managers can delete what they shot; admins and owners can delete anything in the
   * workspace. Demo photos live in the web bundle, so their keys are never touched.
   */
  remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    // Field crew and dispatchers can never delete evidence - a dispatcher runs the delivery
    // board, which is not the same authority as destroying proof of work.
    if (!isManager(context.role)) throw new ORPCError("FORBIDDEN", { message: DELETE_DENIED });
    const [photo] = await db
      .select()
      .from(schema.photos)
      .where(and(eq(schema.photos.id, input.id), eq(schema.photos.orgId, context.org.id)))
      .limit(1);
    if (!photo) throw new ORPCError("NOT_FOUND");
    if (photo.userId !== context.user.id) requireRole(context.role, "admin");

    await db.delete(schema.photoEvents).where(eq(schema.photoEvents.photoId, input.id));
    await db.delete(schema.photos).where(eq(schema.photos.id, input.id));

    if (!photo.storageKey.startsWith("/")) {
      await deleteObject(photo.storageKey);
      if (photo.posterKey) await deleteObject(photo.posterKey);
    }
    return { ok: true, kind: photo.kind };
  }),

  /** Bulk delete from the teamspace grid, same permission rule per photo. */
  removeMany: orgProc
    .input(z.object({ ids: z.array(z.string()).min(1).max(200) }))
    .handler(async ({ input, context }) => {
      if (!isManager(context.role)) throw new ORPCError("FORBIDDEN", { message: DELETE_DENIED });
      const rows = await db
        .select()
        .from(schema.photos)
        .where(and(eq(schema.photos.orgId, context.org.id), inArray(schema.photos.id, input.ids)));

      let deleted = 0;
      let skipped = 0;
      for (const photo of rows) {
        if (
          photo.userId !== context.user.id &&
          context.role !== "admin" &&
          context.role !== "owner"
        ) {
          skipped += 1;
          continue;
        }
        await db.delete(schema.photoEvents).where(eq(schema.photoEvents.photoId, photo.id));
        await db.delete(schema.photos).where(eq(schema.photos.id, photo.id));
        if (!photo.storageKey.startsWith("/")) {
          await deleteObject(photo.storageKey);
          if (photo.posterKey) await deleteObject(photo.posterKey);
        }
        deleted += 1;
      }
      return { deleted, skipped };
    }),

  /** Map pins for the dashboard map view. */
  map: fieldProc
    .input(z.object({ projectId: z.string().nullish() }).optional())
    .handler(async ({ input, context }) => {
      // Field crews only see pins from the projects they are assigned to — same rule the
      // Teamspace feed and the project list use, so the map can't leak other jobs' locations.
      const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
      const filters = [eq(schema.photos.orgId, context.org.id)];
      if (input?.projectId) filters.push(eq(schema.photos.projectId, input.projectId));
      if (allowed) {
        if (allowed.length === 0) return [];
        filters.push(inArray(schema.photos.projectId, allowed));
      }
      const rows = await db
        .select({
          id: schema.photos.id,
          lat: schema.photos.lat,
          lng: schema.photos.lng,
          address: schema.photos.address,
          photoCode: schema.photos.photoCode,
          capturedAt: schema.photos.capturedAt,
          tag: schema.photos.tag,
          assetType: schema.photos.assetType,
          projectId: schema.photos.projectId,
          storageKey: schema.photos.storageKey,
          userId: schema.photos.userId,
          userName: schema.user.name,
        })
        .from(schema.photos)
        .leftJoin(schema.user, eq(schema.user.id, schema.photos.userId))
        .where(and(...filters))
        .orderBy(desc(schema.photos.capturedAt))
        .limit(400);
      return Promise.all(
        rows
          .filter((r) => r.lat != null && r.lng != null)
          .map(async (r) => ({ ...r, url: await photoUrl(r.storageKey) })),
      );
    }),

  /** Dashboard headline stats. */
  stats: fieldProc.handler(async ({ context }) => {
    // A field member's counters cover the projects they are assigned to, never the whole
    // workspace — otherwise the Teamspace tiles leak how much work exists on other jobs.
    const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
    if (allowed && allowed.length === 0) {
      return {
        photos: 0,
        verified: 0,
        contributors: 0,
        located: 0,
        photosThisMonth: 0,
        byDay: [] as { day: string; value: number }[],
      };
    }
    const scope = allowed ? [inArray(schema.photos.projectId, allowed)] : [];

    const [totals] = await db
      .select({
        photos: count(),
        verified: sql<number>`sum(case when ${schema.photos.integrity} = 'verified' then 1 else 0 end)`,
        contributors: sql<number>`count(distinct ${schema.photos.userId})`,
        located: sql<number>`sum(case when ${schema.photos.lat} is not null then 1 else 0 end)`,
      })
      .from(schema.photos)
      .where(and(eq(schema.photos.orgId, context.org.id), ...scope));

    const [thisMonth] = await db
      .select({ value: count() })
      .from(schema.photos)
      .where(
        and(
          eq(schema.photos.orgId, context.org.id),
          gte(schema.photos.verifiedAt, startOfMonth()),
          ...scope,
        ),
      );

    const byDay = await db
      .select({
        day: sql<string>`date(${schema.photos.capturedAt} / 1000, 'unixepoch')`,
        value: count(),
      })
      .from(schema.photos)
      .where(and(eq(schema.photos.orgId, context.org.id), ...scope))
      .groupBy(sql`date(${schema.photos.capturedAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${schema.photos.capturedAt} / 1000, 'unixepoch') desc`)
      .limit(14);

    return {
      photos: totals?.photos ?? 0,
      verified: Number(totals?.verified ?? 0),
      contributors: Number(totals?.contributors ?? 0),
      located: Number(totals?.located ?? 0),
      photosThisMonth: thisMonth?.value ?? 0,
      byDay: byDay.reverse(),
    };
  }),

  comparisons: {
    list: orgProc
      .input(z.object({ projectId: z.string().nullish() }).optional())
      .handler(async ({ input, context }) => {
        const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
        const filters = [eq(schema.comparisons.orgId, context.org.id)];
        if (input?.projectId) filters.push(eq(schema.comparisons.projectId, input.projectId));
        const rows = await db
          .select()
          .from(schema.comparisons)
          .where(and(...filters))
          .orderBy(desc(schema.comparisons.createdAt));

        // The card header shows which job a pair belongs to, so resolve the project names here
        // rather than making the client fetch the project list just to label a row.
        const projectRows = await db
          .select({ id: schema.projects.id, name: schema.projects.name })
          .from(schema.projects)
          .where(eq(schema.projects.orgId, context.org.id));
        const projectNames = new Map(projectRows.map((p) => [p.id, p.name]));

        const decorated = await Promise.all(
          rows.map(async (row) => {
            const [before] = await db
              .select()
              .from(schema.photos)
              .where(eq(schema.photos.id, row.beforePhotoId));
            const [after] = await db
              .select()
              .from(schema.photos)
              .where(eq(schema.photos.id, row.afterPhotoId));
            const projectId = row.projectId ?? before?.projectId ?? after?.projectId ?? null;
            return {
              ...row,
              projectName: projectId ? (projectNames.get(projectId) ?? null) : null,
              before: before ? { ...before, url: await photoUrl(before.storageKey) } : null,
              after: after ? { ...after, url: await photoUrl(after.storageKey) } : null,
            };
          }),
        );

        // Before/after pairs are evidence like any other capture: a field member only sees the
        // ones built from projects they are assigned to, on both sides of the pair.
        if (!allowed) return decorated;
        const visibleProjects = new Set(allowed);
        return decorated.filter((row) => {
          const beforeProject = row.before?.projectId;
          const afterProject = row.after?.projectId;
          return Boolean(
            beforeProject &&
            afterProject &&
            visibleProjects.has(beforeProject) &&
            visibleProjects.has(afterProject),
          );
        });
      }),

    create: orgProc
      .input(
        z.object({
          title: z.string().min(1).max(90),
          projectId: z.string().nullish(),
          beforePhotoId: z.string(),
          afterPhotoId: z.string(),
        }),
      )
      .handler(async ({ input, context }) => {
        // Guard the write too, so a hand-crafted request cannot pin a photo from a project the
        // caller is not assigned to into a comparison they would then be allowed to read.
        const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
        if (allowed) {
          const visibleProjects = new Set(allowed);
          const picks = await db
            .select({ id: schema.photos.id, projectId: schema.photos.projectId })
            .from(schema.photos)
            .where(
              and(
                eq(schema.photos.orgId, context.org.id),
                inArray(schema.photos.id, [input.beforePhotoId, input.afterPhotoId]),
              ),
            );
          const ok = picks
            .filter((p) => p.projectId && visibleProjects.has(p.projectId))
            .map((p) => p.id);
          if (!ok.includes(input.beforePhotoId) || !ok.includes(input.afterPhotoId)) {
            throw new ORPCError("FORBIDDEN", {
              message: "You can only compare photos from projects you are assigned to.",
            });
          }
        }
        const [row] = await db
          .insert(schema.comparisons)
          .values({ id: id("cmp"), orgId: context.org.id, createdBy: context.user.id, ...input })
          .returning();
        return row;
      }),

    remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
      if (allowed) {
        // A field member can only delete a comparison they are allowed to see in the first place.
        const [target] = await db
          .select()
          .from(schema.comparisons)
          .where(
            and(eq(schema.comparisons.id, input.id), eq(schema.comparisons.orgId, context.org.id)),
          );
        if (!target) return { ok: true };
        const visibleProjects = new Set(allowed);
        const picks = await db
          .select({ projectId: schema.photos.projectId })
          .from(schema.photos)
          .where(inArray(schema.photos.id, [target.beforePhotoId, target.afterPhotoId]));
        if (picks.some((p) => !p.projectId || !visibleProjects.has(p.projectId))) {
          throw new ORPCError("FORBIDDEN", {
            message: "This before/after belongs to a project you are not assigned to.",
          });
        }
      }
      await db
        .delete(schema.comparisons)
        .where(
          and(eq(schema.comparisons.id, input.id), eq(schema.comparisons.orgId, context.org.id)),
        );
      return { ok: true };
    }),
  },
};
