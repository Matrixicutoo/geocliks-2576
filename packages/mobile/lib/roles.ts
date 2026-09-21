/**
 * Role helpers for the phone app. Mirror of `packages/web/src/web/lib/roles.ts` — keep the two
 * in step.
 *
 * Roles are a ladder for seniority: owner > admin > manager > dispatcher > (driver, field).
 * `driver` and `field` are PEERS at the bottom on two different products. Before the `dispatcher`
 * role existed the codebase used `role !== "field"` as shorthand for "can manage the
 * workspace", which held only while field crew were the single restricted role. Adding a role
 * BELOW manager broke that shorthand, so every one of those checks goes through here instead.
 *
 * These are presentation guards only — the server enforces the same rules in `requireRole()`.
 * Never rely on them for security.
 */

/** Manager and above: the tier that runs projects, templates, messages, plans and the team. */
export function canManageWorkspace(role: string | undefined | null): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

/**
 * Dispatcher and above: the tier that builds and runs delivery routes.
 *
 * Deleting a whole run IS part of this, as of the change that let dispatchers clear their own
 * mistakes. It used to sit at `canManageWorkspace` on the theory that throwing away a run is a
 * manager's call, but the person who typed the duplicate run is the dispatcher, and making them
 * wait on a manager to remove it just leaves the board wrong all morning. A delete only removes
 * the plan — the evidence photos are kept — so there is nothing here worth a second signature.
 * Matches `requireRole(role, "dispatcher")` on `routes.remove`, which is what enforces it.
 */
export function canRunDeliveries(role: string | undefined | null): boolean {
  return canManageWorkspace(role) || role === "dispatcher";
}

/**
 * Who is asked to set the workspace up on first run: owner and admin only.
 *
 * Deliberately NOT `canManageWorkspace` — a manager runs day-to-day work but does not name the
 * company or choose which system it runs, and an invited crew member must never be asked either.
 * That is what keeps the setup gate off everyone who joined a Teamspace somebody else created.
 */
export function canSetUpWorkspace(role: string | undefined | null): boolean {
  return role === "owner" || role === "admin";
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
 * Whose time clock this role reads: the whole workspace, or only their own punches.
 *
 * The office — owner, admin, manager, dispatcher — reads everyone, because a dispatcher needs
 * to know who is actually on the clock this morning and payroll is a manager's paperwork. Crew
 * read their own timesheet, the same rule their captures already follow. Mirrors
 * `readsEveryone()` in `packages/web/src/api/routes/time-clock.ts`, which is what enforces it.
 */
export function canReadAllTimeClock(role: string | undefined | null): boolean {
  return canManageWorkspace(role) || role === "dispatcher";
}
