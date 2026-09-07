import { z } from "zod";
import { and, count, eq, gte } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { orgProc, requireRole } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { planOf } from "../lib/plans";
import { LOCALE_CODES } from "../lib/locales";
import { avatarUrl } from "./account";
import { defaultOrgName } from "../lib/workspaces";

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
        and(
          eq(schema.photos.orgId, context.org.id),
          gte(schema.photos.verifiedAt, startOfMonth()),
        ),
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
      org: context.org,
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
      return org;
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
   * Watermark templates are workspace-wide branding: field crews capture with them, but only
   * manager and above may create, edit, promote or delete one.
   */
  templates: {
    list: orgProc.handler(({ context }) =>
      db
        .select()
        .from(schema.watermarkTemplates)
        .where(eq(schema.watermarkTemplates.orgId, context.org.id)),
    ),

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
        requireRole(context.role, "manager");
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
        return tpl;
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
        requireRole(context.role, "manager");
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
        return tpl;
      }),

    setDefault: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      await db
        .update(schema.watermarkTemplates)
        .set({ isDefault: false })
        .where(eq(schema.watermarkTemplates.orgId, context.org.id));
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
      return tpl;
    }),

    remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      await db
        .delete(schema.watermarkTemplates)
        .where(
          and(
            eq(schema.watermarkTemplates.id, input.id),
            eq(schema.watermarkTemplates.orgId, context.org.id),
          ),
        );
      return { ok: true };
    }),
  },
};
