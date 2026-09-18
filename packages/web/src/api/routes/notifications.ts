import { and, desc, eq, inArray, ne, or } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { photoUrl } from "../lib/media";
import { orgProc, visibleProjectIds } from "../middleware/auth";
import { avatarUrl } from "./account";

/**
 * The notification bell.
 *
 * Derived, not stored: the feed is assembled on read from rows that already exist — messages
 * a teammate sent you, captures a teammate posted — so there is no notifications table to
 * write on every send, nothing to fan out, and nothing to prune. The only state is one
 * per-workspace cursor (`notification_reads`) saying when this person last opened the bell.
 * Anything newer than that cursor is unseen: that is the number on the bell and the dot
 * beside a row.
 *
 * Two deliberate scoping rules:
 *  - Your own activity never notifies you. You know you sent that message and took that photo.
 *  - Captures obey the same visibility as the photo feed (`visibleProjectIds`), so a field
 *    member is never told about work on a job they are not assigned to, and a driver — who has
 *    no job photo system at all — gets message notifications only.
 */

/** Feed window. Older than this is history, not a notification. */
const WINDOW_DAYS = 30;
/** Rows per source before the merge, and rows returned after it. */
const PER_SOURCE = 20;
const LIMIT = 20;
const PREVIEW_MAX = 90;

const clip = (text: string) =>
  text.length > PREVIEW_MAX ? `${text.slice(0, PREVIEW_MAX).trimEnd()}…` : text;

export interface NotificationItem {
  /** Stable per row so the client can key on it and track what it has already shown. */
  id: string;
  kind: "message" | "photo";
  at: Date;
  actor: { id: string; name: string; image: string | null };
  /** One line of body text, already trimmed to length. Empty for an image-only message. */
  text: string;
  /** Thumbnail of the capture, for a photo notification. */
  thumbUrl: string | null;
  /** Conversation to open, for a message notification. */
  conversationId: string | null;
  /** Capture to open, for a photo notification. */
  photoId: string | null;
  unseen: boolean;
}

/**
 * People in the workspace, for actor names and avatars.
 *
 * `user.image` holds a bare storage key, not a URL — handing it to the client raw is what put
 * a broken-image icon where the sender's face belongs. `avatarUrl` signs it, and passes an
 * external one (a Google photo) straight through.
 */
async function actors(userIds: string[]) {
  const wanted = [...new Set(userIds)];
  if (wanted.length === 0) return new Map<string, { name: string; image: string | null }>();
  const rows = await db
    .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, image: schema.user.image })
    .from(schema.user)
    .where(inArray(schema.user.id, wanted));
  const resolved = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      name: row.name || row.email || "Teammate",
      image: await avatarUrl(row.image),
    })),
  );
  return new Map(resolved.map((row) => [row.id, { name: row.name, image: row.image }]));
}

/** Messages sent TO the caller across every thread they are in. */
async function messageItems(orgId: string, userId: string, since: Date) {
  const threads = await db
    .select({ id: schema.conversations.id })
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.orgId, orgId),
        or(eq(schema.conversations.userAId, userId), eq(schema.conversations.userBId, userId)),
      ),
    );
  if (threads.length === 0) return [];

  return db
    .select({
      id: schema.messages.id,
      conversationId: schema.messages.conversationId,
      senderId: schema.messages.senderId,
      body: schema.messages.body,
      imageKey: schema.messages.imageKey,
      photoId: schema.messages.photoId,
      createdAt: schema.messages.createdAt,
    })
    .from(schema.messages)
    .where(
      and(
        inArray(
          schema.messages.conversationId,
          threads.map((t) => t.id),
        ),
        // Your own sends are not news to you.
        ne(schema.messages.senderId, userId),
      ),
    )
    .orderBy(desc(schema.messages.createdAt))
    .limit(PER_SOURCE)
    .then((rows) => rows.filter((row) => row.createdAt.getTime() >= since.getTime()));
}

/** Captures posted by other members, scoped to what this role may see. */
async function photoItems(orgId: string, userId: string, role: Parameters<typeof visibleProjectIds>[2], since: Date) {
  const allowed = await visibleProjectIds(orgId, userId, role);
  const filters = [eq(schema.photos.orgId, orgId), ne(schema.photos.userId, userId)];
  if (allowed) {
    // Same rule as the photo feed: assigned projects, plus your own unfiled captures — and
    // those are already excluded above, so a restricted role with no assignments sees none.
    if (allowed.length === 0) return [];
    filters.push(inArray(schema.photos.projectId, allowed));
  }
  const rows = await db
    .select({
      id: schema.photos.id,
      userId: schema.photos.userId,
      photoCode: schema.photos.photoCode,
      kind: schema.photos.kind,
      note: schema.photos.note,
      address: schema.photos.address,
      storageKey: schema.photos.storageKey,
      posterKey: schema.photos.posterKey,
      projectId: schema.photos.projectId,
      capturedAt: schema.photos.capturedAt,
    })
    .from(schema.photos)
    .where(and(...filters))
    .orderBy(desc(schema.photos.capturedAt))
    .limit(PER_SOURCE);
  return rows.filter((row) => row.capturedAt.getTime() >= since.getTime());
}

/** Project names, so a capture notification can say which job it belongs to. */
async function projectNames(ids: string[]) {
  const wanted = [...new Set(ids)];
  if (wanted.length === 0) return new Map<string, string>();
  const rows = await db
    .select({ id: schema.projects.id, name: schema.projects.name })
    .from(schema.projects)
    .where(inArray(schema.projects.id, wanted));
  return new Map(rows.map((row) => [row.id, row.name]));
}

async function cursor(orgId: string, userId: string): Promise<Date | null> {
  const [row] = await db
    .select({ lastSeenAt: schema.notificationReads.lastSeenAt })
    .from(schema.notificationReads)
    .where(
      and(
        eq(schema.notificationReads.orgId, orgId),
        eq(schema.notificationReads.userId, userId),
      ),
    )
    .limit(1);
  return row?.lastSeenAt ?? null;
}

export const notifications = {
  /**
   * The bell: merged feed plus the unseen count. One call rather than a count endpoint and a
   * list endpoint, because the dropdown and the badge always want the same rows and the count
   * is just how many of them are newer than the cursor.
   */
  feed: orgProc.handler(async ({ context }) => {
    const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000);
    const seenAt = await cursor(context.org.id, context.user.id);
    const [msgs, pics] = await Promise.all([
      messageItems(context.org.id, context.user.id, since),
      photoItems(context.org.id, context.user.id, context.role, since),
    ]);

    const people = await actors([...msgs.map((m) => m.senderId), ...pics.map((p) => p.userId)]);
    const names = await projectNames(pics.map((p) => p.projectId).filter((v): v is string => !!v));
    const isUnseen = (at: Date) => !seenAt || at.getTime() > seenAt.getTime();

    const items: NotificationItem[] = [
      ...(await Promise.all(
        msgs.map(async (row) => ({
          id: `msg_${row.id}`,
          kind: "message" as const,
          at: row.createdAt,
          actor: {
            id: row.senderId,
            name: people.get(row.senderId)?.name ?? "Teammate",
            image: people.get(row.senderId)?.image ?? null,
          },
          // Empty for an attachment with no caption — the client says "sent an image" in the
          // reader's own language rather than having English baked in here.
          text: clip(row.body.trim()),
          thumbUrl: row.imageKey ? await photoUrl(row.imageKey) : null,
          // A message row always opens its thread, even when it cites a capture — the reply
          // is the point. So the capture id stays off it.
          conversationId: row.conversationId,
          photoId: null,
          unseen: isUnseen(row.createdAt),
        })),
      )),
      ...(await Promise.all(
        pics.map(async (row) => ({
          id: `pho_n_${row.id}`,
          kind: "photo" as const,
          at: row.capturedAt,
          actor: {
            id: row.userId,
            name: people.get(row.userId)?.name ?? "Teammate",
            image: people.get(row.userId)?.image ?? null,
          },
          // Whatever says most about the shot: the crew's own note, else the job, else where.
          text: clip(
            (row.note?.trim() ||
              (row.projectId ? names.get(row.projectId) : null) ||
              row.address ||
              row.photoCode) ?? "",
          ),
          thumbUrl: await photoUrl(row.posterKey ?? row.storageKey),
          conversationId: null,
          photoId: row.id,
          unseen: isUnseen(row.capturedAt),
        })),
      )),
    ]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, LIMIT);

    return {
      items,
      // Counted over the returned window: the badge should never promise more rows than the
      // dropdown can show.
      unseen: items.filter((item) => item.unseen).length,
      lastSeenAt: seenAt,
    };
  }),

  /**
   * Opening the bell clears the badge. The rows stay listed and keep their dots for this
   * render — the client holds the previous cursor — so the panel does not blank out the moment
   * it is opened, which is what makes a notification unreadable.
   */
  markSeen: orgProc.handler(async ({ context }) => {
    const now = new Date();
    await db
      .insert(schema.notificationReads)
      .values({ id: id("ntr"), orgId: context.org.id, userId: context.user.id, lastSeenAt: now })
      .onConflictDoUpdate({
        target: [schema.notificationReads.orgId, schema.notificationReads.userId],
        set: { lastSeenAt: now },
      });
    return { ok: true, lastSeenAt: now };
  }),
};
