import type { TKey } from "./i18n";

/**
 * The signature rule, which a run sets once and any single address can overrule.
 *
 * Shared by the run page and the stops popup because a dispatcher meets the same control in
 * both and it has to mean the same thing in both — including the middle answer, which is not
 * a rule at all but the deliberate absence of one.
 */
export type SigChoice = "route" | "on" | "off";

/** What a stop's stored override reads as in the control. Null is "the run decides". */
export function sigChoice(value: boolean | null | undefined): SigChoice {
  if (value === true) return "on";
  if (value === false) return "off";
  return "route";
}

/** Back the other way, for the patch. Null clears the override rather than setting "no". */
export function sigValue(choice: string): boolean | null {
  if (choice === "on") return true;
  if (choice === "off") return false;
  return null;
}

/**
 * What the driver will actually be asked for at this door: the address's own answer when it
 * has one, and the run's otherwise.
 */
export function sigEffective(
  stop: boolean | null | undefined,
  route: boolean | null | undefined,
): boolean {
  return stop ?? route ?? false;
}

/** The "follow the run" option, worded with what the run in fact says. */
export function sigRouteLabel(routeRequires: boolean | null | undefined): TKey {
  return routeRequires ? "routes.sigRouteOn" : "routes.sigRouteOff";
}

/** The badge for an address, once the two settings have been resolved into one answer. */
export function sigBadgeLabel(effective: boolean): TKey {
  return effective ? "routes.sigBadgeOn" : "routes.sigBadgeOff";
}

export const SIG_BADGE_STYLE = {
  on: "border-sky/40 bg-sky/10 text-sky",
  off: "border-line bg-ink-3 text-fog",
} as const;
