import { z } from "zod";
import { and, asc, count, eq, gte, ne } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { orgProc, requireRole } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { planOf } from "../lib/plans";
import { LOCALE_CODES } from "../lib/locales";
import { avatarUrl, brandLogoUrl } from "./account";
import { defaultOrgName } from "../lib/workspaces";

/**
 * One logo, two places to set it. A logo uploaded on a watermark template is also the business
 * logo, so it turns up in profile settings and in both menus without a second upload. Clearing a
 * template's logo deliberately does NOT clear the workspace one: dropping it from one stamp
 * should not wipe the business identity everywhere.
 */
async function syncOrgLogo(orgId: string, logoUrl: string | null | undefined) {
  if (!logoUrl) return;
  await db.update(schema.organizations).set({ logoUrl }).where(eq(schema.organizations.id, orgId));
}

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const orgs = {
  /** Workspace bootstrap for every client: org, role, plan limits and usage counters. */
  current: orgProc.handler(async ({ context }) => {
    const [photoCount] = await db
      .select({ value: count() })
      .from(schema.photos)
      .where(eq(schema.photos.orgId, context.org.id));
    const [monthCount] = await db
      .select({ value: count() })
      .from(schema.photos)
      .where(
        and(eq(schema.photos.orgId, context.org.id), gte(schema.photos.verifiedAt, startOfMonth())),
      );
    const [projectCount] = await db
      .select({ value: count() })
      .from(schema.projects)
      .where(eq(schema.projects.orgId, context.org.id));
    const [memberCount] = await db
      .select({ value: count() })
      .from(schema.members)
      .where(eq(schema.members.orgId, context.org.id));

    return {
      // The column holds a bare storage key; clients get a freshly minted link, never the key.
      org: { ...context.org, logoUrl: await brandLogoUrl(context.org.logoUrl) },
      role: context.role,
      /** Still on the auto-provisioned name: the UI offers to set the business name once. */
      needsName: context.org.name === defaultOrgName(context.user),
      user: {
        id: context.user.id,
        name: context.user.name,
        email: context.user.email,
        image: await avatarUrl(context.user.image),
      },
      plan: planOf(context.org.plan),
      usage: {
        photos: photoCount?.value ?? 0,
        photosThisMonth: monthCount?.value ?? 0,
        projects: projectCount?.value ?? 0,
        members: memberCount?.value ?? 0,
      },
    };
  }),

  update: orgProc
    .input(
      z.object({
        name: z.string().min(2).max(80).optional(),
        industry: z.string().max(60).nullish(),
        logoUrl: z.string().nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      const [org] = await db
        .update(schema.organizations)
        .set(input)
        .where(eq(schema.organizations.id, context.org.id))
        .returning();
      if (!org) return org;
      return { ...org, logoUrl: await brandLogoUrl(org.logoUrl) };
    }),

  /**
   * Workspace-wide appearance defaults. Admins set the fallback every member starts from;
   * each member can still override theme and language on their own device (stored client-side).
   */
  setAppearance: orgProc
    .input(
      z.object({
        theme: z.enum(["light", "dark"]).optional(),
        locale: z.enum(LOCALE_CODES).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      const [org] = await db
        .update(schema.organizations)
        .set(input)
        .where(eq(schema.organizations.id, context.org.id))
        .returning();
      return { theme: org?.theme ?? "light", locale: org?.locale ?? "en" };
    }),

  /**
   * Watermark templates are workspace-wide branding.
   *
   * `list` stays open to EVERY role on purpose: the camera reads the template to stamp the
   * photo, so gating it would break capture for field crews and for a driver's proof of
   * delivery. Only the workspace owner and admins may create, edit, promote or delete one.
   */
  templates: {
    list: orgProc.handler(async ({ context }) => {
      const rows = await db
        .select()
        .from(schema.watermarkTemplates)
        .where(eq(schema.watermarkTemplates.orgId, context.org.id))
        // Fixed order so the mobile camera's "first template" fallback is always the same row.
        .orderBy(asc(schema.watermarkTemplates.createdAt), asc(schema.watermarkTemplates.id));
      return Promise.all(
        rows.map(async (row) => ({ ...row, logoUrl: await brandLogoUrl(row.logoUrl) })),
      );
    }),

    create: orgProc
      .input(
        z.object({
          name: z.string().min(1).max(40),
          layout: z.enum(["classic", "compact", "detailed", "branded"]).default("classic"),
          accentColor: z.string().default("#FFB021"),
          showLogo: z.boolean().default(false),
          logoUrl: z.string().nullish(),
          companyLine: z.string().max(80).nullish(),
          fields: z.array(z.string()).default(["time", "coords", "address", "project"]),
        }),
      )
      .handler(async ({ input, context }) => {
        requireRole(context.role, "admin");
        const plan = planOf(context.org.plan);
        const existing = await db
          .select({ value: count() })
          .from(schema.watermarkTemplates)
          .where(eq(schema.watermarkTemplates.orgId, context.org.id));
        const used = existing[0]?.value ?? 0;
        if (plan.limits.templates !== -1 && used >= plan.limits.templates) {
          throw new ORPCError("PAYMENT_REQUIRED", {
            status: 402,
            message: `${plan.name} includes ${plan.limits.templates} watermark templates. Upgrade for unlimited.`,
          });
        }
        const [tpl] = await db
          .insert(schema.watermarkTemplates)
          .values({ id: id("tpl"), orgId: context.org.id, ...input })
          .returning();
        await syncOrgLogo(context.org.id, input.logoUrl);
        if (!tpl) return tpl;
        return { ...tpl, logoUrl: await brandLogoUrl(tpl.logoUrl) };
      }),

    update: orgProc
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).max(40).optional(),
          layout: z.enum(["classic", "compact", "detailed", "branded"]).optional(),
          accentColor: z.string().optional(),
          showLogo: z.boolean().optional(),
          logoUrl: z.string().nullish(),
          companyLine: z.string().max(80).nullish(),
          fields: z.array(z.string()).optional(),
        }),
      )
      .handler(async ({ input, context }) => {
        requireRole(context.role, "admin");
        const { id: templateId, ...patch } = input;
        const [tpl] = await db
          .update(schema.watermarkTemplates)
          .set(patch)
          .where(
            and(
              eq(schema.watermarkTemplates.id, templateId),
              eq(schema.watermarkTemplates.orgId, context.org.id),
            ),
          )
          .returning();
        if (!tpl) throw new ORPCError("NOT_FOUND");
        await syncOrgLogo(context.org.id, patch.logoUrl);
        return { ...tpl, logoUrl: await brandLogoUrl(tpl.logoUrl) };
      }),

    setDefault: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      // Promote first, demote second. The reverse order used to clear every flag before learning
      // the target did not exist, which left the workspace with no default at all and silently
      // handed the crew whichever template happened to sort first.
      const [tpl] = await db
        .update(schema.watermarkTemplates)
        .set({ isDefault: true })
        .where(
          and(
            eq(schema.watermarkTemplates.id, input.id),
            eq(schema.watermarkTemplates.orgId, context.org.id),
          ),
        )
        .returning();
      if (!tpl) throw new ORPCError("NOT_FOUND");
      await db
        .update(schema.watermarkTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(schema.watermarkTemplates.orgId, context.org.id),
            ne(schema.watermarkTemplates.id, input.id),
          ),
        );
      return tpl;
    }),

    remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      // A delete that matched nothing used to answer { ok: true }, so a stale tab reported success
      // for a row that was already gone. Report NOT_FOUND and let the client refresh its list.
      const deleted = await db
        .delete(schema.watermarkTemplates)
        .where(
          and(
            eq(schema.watermarkTemplates.id, input.id),
            eq(schema.watermarkTemplates.orgId, context.org.id),
          ),
        )
        .returning({ id: schema.watermarkTemplates.id });
      if (!deleted.length) throw new ORPCError("NOT_FOUND");
      return { ok: true };
    }),
  },
};
