import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { orgProc, requireRole } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";

/**
 * Office notes — the right-hand panel on both dashboards.
 *
 * Gated at `dispatcher` and above on every endpoint, read included. A note holds a customer's
 * phone number, address and email, so a field member or driver must not be able to list them
 * even though they are members of the workspace. `requireRole(role, "dispatcher")` is the
 * server-side twin of `canUseNotes` on the client — the client check only hides the panel.
 */

const boardEnum = z.enum(["field", "delivery"]);

/** Trim to null: an empty contact field should be absent, not an empty string. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const writeInput = {
  board: boardEnum,
  title: z.string().trim().min(1).max(200),
  body: optionalText(4000),
  /** YYYY-MM-DD, local to whoever typed it — no timezone maths on a date someone picked. */
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .transform((v) => v ?? null),
  address: optionalText(400),
  contactName: optionalText(200),
  contactPhone: optionalText(60),
  contactEmail: z
    .string()
    .trim()
    .max(320)
    .optional()
    .transform((v) => (v ? v : null)),
};

/** The one place a note is fetched by id and proven to belong to this workspace. */
async function ownedNote(noteId: string, orgId: string) {
  const [row] = await db
    .select()
    .from(schema.notes)
    .where(and(eq(schema.notes.id, noteId), eq(schema.notes.orgId, orgId)))
    .limit(1);
  if (!row) throw new ORPCError("NOT_FOUND", { message: "Note not found" });
  return row;
}

export const notes = {
  list: orgProc
    .input(
      z.object({
        board: boardEnum,
        /** Archived notes are out of the way by default but never destroyed. */
        status: z.enum(["open", "archived"]).default("open"),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "dispatcher");

      const rows = await db
        .select({
          id: schema.notes.id,
          board: schema.notes.board,
          title: schema.notes.title,
          body: schema.notes.body,
          dueDate: schema.notes.dueDate,
          address: schema.notes.address,
          contactName: schema.notes.contactName,
          contactPhone: schema.notes.contactPhone,
          contactEmail: schema.notes.contactEmail,
          status: schema.notes.status,
          createdBy: schema.notes.createdBy,
          createdAt: schema.notes.createdAt,
          authorName: schema.user.name,
        })
        .from(schema.notes)
        .leftJoin(schema.user, eq(schema.user.id, schema.notes.createdBy))
        .where(
          and(
            eq(schema.notes.orgId, context.org.id),
            eq(schema.notes.board, input.board),
            eq(schema.notes.status, input.status),
          ),
        )
        // Dated notes first and soonest-first, because a note with a date is a commitment.
        // Undated ones fall to the bottom, newest first.
        .orderBy(
          asc(schema.notes.dueDate),
          desc(schema.notes.createdAt),
        )
        .limit(200);

      // SQLite sorts NULL before every value, which would put undated notes on top. Re-split
      // here rather than in SQL so the query stays index-friendly.
      const dated = rows.filter((r) => r.dueDate);
      const undated = rows.filter((r) => !r.dueDate);
      return [...dated, ...undated];
    }),

  create: orgProc
    .input(z.object(writeInput))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "dispatcher");

      const row = {
        id: id("note"),
        orgId: context.org.id,
        board: input.board,
        title: input.title,
        body: input.body,
        dueDate: input.dueDate,
        address: input.address,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        status: "open" as const,
        createdBy: context.user.id,
      };
      await db.insert(schema.notes).values(row);
      return { id: row.id };
    }),

  update: orgProc
    .input(z.object({ id: z.string(), ...writeInput }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "dispatcher");
      await ownedNote(input.id, context.org.id);

      await db
        .update(schema.notes)
        .set({
          board: input.board,
          title: input.title,
          body: input.body,
          dueDate: input.dueDate,
          address: input.address,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          updatedAt: new Date(),
        })
        .where(eq(schema.notes.id, input.id));
      return { ok: true };
    }),

  /** Archive or restore. The row survives either way — only `remove` destroys anything. */
  setStatus: orgProc
    .input(z.object({ id: z.string(), status: z.enum(["open", "archived"]) }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "dispatcher");
      await ownedNote(input.id, context.org.id);

      await db
        .update(schema.notes)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(schema.notes.id, input.id));
      return { ok: true };
    }),

  /**
   * Hard delete, manager and above. A dispatcher can write and archive a note but not destroy
   * one — same shape as routes, where running a run is dispatcher work and deleting it is not.
   */
  remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    requireRole(context.role, "manager");
    await ownedNote(input.id, context.org.id);

    await db.delete(schema.notes).where(eq(schema.notes.id, input.id));
    return { ok: true };
  }),
};
