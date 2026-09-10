import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

const now = () => new Date();

/** Organization = a company/crew account. Owns projects, photos, templates, billing. */
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  industry: text("industry"),
  plan: text("plan").notNull().default("free"), // free | plus | business | enterprise
  /** Workspace-wide default appearance. Members may override it on their own device. */
  theme: text("theme").notNull().default("light"), // light | dark
  /** Workspace-wide default UI language (BCP-47). Members may override it on their own device. */
  locale: text("locale").notNull().default("en"),
  seats: integer("seats").notNull().default(1),
  ownerId: text("owner_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
});

/** Membership + role based permissions. */
export const members = sqliteTable(
  "members",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("field"), // owner | admin | manager | dispatcher | field
    title: text("title"),
    // Set when the user deliberately lands in this workspace (accepting a crew invite). It wins
    // over ownership when resolving which workspace a multi-membership user is working in, so an
    // invitee is never dragged back into the empty personal workspace sign-up provisioned.
    activeAt: integer("active_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [
    index("members_org_idx").on(t.orgId),
    uniqueIndex("members_org_user_idx").on(t.orgId, t.userId),
  ],
);

/** Pending invitations to an organization. */
export const invites = sqliteTable(
  "invites",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("field"),
    code: text("code").notNull().unique(),
    status: text("status").notNull().default("pending"), // pending | accepted | revoked
    /** JSON array of project ids to assign the moment the invite is accepted. */
    projectIds: text("project_ids"),
    invitedBy: text("invited_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("invites_org_idx").on(t.orgId)],
);

/** A job / site / work order that photos are grouped under. */
export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    code: text("code"),
    client: text("client"),
    locationLabel: text("location_label"),
    address: text("address"),
    lat: real("lat"),
    lng: real("lng"),
    status: text("status").notNull().default("active"), // active | on_hold | complete | archived
    category: text("category"), // construction | fiber | telecom | hvac | property | ...
    notes: text("notes"),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("projects_org_idx").on(t.orgId)],
);

/** Which members can see which projects (role `field` is restricted to assignments). */
export const projectAssignments = sqliteTable(
  "project_assignments",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    userId: text("user_id").notNull(),
    orgId: text("org_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [uniqueIndex("assignments_project_user_idx").on(t.projectId, t.userId)],
);

/**
 * A photo = the evidence record. `capturedAt` is the device clock, `verifiedAt` is the
 * server clock stamped at upload, `contentHash` is the SHA-256 of the image bytes and
 * `signature` is an HMAC over the canonical metadata payload — so any later edit to the
 * image or its metadata fails verification.
 */
export const photos = sqliteTable(
  "photos",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    projectId: text("project_id"),
    userId: text("user_id").notNull(),
    photoCode: text("photo_code").notNull().unique(),
    storageKey: text("storage_key").notNull(),
    /** photo | video — videos carry the same verification seal as photos. */
    kind: text("kind").notNull().default("photo"),
    /** Clip length for videos, null for photos. */
    durationMs: integer("duration_ms"),
    /** Poster frame key for videos (thumbnail in feeds and reports). */
    posterKey: text("poster_key"),
    /** true once the stamp is burned into the pixels server-side (ffmpeg). */
    stampBurned: integer("stamp_burned", { mode: "boolean" }).notNull().default(false),
    /** Stamp fields captured at record time, replayed as the playback overlay. */
    stampData: text("stamp_data", { mode: "json" }).$type<Record<string, unknown> | null>(),
    width: integer("width"),
    height: integer("height"),
    bytes: integer("bytes"),
    capturedAt: integer("captured_at", { mode: "timestamp_ms" }).notNull(),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
    timeSource: text("time_source").notNull().default("network"), // network | device
    /**
     * Device clock error: deviceTime - serverTime, measured from a trusted sync.
     * NOT the upload delay — a photo drained from the offline queue hours later
     * still has near-zero skew if the phone's clock was right when it was taken.
     */
    clockSkewMs: integer("clock_skew_ms").notNull().default(0),
    /** How long the photo sat before it reached the server (queue/dead-zone time). */
    uploadDelayMs: integer("upload_delay_ms").notNull().default(0),
    lat: real("lat"),
    lng: real("lng"),
    accuracyM: real("accuracy_m"),
    altitudeM: real("altitude_m"),
    heading: real("heading"),
    address: text("address"),
    note: text("note"),
    tag: text("tag").notNull().default("general"), // general | before | after | issue | arrival | departure | pickup | delivery
    assetType: text("asset_type"), // handhole | vault | splice | pole | meter | ...
    weather: text("weather"),
    deviceModel: text("device_model"),
    platform: text("platform"),
    templateId: text("template_id"),
    contentHash: text("content_hash"),
    signature: text("signature"),
    recipient: text("recipient"),
    signaturePath: text("signature_path"),
    signatureBox: text("signature_box"),
    integrity: text("integrity").notNull().default("verified"), // verified | unverified | tampered
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [
    index("photos_org_idx").on(t.orgId),
    index("photos_project_idx").on(t.projectId),
    index("photos_captured_idx").on(t.capturedAt),
  ],
);

/** Append-only audit trail per photo — the chain of custody. */
export const photoEvents = sqliteTable(
  "photo_events",
  {
    id: text("id").primaryKey(),
    photoId: text("photo_id").notNull(),
    orgId: text("org_id").notNull(),
    type: text("type").notNull(), // captured | uploaded | verified | viewed | shared | exported
    actor: text("actor"),
    detail: text("detail"),
    at: integer("at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("photo_events_photo_idx").on(t.photoId)],
);

/** Watermark stamp layouts, per organization. */
export const watermarkTemplates = sqliteTable(
  "watermark_templates",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    layout: text("layout").notNull().default("classic"), // classic | compact | detailed | branded
    accentColor: text("accent_color").notNull().default("#FFB021"),
    showLogo: integer("show_logo", { mode: "boolean" }).notNull().default(false),
    logoUrl: text("logo_url"),
    companyLine: text("company_line"),
    fields: text("fields", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => ["time", "coords", "address", "project"]),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("templates_org_idx").on(t.orgId)],
);

/** Public live links — clients and inspectors view photos with no app or login. */
export const shareLinks = sqliteTable(
  "share_links",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    projectId: text("project_id"),
    /** Set when the link points at exactly one photo (per-photo sharing). */
    photoId: text("photo_id"),
    token: text("token").notNull().unique(),
    label: text("label").notNull(),
    allowDownload: integer("allow_download", { mode: "boolean" }).notNull().default(true),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
    views: integer("views").notNull().default(0),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("share_org_idx").on(t.orgId)],
);

/** Generated report packages (PDF / XLSX / ZIP / KMZ). */
export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    projectId: text("project_id"),
    title: text("title").notNull(),
    format: text("format").notNull(), // pdf | xlsx | zip | kmz
    layout: text("layout").notNull().default("grid"), // grid | detailed | before_after | map
    photoCount: integer("photo_count").notNull().default(0),
    storageKey: text("storage_key"),
    bytes: integer("bytes"),
    status: text("status").notNull().default("ready"), // building | ready | failed
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("reports_org_idx").on(t.orgId)],
);

/** Before / after pairings used by comparison layouts. */
export const comparisons = sqliteTable(
  "comparisons",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    projectId: text("project_id"),
    title: text("title").notNull(),
    beforePhotoId: text("before_photo_id").notNull(),
    afterPhotoId: text("after_photo_id").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("comparisons_org_idx").on(t.orgId)],
);

/* ------------------------------------------------------------------ *
 * Platform operator (admin console) tables
 * ------------------------------------------------------------------ */

/** Subscription plans — source of truth for display + limit enforcement. */
export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(), // free | plus | business | enterprise | custom ids
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  period: text("period").notNull().default("per month"),
  tagline: text("tagline").notNull().default(""),
  features: text("features", { mode: "json" }).notNull().$type<string[]>(),
  limits: text("limits", { mode: "json" }).notNull().$type<Record<string, unknown>>(),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  autumnPlanId: text("autumn_plan_id"),
  isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
});

/** Platform staff — operators of GeoCliks itself, not workspace members. */
export const staff = sqliteTable("staff", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  role: text("role").notNull().default("admin"), // superadmin | admin
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  createdBy: text("created_by"),
});

/** Account suspension flags applied by platform staff. */
export const userStatus = sqliteTable("user_status", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  suspended: integer("suspended", { mode: "boolean" }).notNull().default(false),
  suspendedAt: integer("suspended_at", { mode: "timestamp_ms" }),
  reason: text("reason"),
});

/** Append-only audit log of every admin console mutation. */
export const adminEvents = sqliteTable(
  "admin_events",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").notNull(),
    action: text("action").notNull(),
    target: text("target"),
    detail: text("detail"),
    at: integer("at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("admin_events_at_idx").on(t.at)],
);

/** Short-lived impersonation grants used by support staff. */
export const impersonations = sqliteTable("impersonations", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  actorId: text("actor_id").notNull(),
  userId: text("user_id").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
});

/** Billing subscription state per workspace (provider = autumn | manual). */
export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().unique(),
    planId: text("plan_id").notNull(),
    provider: text("provider").notNull().default("manual"),
    status: text("status").notNull().default("active"),
    externalId: text("external_id"),
    seats: integer("seats").notNull().default(1),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("subs_plan_idx").on(t.planId)],
);

/**
 * Internal messaging: a 1:1 conversation between two members of the same workspace.
 * The member pair is stored canonically ordered (userAId < userBId) and unique per org, so
 * "message this person" always resolves to the same row regardless of who opens it first.
 */
export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    userAId: text("user_a_id").notNull(),
    userBId: text("user_b_id").notNull(),
    lastMessageAt: integer("last_message_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
    lastMessagePreview: text("last_message_preview"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [
    index("conversations_org_idx").on(t.orgId),
    index("conversations_a_idx").on(t.userAId),
    index("conversations_b_idx").on(t.userBId),
    uniqueIndex("conversations_pair_idx").on(t.orgId, t.userAId, t.userBId),
  ],
);

/** A single message in a conversation. May cite a project and/or a specific capture. */
export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    orgId: text("org_id").notNull(),
    senderId: text("sender_id").notNull(),
    body: text("body").notNull().default(""),
    projectId: text("project_id"),
    photoId: text("photo_id"),
    /** Storage key of an image attachment — never sent to clients raw, always signed. */
    imageKey: text("image_key"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [
    index("messages_conv_idx").on(t.conversationId, t.createdAt),
    index("messages_org_idx").on(t.orgId),
  ],
);

/** Per-user read cursor for a conversation — drives the unread badge. */
export const messageReads = sqliteTable(
  "message_reads",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    userId: text("user_id").notNull(),
    lastReadAt: integer("last_read_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [uniqueIndex("message_reads_conv_user_idx").on(t.conversationId, t.userId)],
);

/** Expo push tokens registered by the mobile app, one row per device token. */
export const pushTokens = sqliteTable(
  "push_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    token: text("token").notNull().unique(),
    platform: text("platform"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("push_tokens_user_idx").on(t.userId)],
);

/**
 * Company-wide settings for the public marketing site — one row, id `site`.
 * Deliberately global rather than per-workspace: the landing page footer is the
 * GeoCliks company site, not a customer's Teamspace. Edited from /admin/settings
 * by a superadmin, read unauthenticated by the landing page. A blank URL means
 * "hide that icon".
 */
export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey(),
  facebookUrl: text("facebook_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  xUrl: text("x_url").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
});


/**
 * A delivery route: one driver, one day, an ordered list of stops.
 * `mode` planned = the office builds the whole route up front (courier work).
 * `mode` dispatch = stops arrive through the day and are slotted in (restaurant work).
 * `optimizer` records which engine ordered the stops, because Google's Route
 * Optimization API bills per stop and we default to the free local solver.
 */
export const routes = sqliteTable(
  "routes",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    /** Optional — a route may hang off an existing project or stand alone. */
    projectId: text("project_id"),
    name: text("name").notNull(),
    /** The working day this route belongs to, as YYYY-MM-DD in the workspace's local time. */
    date: text("date").notNull(),
    mode: text("mode").notNull().default("planned"), // planned | dispatch
    status: text("status").notNull().default("draft"), // draft | assigned | active | completed | cancelled
    /** The assigned driver. Null while the route is still a draft. */
    driverId: text("driver_id"),
    startAddress: text("start_address"),
    startLat: real("start_lat"),
    startLng: real("start_lng"),
    /** true when the driver must return to the start point at the end of the run. */
    returnToStart: integer("return_to_start", { mode: "boolean" }).notNull().default(false),
    /** Planned departure, as minutes past midnight local — keeps ETA maths timezone-free. */
    startMinutes: integer("start_minutes").notNull().default(480),
    /** Default minutes spent at each stop, used for ETAs. */
    serviceMinutes: integer("service_minutes").notNull().default(5),
    /** Whether the driver must capture a signature as well as a photo. Off by default. */
    requireSignature: integer("require_signature", { mode: "boolean" }).notNull().default(false),
    /** Recipient email notifications for this route. */
    notifyOnStart: integer("notify_on_start", { mode: "boolean" }).notNull().default(true),
    notifyWhenNext: integer("notify_when_next", { mode: "boolean" }).notNull().default(true),
    notifyOnDelivery: integer("notify_on_delivery", { mode: "boolean" }).notNull().default(true),
    /** How many stops ahead the "you're next" email fires. */
    notifyLeadStops: integer("notify_lead_stops").notNull().default(2),
    optimizer: text("optimizer"), // local | google | manual
    /** Planned driving metres and seconds from the last optimize, for ETAs and reporting. */
    planMetres: integer("plan_metres"),
    planSeconds: integer("plan_seconds"),
    optimizedAt: integer("optimized_at", { mode: "timestamp_ms" }),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [
    index("routes_org_date_idx").on(t.orgId, t.date),
    index("routes_driver_idx").on(t.driverId, t.date),
  ],
);

/**
 * One delivery. `seq` is the running order (0-based). The proof lives on a normal
 * GeoCliks photo referenced by `photoId`, so every route delivery automatically
 * inherits the existing hash, signature, chain of custody and verification page.
 * `trackToken` is the unguessable public token for the recipient's tracking page.
 */
export const routeStops = sqliteTable(
  "route_stops",
  {
    id: text("id").primaryKey(),
    routeId: text("route_id").notNull(),
    orgId: text("org_id").notNull(),
    seq: integer("seq").notNull().default(0),
    /** Exactly what the office typed or pasted, kept verbatim for the "needs attention" list. */
    addressRaw: text("address_raw").notNull(),
    /** What the geocoder resolved it to. Null until geocoded. */
    address: text("address"),
    lat: real("lat"),
    lng: real("lng"),
    /** pending | ok | manual | failed — `manual` means a human dropped the pin. */
    geocodeStatus: text("geocode_status").notNull().default("pending"),
    placeId: text("place_id"),
    recipientName: text("recipient_name"),
    recipientEmail: text("recipient_email"),
    recipientPhone: text("recipient_phone"),
    /** The customer's own order or invoice number. */
    reference: text("reference"),
    notes: text("notes"),
    /** Optional delivery window, minutes past midnight local. */
    windowStart: integer("window_start"),
    windowEnd: integer("window_end"),
    /** Per-stop override of the route's service time. */
    serviceMinutes: integer("service_minutes"),
    status: text("status").notNull().default("pending"), // pending | delivered | failed | skipped
    /** The evidence photo proving this stop. */
    photoId: text("photo_id"),
    /** nobody_home | refused | wrong_address | closed | inaccessible | other */
    failedReason: text("failed_reason"),
    failedNote: text("failed_note"),
    /** Estimated arrival, recomputed as the route runs. */
    eta: integer("eta", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    trackToken: text("track_token").notNull().unique(),
    /** Notification bookkeeping — set once, so a queue drain never re-sends. */
    notifiedStartAt: integer("notified_start_at", { mode: "timestamp_ms" }),
    notifiedNextAt: integer("notified_next_at", { mode: "timestamp_ms" }),
    notifiedDeliveredAt: integer("notified_delivered_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [
    index("route_stops_route_idx").on(t.routeId, t.seq),
    index("route_stops_org_idx").on(t.orgId),
    index("route_stops_photo_idx").on(t.photoId),
  ],
);

/** Append-only audit trail for a route, mirroring `photoEvents`. Never updated or deleted. */
export const routeEvents = sqliteTable(
  "route_events",
  {
    id: text("id").primaryKey(),
    routeId: text("route_id").notNull(),
    orgId: text("org_id").notNull(),
    stopId: text("stop_id"),
    /** created | optimized | reordered | assigned | started | delivered | failed | notified | completed | cancelled */
    event: text("event").notNull(),
    detail: text("detail"),
    actorId: text("actor_id"),
    at: integer("at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("route_events_route_idx").on(t.routeId, t.at)],
);

/**
 * Address -> coordinates cache. Geocoding is billed per request, and delivery
 * companies hit the same addresses week after week, so this table is a direct
 * margin protection. Keyed by a normalized hash of the raw address text.
 */
export const geocodes = sqliteTable(
  "geocodes",
  {
    id: text("id").primaryKey(),
    /** SHA-256 of the lowercased, whitespace-collapsed query. */
    queryHash: text("query_hash").notNull().unique(),
    query: text("query").notNull(),
    address: text("address"),
    lat: real("lat"),
    lng: real("lng"),
    placeId: text("place_id"),
    /** ok | failed — failures are cached too, so a bad address is not re-billed on every retry. */
    result: text("result").notNull().default("ok"),
    source: text("source").notNull().default("google"),
    at: integer("at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("geocodes_at_idx").on(t.at)],
);
