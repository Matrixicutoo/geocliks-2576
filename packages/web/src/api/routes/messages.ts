import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";
import { orgProc, requireRole, visibleTeammates } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { photoUrl } from "../lib/media";
import { sendPush } from "../lib/push";
import { reportEmail } from "../services/email-templates";
import { avatarUrl } from "./account";

/**
 * Internal messaging between members of the same workspace.
 *
 * Every conversation is a 1:1 pair, stored with its two member ids canonically ordered so
 * "message this person" always resolves to the same row whoever opens it first. A manager can
 * broadcast to the whole crew: that fans out into the individual 1:1 threads instead of creating
 * a group room, so a reply always lands back with the sender.
 *
 * Nothing here trusts a client-supplied id: the conversation must belong to the caller's
 * workspace AND the caller must be one of its two participants. Image attachments follow the
 * same rule as captures — the storage key never leaves the server, clients get a signed URL.
 */

const pair = (a: string, b: string) => (a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a });

const PREVIEW_MAX = 120;

function preview(body: string, hasImage: boolean, hasPhoto: boolean): string {
  const text = body.trim();
  if (text) return text.slice(0, PREVIEW_MAX);
  if (hasPhoto) return "[capture]";
  if (hasImage) return "[image]";
  return "";
}

/** Load a conversation the caller is actually allowed to read, or throw. */
async function participantConversation(conversationId: string, orgId: string, userId: string) {
  const [row] = await db
    .select()
    .from(schema.conversations)
    .where(
      and(eq(schema.conversations.id, conversationId), eq(schema.conversations.orgId, orgId)),
    )
    .limit(1);
  if (!row) throw new ORPCError("NOT_FOUND", { message: "Conversation not found" });
  if (row.userAId !== userId && row.userBId !== userId) throw new ORPCError("FORBIDDEN");
  return row;
}

/** Members of the workspace, minus the caller — the address book for a new thread. */
async function orgContacts(orgId: string, exceptUserId: string) {
  return db
    .select({
      userId: schema.members.userId,
      role: schema.members.role,
      title: schema.members.title,
      name: schema.user.name,
      email: schema.user.email,
      image: schema.user.image,
    })
    .from(schema.members)
    .leftJoin(schema.user, eq(schema.user.id, schema.members.userId))
    .where(and(eq(schema.members.orgId, orgId), ne(schema.members.userId, exceptUserId)));
}

/** Find or create the canonical thread between two members of a workspace. */
async function ensureConversation(orgId: string, me: string, other: string) {
  if (me === other) throw new ORPCError("BAD_REQUEST", { message: "Cannot message yourself" });
  const [member] = await db
    .select({ id: schema.members.id })
    .from(schema.members)
    .where(and(eq(schema.members.orgId, orgId), eq(schema.members.userId, other)))
    .limit(1);
  if (!member) throw new ORPCError("NOT_FOUND", { message: "Not a member of this workspace" });

  const ends = pair(me, other);
  const [existing] = await db
    .select()
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.orgId, orgId),
        eq(schema.conversations.userAId, ends.userAId),
        eq(schema.conversations.userBId, ends.userBId),
      ),
    )
    .limit(1);
  if (existing) return existing;

  await db
    .insert(schema.conversations)
    .values({ id: id("cnv"), orgId, ...ends })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.orgId, orgId),
        eq(schema.conversations.userAId, ends.userAId),
        eq(schema.conversations.userBId, ends.userBId),
      ),
    )
    .limit(1);
  if (!row) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Conversation failed" });
  return row;
}

/** Read cursors for the caller across the given conversations. */
async function readCursors(conversationIds: string[], userId: string) {
  if (conversationIds.length === 0) return new Map<string, Date>();
  const rows = await db
    .select()
    .from(schema.messageReads)
    .where(
      and(
        eq(schema.messageReads.userId, userId),
        inArray(schema.messageReads.conversationId, conversationIds),
      ),
    );
  return new Map(rows.map((r) => [r.conversationId, r.lastReadAt]));
}

async function unreadPerConversation(conversationIds: string[], userId: string) {
  const cursors = await readCursors(conversationIds, userId);
  const counts = new Map<string, number>();
  if (conversationIds.length === 0) return counts;
  const rows = await db
    .select({
      conversationId: schema.messages.conversationId,
      createdAt: schema.messages.createdAt,
      senderId: schema.messages.senderId,
    })
    .from(schema.messages)
    .where(inArray(schema.messages.conversationId, conversationIds));
  for (const row of rows) {
    if (row.senderId === userId) continue;
    const cursor = cursors.get(row.conversationId);
    if (cursor && row.createdAt.getTime() <= cursor.getTime()) continue;
    counts.set(row.conversationId, (counts.get(row.conversationId) ?? 0) + 1);
  }
  return counts;
}

/**
 * Is there a block in either direction between these two members?
 *
 * Enforcement is symmetric on purpose (see `memberBlocks` in the schema): whoever pressed the
 * button, the thread goes quiet for both of them rather than leaving one side shouting into it.
 */
async function blockBetween(orgId: string, me: string, other: string) {
  const rows = await db
    .select({ blockerId: schema.memberBlocks.blockerId })
    .from(schema.memberBlocks)
    .where(
      and(
        eq(schema.memberBlocks.orgId, orgId),
        or(
          and(
            eq(schema.memberBlocks.blockerId, me),
            eq(schema.memberBlocks.blockedId, other),
          ),
          and(
            eq(schema.memberBlocks.blockerId, other),
            eq(schema.memberBlocks.blockedId, me),
          ),
        ),
      ),
    );
  return {
    /** The caller blocked them — undoable from the same menu. */
    byMe: rows.some((r) => r.blockerId === me),
    /** They blocked the caller. Not disclosed as such to the client, only as "cannot send". */
    byThem: rows.some((r) => r.blockerId === other),
    any: rows.length > 0,
  };
}

/** Record a block, idempotently — pressing it twice is not an error. */
async function blockMember(orgId: string, blockerId: string, blockedId: string) {
  const [member] = await db
    .select({ id: schema.members.id })
    .from(schema.members)
    .where(and(eq(schema.members.orgId, orgId), eq(schema.members.userId, blockedId)))
    .limit(1);
  if (!member) throw new ORPCError("NOT_FOUND", { message: "Not a member of this workspace" });
  await db
    .insert(schema.memberBlocks)
    .values({ id: id("blk"), orgId, blockerId, blockedId })
    .onConflictDoNothing();
}

/** The reasons a report can carry. Kept short and mutually exclusive, like Apple's own sheet. */
const REPORT_REASONS = [
  "harassment",
  "spam",
  "inappropriate",
  "threat",
  "other",
] as const;

/** Push to every device of the recipients, best effort — never blocks the send. */
async function notify(userIds: string[], title: string, body: string, conversationId: string) {
  if (userIds.length === 0) return;
  const rows = await db
    .select({ token: schema.pushTokens.token })
    .from(schema.pushTokens)
    .where(inArray(schema.pushTokens.userId, userIds));
  await sendPush(
    rows.map((r) => r.token),
    { title, body, data: { kind: "message", conversationId } },
  );
}

export const messages = {
  /** Everyone in the workspace the caller can start or continue a thread with. */
  contacts: orgProc.handler(async ({ context }) => {
    const people = await orgContacts(context.org.id, context.user.id);
    // Same rule as the Team page: a field member can only chat with people assigned to the same
    // projects. Supervisors included, but only when they are on one of those projects too.
    // A driver has no projects, so the same call hands back his office instead — the dispatcher
    // who invited him and whoever assigns his routes — which is exactly who he needs to reach.
    const teammates = await visibleTeammates(context.org.id, context.user.id, context.role);
    const allowed = teammates
      ? people.filter((person) => teammates.userIds.has(person.userId))
      : people;
    // Anyone on either side of a block drops out of the "new message" picker — starting a
    // thread you cannot send into is a dead end. The existing thread stays in the list, which
    // is where Unblock lives.
    const muted = await db
      .select({
        blockerId: schema.memberBlocks.blockerId,
        blockedId: schema.memberBlocks.blockedId,
      })
      .from(schema.memberBlocks)
      .where(
        and(
          eq(schema.memberBlocks.orgId, context.org.id),
          or(
            eq(schema.memberBlocks.blockerId, context.user.id),
            eq(schema.memberBlocks.blockedId, context.user.id),
          ),
        ),
      );
    const mutedIds = new Set(
      muted.map((row) => (row.blockerId === context.user.id ? row.blockedId : row.blockerId)),
    );
    const visible = allowed.filter((person) => !mutedIds.has(person.userId));
    // `user.image` is a bare storage key. Sign it here, like every other read of an avatar, so
    // the address book can show faces instead of a broken-image glyph.
    return Promise.all(
      visible.map(async (person) => ({ ...person, image: await avatarUrl(person.image) })),
    );
  }),

  /** The caller's threads, newest activity first, with unread counts. */
  list: orgProc.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.orgId, context.org.id),
          or(
            eq(schema.conversations.userAId, context.user.id),
            eq(schema.conversations.userBId, context.user.id),
          ),
        ),
      )
      .orderBy(desc(schema.conversations.lastMessageAt));

    const otherIds = rows.map((r) => (r.userAId === context.user.id ? r.userBId : r.userAId));
    const people =
      otherIds.length === 0
        ? []
        : await db
            .select({
              id: schema.user.id,
              name: schema.user.name,
              email: schema.user.email,
              image: schema.user.image,
            })
            .from(schema.user)
            .where(inArray(schema.user.id, otherIds));
    const byId = new Map(people.map((p) => [p.id, p]));
    const memberRows = await db
      .select({ userId: schema.members.userId, role: schema.members.role })
      .from(schema.members)
      .where(eq(schema.members.orgId, context.org.id));
    const roleById = new Map(memberRows.map((m) => [m.userId, m.role]));
    const unread = await unreadPerConversation(
      rows.map((r) => r.id),
      context.user.id,
    );

    return Promise.all(
      rows.map(async (row) => {
        const otherId = row.userAId === context.user.id ? row.userBId : row.userAId;
        const person = byId.get(otherId);
        return {
          id: row.id,
          lastMessageAt: row.lastMessageAt,
          lastMessagePreview: row.lastMessagePreview,
          unread: unread.get(row.id) ?? 0,
          other: {
            id: otherId,
            name: person?.name ?? "Removed member",
            email: person?.email ?? null,
            image: await avatarUrl(person?.image ?? null),
            role: roleById.get(otherId) ?? null,
          },
        };
      }),
    );
  }),

  /** Total unread across all threads — the badge on the nav item. */
  unreadCount: orgProc.handler(async ({ context }) => {
    const rows = await db
      .select({ id: schema.conversations.id })
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.orgId, context.org.id),
          or(
            eq(schema.conversations.userAId, context.user.id),
            eq(schema.conversations.userBId, context.user.id),
          ),
        ),
      );
    const unread = await unreadPerConversation(
      rows.map((r) => r.id),
      context.user.id,
    );
    let total = 0;
    for (const n of unread.values()) total += n;
    return { total };
  }),

  /** Open (or create) the thread with one member and hand back its id + the other person. */
  open: orgProc
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const conversation = await ensureConversation(
        context.org.id,
        context.user.id,
        input.userId,
      );
      return { id: conversation.id };
    }),

  /** Messages in a thread, oldest first, with project/capture references resolved. */
  thread: orgProc
    .input(z.object({ conversationId: z.string(), limit: z.number().min(1).max(200).default(100) }))
    .handler(async ({ input, context }) => {
      const conversation = await participantConversation(
        input.conversationId,
        context.org.id,
        context.user.id,
      );
      const otherId =
        conversation.userAId === context.user.id ? conversation.userBId : conversation.userAId;

      const rows = await db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.conversationId, conversation.id))
        .orderBy(asc(schema.messages.createdAt))
        .limit(input.limit);

      const photoIds = [...new Set(rows.map((r) => r.photoId).filter((v): v is string => !!v))];
      const projectIds = [...new Set(rows.map((r) => r.projectId).filter((v): v is string => !!v))];

      const photos = photoIds.length
        ? await db
            .select({
              id: schema.photos.id,
              photoCode: schema.photos.photoCode,
              storageKey: schema.photos.storageKey,
              posterKey: schema.photos.posterKey,
              kind: schema.photos.kind,
              pageCount: schema.photos.pageCount,
            })
            .from(schema.photos)
            .where(
              and(eq(schema.photos.orgId, context.org.id), inArray(schema.photos.id, photoIds)),
            )
        : [];
      const photoRefs = new Map<
        string,
        {
          id: string;
          code: string;
          url: string;
          kind: string;
          mediaUrl: string;
          posterUrl: string | null;
          pageCount: number | null;
        }
      >();
      await Promise.all(
        photos.map(async (photo) => {
          // `url` is the still preview — the poster frame for a video capture.
          // `mediaUrl` is the file itself, so the client can actually play a video
          // instead of only ever showing its poster.
          const url = await photoUrl(photo.posterKey ?? photo.storageKey);
          const mediaUrl = photo.posterKey ? await photoUrl(photo.storageKey) : url;
          photoRefs.set(photo.id, {
            id: photo.id,
            code: photo.photoCode,
            url,
            kind: photo.kind,
            mediaUrl,
            // A scanned document is a PDF: it only has a still to show when a first-page
            // poster was uploaded alongside it, so say so explicitly rather than letting a
            // client hand the PDF url to an <Image>.
            posterUrl: photo.posterKey ? url : null,
            pageCount: photo.pageCount ?? null,
          });
        }),
      );

      const projects = projectIds.length
        ? await db
            .select({ id: schema.projects.id, name: schema.projects.name })
            .from(schema.projects)
            .where(
              and(
                eq(schema.projects.orgId, context.org.id),
                inArray(schema.projects.id, projectIds),
              ),
            )
        : [];
      const projectRefs = new Map(projects.map((p) => [p.id, p]));

      const people = await db
        .select({
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          image: schema.user.image,
        })
        .from(schema.user)
        .where(inArray(schema.user.id, [context.user.id, otherId]));
      const other = people.find((p) => p.id === otherId);

      const items = await Promise.all(
        rows.map(async (row) => ({
          id: row.id,
          senderId: row.senderId,
          mine: row.senderId === context.user.id,
          body: row.body,
          createdAt: row.createdAt,
          imageUrl: row.imageKey ? await photoUrl(row.imageKey) : null,
          photo: row.photoId ? (photoRefs.get(row.photoId) ?? null) : null,
          project: row.projectId ? (projectRefs.get(row.projectId) ?? null) : null,
        })),
      );

      // The composer needs to know the thread is muted before you type into it, and the menu
      // needs to know whether to offer Block or Unblock. `byMe` is the only side disclosed as
      // such; a block the other person placed simply reads as "cannot send".
      const block = await blockBetween(context.org.id, context.user.id, otherId);

      return {
        id: conversation.id,
        other: {
          id: otherId,
          name: other?.name ?? "Removed member",
          email: other?.email ?? null,
          image: await avatarUrl(other?.image ?? null),
        },
        blockedByMe: block.byMe,
        canSend: !block.any,
        items,
      };
    }),

  /** Send to a thread, or straight to a member (the thread is created on the fly). */
  send: orgProc
    .input(
      z.object({
        conversationId: z.string().optional(),
        toUserId: z.string().optional(),
        body: z.string().max(4000).default(""),
        projectId: z.string().nullish(),
        photoId: z.string().nullish(),
        imageKey: z.string().nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      const text = input.body.trim();
      if (!text && !input.imageKey && !input.photoId)
        throw new ORPCError("BAD_REQUEST", { message: "Message is empty" });

      const conversation = input.conversationId
        ? await participantConversation(input.conversationId, context.org.id, context.user.id)
        : input.toUserId
          ? await ensureConversation(context.org.id, context.user.id, input.toUserId)
          : null;
      if (!conversation) throw new ORPCError("BAD_REQUEST", { message: "No recipient" });

      // A blocked thread is read-only for both sides. The message is deliberately the same
      // whichever way the block runs: it must not tell you that someone blocked you.
      const recipientId =
        conversation.userAId === context.user.id ? conversation.userBId : conversation.userAId;
      const block = await blockBetween(context.org.id, context.user.id, recipientId);
      if (block.any)
        throw new ORPCError("FORBIDDEN", {
          message: "This conversation is blocked. Unblock to send messages.",
        });

      // References are re-validated against the workspace — a client id is never trusted.
      let projectId: string | null = null;
      if (input.projectId) {
        const [project] = await db
          .select({ id: schema.projects.id })
          .from(schema.projects)
          .where(
            and(
              eq(schema.projects.id, input.projectId),
              eq(schema.projects.orgId, context.org.id),
            ),
          )
          .limit(1);
        if (!project) throw new ORPCError("NOT_FOUND", { message: "Project not found" });
        projectId = project.id;
      }
      let photoId: string | null = null;
      if (input.photoId) {
        const [photo] = await db
          .select({ id: schema.photos.id })
          .from(schema.photos)
          .where(
            and(eq(schema.photos.id, input.photoId), eq(schema.photos.orgId, context.org.id)),
          )
          .limit(1);
        if (!photo) throw new ORPCError("NOT_FOUND", { message: "Capture not found" });
        photoId = photo.id;
      }

      const now = new Date();
      const [row] = await db
        .insert(schema.messages)
        .values({
          id: id("msg"),
          conversationId: conversation.id,
          orgId: context.org.id,
          senderId: context.user.id,
          body: text,
          projectId,
          photoId,
          imageKey: input.imageKey ?? null,
          createdAt: now,
        })
        .returning();

      await db
        .update(schema.conversations)
        .set({
          lastMessageAt: now,
          lastMessagePreview: preview(text, !!input.imageKey, !!photoId),
        })
        .where(eq(schema.conversations.id, conversation.id));

      const otherId =
        conversation.userAId === context.user.id ? conversation.userBId : conversation.userAId;
      await notify(
        [otherId],
        context.user.name || "New message",
        preview(text, !!input.imageKey, !!photoId) || "Sent you a message",
        conversation.id,
      );

      return { id: row.id, conversationId: conversation.id };
    }),

  /** One message to every crew member, delivered as individual 1:1 threads. */
  broadcast: orgProc
    .input(z.object({ body: z.string().min(1).max(4000), projectId: z.string().nullish() }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const all = await orgContacts(context.org.id, context.user.id);
      // A crew-wide announcement still respects a block in either direction: whoever muted
      // whom, that pair's thread stays quiet. One query rather than one per contact.
      const muted = await db
        .select({
          blockerId: schema.memberBlocks.blockerId,
          blockedId: schema.memberBlocks.blockedId,
        })
        .from(schema.memberBlocks)
        .where(
          and(
            eq(schema.memberBlocks.orgId, context.org.id),
            or(
              eq(schema.memberBlocks.blockerId, context.user.id),
              eq(schema.memberBlocks.blockedId, context.user.id),
            ),
          ),
        );
      const mutedIds = new Set(
        muted.map((row) => (row.blockerId === context.user.id ? row.blockedId : row.blockerId)),
      );
      const contacts = all.filter((contact) => !mutedIds.has(contact.userId));
      if (contacts.length === 0) return { sent: 0 };

      let projectId: string | null = null;
      if (input.projectId) {
        const [project] = await db
          .select({ id: schema.projects.id })
          .from(schema.projects)
          .where(
            and(
              eq(schema.projects.id, input.projectId),
              eq(schema.projects.orgId, context.org.id),
            ),
          )
          .limit(1);
        if (project) projectId = project.id;
      }

      const text = input.body.trim();
      const now = new Date();
      for (const contact of contacts) {
        const conversation = await ensureConversation(
          context.org.id,
          context.user.id,
          contact.userId,
        );
        await db.insert(schema.messages).values({
          id: id("msg"),
          conversationId: conversation.id,
          orgId: context.org.id,
          senderId: context.user.id,
          body: text,
          projectId,
          createdAt: now,
        });
        await db
          .update(schema.conversations)
          .set({ lastMessageAt: now, lastMessagePreview: preview(text, false, false) })
          .where(eq(schema.conversations.id, conversation.id));
      }

      await notify(
        contacts.map((c) => c.userId),
        context.user.name || "Announcement",
        preview(text, false, false),
        "",
      );

      return { sent: contacts.length };
    }),

  /**
   * Flag a message, or a whole thread, as abusive.
   *
   * Every 1:1 thread in here is between two members of the same workspace, so a report is
   * routed to the people who can actually act on it — the owner, admins and managers get it on
   * the bell and on their devices. The excerpt is copied in at report time so the record still
   * reads later, and reporting never depends on blocking: you can do either, or both.
   */
  report: orgProc
    .input(
      z.object({
        conversationId: z.string(),
        /** Omit to report the conversation rather than one message in it. */
        messageId: z.string().nullish(),
        reason: z.enum(REPORT_REASONS),
        note: z.string().max(1000).default(""),
        /** Block the other member at the same time — the usual pairing. */
        block: z.boolean().default(false),
      }),
    )
    .handler(async ({ input, context }) => {
      const conversation = await participantConversation(
        input.conversationId,
        context.org.id,
        context.user.id,
      );
      const otherId =
        conversation.userAId === context.user.id ? conversation.userBId : conversation.userAId;

      // A message id is only accepted when it really belongs to this thread, and only when
      // somebody else wrote it — there is nothing to moderate about your own line.
      let excerpt = "";
      let reportedUserId = otherId;
      if (input.messageId) {
        const [message] = await db
          .select()
          .from(schema.messages)
          .where(
            and(
              eq(schema.messages.id, input.messageId),
              eq(schema.messages.conversationId, conversation.id),
            ),
          )
          .limit(1);
        if (!message) throw new ORPCError("NOT_FOUND", { message: "Message not found" });
        if (message.senderId === context.user.id)
          throw new ORPCError("BAD_REQUEST", { message: "Cannot report your own message" });
        reportedUserId = message.senderId;
        excerpt = preview(message.body, !!message.imageKey, !!message.photoId);
      }

      await db.insert(schema.messageReports).values({
        id: id("rpt"),
        orgId: context.org.id,
        conversationId: conversation.id,
        messageId: input.messageId ?? null,
        reporterId: context.user.id,
        reportedUserId,
        reason: input.reason,
        note: input.note.trim(),
        excerpt,
      });

      if (input.block) await blockMember(context.org.id, context.user.id, otherId);

      // Tell the people who can act, on the devices and in the inbox. Best effort throughout:
      // a dead push token or a mail failure must not lose a report that is already recorded.
      const admins = await db
        .select({ userId: schema.members.userId })
        .from(schema.members)
        .where(
          and(
            eq(schema.members.orgId, context.org.id),
            inArray(schema.members.role, ["owner", "admin", "manager"]),
          ),
        );
      const recipients = admins
        .map((a) => a.userId)
        .filter((userId) => userId !== context.user.id && userId !== reportedUserId);
      await notify(
        recipients,
        "Message reported",
        `${context.user.name || "A member"} reported a message (${input.reason}).`,
        conversation.id,
      );

      if (recipients.length > 0) {
        const people = await db
          .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email })
          .from(schema.user)
          .where(inArray(schema.user.id, [...recipients, reportedUserId]));
        const reportedName =
          people.find((p) => p.id === reportedUserId)?.name ?? "A workspace member";
        await Promise.all(
          people
            .filter((p) => recipients.includes(p.id) && p.email)
            .map((p) =>
              reportEmail({
                to: p.email,
                workspace: context.org.name,
                reporter: context.user.name || context.user.email,
                reported: reportedName,
                reason: input.reason,
                note: input.note.trim(),
                excerpt,
              }).catch(() => undefined),
            ),
        );
      }

      return { ok: true, blocked: input.block };
    }),

  /** Mute another member: no new messages either way, and no push. History stays readable. */
  block: orgProc
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      if (input.userId === context.user.id)
        throw new ORPCError("BAD_REQUEST", { message: "Cannot block yourself" });
      await blockMember(context.org.id, context.user.id, input.userId);
      return { blocked: true };
    }),

  /** Undo the caller's own block. Cannot lift a block the other person put in place. */
  unblock: orgProc
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      await db
        .delete(schema.memberBlocks)
        .where(
          and(
            eq(schema.memberBlocks.orgId, context.org.id),
            eq(schema.memberBlocks.blockerId, context.user.id),
            eq(schema.memberBlocks.blockedId, input.userId),
          ),
        );
      return { blocked: false };
    }),

  /** Move the caller's read cursor to now, clearing the unread badge for that thread. */
  markRead: orgProc
    .input(z.object({ conversationId: z.string() }))
    .handler(async ({ input, context }) => {
      const conversation = await participantConversation(
        input.conversationId,
        context.org.id,
        context.user.id,
      );
      const at = new Date();
      await db
        .insert(schema.messageReads)
        .values({
          id: id("mrd"),
          conversationId: conversation.id,
          userId: context.user.id,
          lastReadAt: at,
        })
        .onConflictDoUpdate({
          target: [schema.messageReads.conversationId, schema.messageReads.userId],
          set: { lastReadAt: at },
        });
      return { ok: true };
    }),

  /** Mobile registers its Expo push token here after sign-in. */
  registerPushToken: orgProc
    .input(z.object({ token: z.string().min(10).max(200), platform: z.string().max(20).nullish() }))
    .handler(async ({ input, context }) => {
      await db
        .insert(schema.pushTokens)
        .values({
          id: id("pth"),
          userId: context.user.id,
          token: input.token,
          platform: input.platform ?? null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.pushTokens.token,
          set: { userId: context.user.id, platform: input.platform ?? null, updatedAt: new Date() },
        });
      return { ok: true };
    }),

  /** Recent captures the composer can attach as a reference. */
  recentCaptures: orgProc
    .input(z.object({ projectId: z.string().nullish() }).optional())
    .handler(async ({ input, context }) => {
      const filters = [eq(schema.photos.orgId, context.org.id)];
      if (input?.projectId) filters.push(eq(schema.photos.projectId, input.projectId));
      const rows = await db
        .select({
          id: schema.photos.id,
          photoCode: schema.photos.photoCode,
          kind: schema.photos.kind,
          storageKey: schema.photos.storageKey,
          posterKey: schema.photos.posterKey,
          capturedAt: schema.photos.capturedAt,
        })
        .from(schema.photos)
        .where(and(...filters))
        .orderBy(desc(schema.photos.capturedAt))
        .limit(24);
      return Promise.all(
        rows.map(async (row) => ({
          id: row.id,
          code: row.photoCode,
          kind: row.kind,
          capturedAt: row.capturedAt,
          url: await photoUrl(row.posterKey ?? row.storageKey),
          // The still a picker can actually draw. A video or a scanned document only has one
          // when a poster frame was uploaded with it; otherwise the picker shows a glyph
          // rather than pointing <img> at an mp4 or a PDF.
          posterUrl: row.kind === "photo" ? await photoUrl(row.storageKey) : row.posterKey ? await photoUrl(row.posterKey) : null,
        })),
      );
    }),
};
