import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";
import { orgProc, requireRole, visibleTeammates } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { photoUrl } from "../lib/media";
import { sendPush } from "../lib/push";

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
    const teammates = await visibleTeammates(context.org.id, context.user.id, context.role);
    if (!teammates) return people;
    return people.filter((person) => teammates.userIds.has(person.userId));
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

    return rows.map((row) => {
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
          image: person?.image ?? null,
          role: roleById.get(otherId) ?? null,
        },
      };
    });
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
            })
            .from(schema.photos)
            .where(
              and(eq(schema.photos.orgId, context.org.id), inArray(schema.photos.id, photoIds)),
            )
        : [];
      const photoRefs = new Map<
        string,
        { id: string; code: string; url: string; kind: string; mediaUrl: string }
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

      return {
        id: conversation.id,
        other: {
          id: otherId,
          name: other?.name ?? "Removed member",
          email: other?.email ?? null,
          image: other?.image ?? null,
        },
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
      const contacts = await orgContacts(context.org.id, context.user.id);
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
          capturedAt: row.capturedAt,
          url: await photoUrl(row.posterKey ?? row.storageKey),
        })),
      );
    }),
};
