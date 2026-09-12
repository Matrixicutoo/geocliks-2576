import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { auth, withNativeOrigin } from "./auth";
import { ping } from "./routes/ping";
import { clock } from "./routes/clock";
import { orgs } from "./routes/orgs";
import { team } from "./routes/team";
import { projects } from "./routes/projects";
import { routes } from "./routes/routes";
import { photos } from "./routes/photos";
import { messages } from "./routes/messages";
import { upload } from "./routes/upload";
import { account } from "./routes/account";
import { share } from "./routes/share";
import { verify } from "./routes/verify";
import { track } from "./routes/track";
import { reports } from "./routes/reports";
import { billing } from "./routes/billing";
import { demo } from "./routes/demo";
import { iap } from "./routes/iap";
import { adminOverview } from "./routes/admin-overview";
import { adminUsers } from "./routes/admin-users";
import { adminPlans } from "./routes/admin-plans";
import { adminSite } from "./routes/admin-site";
import { site } from "./routes/site";
import { inviteQrImage } from "./lib/invite-qr";
import { shareMapImage } from "./lib/share-map";
import { verifyMapImage } from "./lib/verify-map";
import { handleBillingWebhook } from "./lib/billing-webhook";
import { agentMessages } from "./agent/route";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router — typed end-to-end via the clients
// (web: src/web/lib/api.ts, mobile: lib/api.ts).
export const router = {
  ping,
  clock,
  orgs,
  team,
  projects,
  routes,
  photos,
  messages,
  upload,
  account,
  share,
  verify,
  track,
  reports,
  billing,
  iap,
  demo,
  site,
  admin: { ...adminOverview, users: adminUsers, plans: adminPlans, site: adminSite },
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

// Better Auth handles sessions, email/password and the managed OAuth exchange.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(withNativeOrigin(c.req.raw)));

// Image bytes, so it is a plain route rather than an oRPC procedure: the public share page renders
// a server-proxied static map instead of a live JS map, keeping the Maps key off unauthenticated
// pages. Scoped to a valid share token, so it cannot be used as an open Maps proxy.
app.get("/api/share/:token/map.png", (c) =>
  shareMapImage(c.req.param("token"), new URL(c.req.url)),
);

// Same idea for the public code page /v/:code: one pin for that photo's GPS fix, rendered by the
// server so the Maps key stays off an unauthenticated page.
app.get("/api/verify/:code/map.png", (c) =>
  verifyMapImage(c.req.param("code"), new URL(c.req.url)),
);

// The QR square inside an invite email. Public because a mail client fetches it with no session;
// it encodes the join link for the code in the path and reads nothing from the database.
app.get("/api/invite/:code/qr.png", (c) => inviteQrImage(c.req.param("code")));

// Push side of billing: Autumn/Stripe calls this when a subscription is created, renewed or
// cancelled, so a cancellation downgrades the workspace immediately instead of lingering as paid.
// Authenticated by the BILLING_WEBHOOK_SECRET shared secret; the plan is always re-read from the
// processor, never taken from the payload.
app.post("/api/webhooks/billing", async (c) => {
  const out = await handleBillingWebhook(c.req.raw);
  return c.json(out.body, out.status as 200 | 400 | 401 | 503);
});

// The chat bubble's streaming endpoint. A plain route rather than an oRPC procedure because the
// response is an SSE stream. Unauthenticated on purpose — the bubble is on the public site as
// well as in the app — so the handler carries its own rate and size limits.
app.post("/api/agent/messages", (c) => agentMessages(c.req.raw));

export default app;
