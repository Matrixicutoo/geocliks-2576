/**
 * Role helpers for the web client.
 *
 * Roles are a ladder for seniority: owner > admin > manager > dispatcher > (driver, field).
 * `driver` and `field` are PEERS at the bottom on two different products. Before the `dispatcher`
 * role existed the codebase used `role !== "field"` as shorthand for "can manage the
 * workspace", which was true when field crew were the only restricted role. It stopped being
 * true the moment a role was added BELOW manager, so every one of those checks now goes
 * through here instead.
 *
 * These are presentation guards only — the server enforces the same rules in
 * `requireRole()`. Never rely on them for security.
 */

/** Manager and above: the tier that runs projects, templates, messages, sharing and billing. */
export function canManageWorkspace(role: string | undefined | null): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

/**
 * Dispatcher and above: the tier that builds and runs delivery routes. Deleting a whole run is
 * deliberately NOT part of this — that stays at `canManageWorkspace`, matching the server.
 */
export function canRunDeliveries(role: string | undefined | null): boolean {
  return canManageWorkspace(role) || role === "dispatcher";
}

/**
 * Office notes — the notes panel on the Teamspace and Routes dashboards.
 *
 * The office tier: owner, admin, manager, dispatcher. Field crew and drivers are excluded, and
 * that is the whole point of the check — notes carry customer phone numbers and addresses that
 * a crew member on a job site has no business reading. Same set as `canRunDeliveries`, written
 * separately because the two answer different questions and will drift.
 */
export function canUseNotes(role: string | undefined | null): boolean {
  return canManageWorkspace(role) || role === "dispatcher";
}

/**
 * May send an invite: the manage tier, plus dispatchers.
 *
 * Deliberately NOT the same question as "may manage members". A dispatcher can bring a new
 * driver onto the crew but cannot change anybody's role or remove them, and the role they may
 * hand out is limited to `driver` — that part lives in `useGrantableRoles()` on the invite form
 * and in `assertMayInviteRole` on the server, which is the check that actually enforces it.
 */
export function canInviteCrew(role: string | undefined | null): boolean {
  return canManageWorkspace(role) || role === "dispatcher";
}

/**
 * Which PRODUCT the role belongs to, as opposed to how senior it is.
 *
 * `driver` and `field` are peers — neither outranks the other, they just work on different
 * products, so seniority cannot decide this. Note the difference from `canRunDeliveries`
 * above: a driver CAN USE the delivery system but CANNOT build or run routes, so the two
 * checks are not interchangeable. Use `canUseDelivery` to decide whether to show the delivery
 * side at all, and `canRunDeliveries` to decide whether to offer the dispatcher's controls.
 */

/** Includes the delivery system — routes, stops, dispatch. Field crew are excluded. */
export function canUseDelivery(role: string | undefined | null): boolean {
  return (
    role === "owner" ||
    role === "admin" ||
    role === "manager" ||
    role === "dispatcher" ||
    role === "driver"
  );
}

/** Includes the field system — projects and job-site photos. Drivers are excluded. */
export function canUseField(role: string | undefined | null): boolean {
  return (
    role === "owner" ||
    role === "admin" ||
    role === "manager" ||
    role === "dispatcher" ||
    role === "field"
  );
}

/**
 * Watermark stamp templates: owner and admin only.
 *
 * Deliberately NOT `canManageWorkspace` — a manager can run the workspace but may no longer
 * curate the company stamp. This covers creating, editing, promoting and deleting a template
 * and the Watermarks page itself; it does NOT cover reading a template at capture time, which
 * every role needs so photos keep their stamp.
 */
export function canManageWatermarks(role: string | undefined | null): boolean {
  return role === "owner" || role === "admin";
}

/**
 * First-run onboarding: owner and admin only, matching `requireRole(role, "admin")` on
 * `orgs.setup`. A manager runs the workspace but does not name it or pick its product — and an
 * invited crew member must never be asked either, which is what keeps the setup gate off
 * everyone who joined a Teamspace somebody else had already created.
 */
export function canSetUpWorkspace(role: string | undefined | null): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Reads the whole workspace's time clock, as opposed to one's own timesheet.
 *
 * The office tier — owner, admin, manager, dispatcher — plus nobody else. A dispatcher needs it
 * to know who is actually out this morning and a manager needs it for payroll; the two crew
 * roles see their own punches and no one else's. Mirrors `readsEveryone` on the server, which
 * is the check that enforces it, and also gates the correction controls: amending a punch is
 * the office's job because a timesheet its subject can rewrite proves nothing.
 */
export function canReadAllTimeClock(role: string | undefined | null): boolean {
  return canManageWorkspace(role) || role === "dispatcher";
}
