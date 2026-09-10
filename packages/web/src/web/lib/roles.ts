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
