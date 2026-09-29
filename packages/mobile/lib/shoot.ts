import type { FailedReason } from "./queue";

/**
 * The parameters that hand a delivery stop to the camera.
 *
 * Extracted because two screens now send him to the shutter: the run screen's card, and the
 * arrival card on the navigation map. They have to hand over exactly the same thing — a
 * mismatch would mean a photo sealed against a stop with no sequence number on it, or a
 * signature quietly not asked for, depending on which button the driver happened to press.
 */

export type ShootStop = {
  id: string;
  seq: number;
  address: string | null;
  addressRaw: string;
  recipientName: string | null;
  requireSignature: boolean | null;
};

export type ShootRoute = { id: string; requireSignature: boolean };

export function shootParams(args: {
  route: ShootRoute;
  stop: ShootStop;
  stopTotal: number;
  outcome: "delivered" | "failed";
  reason?: FailedReason | null;
  note?: string;
}): Record<string, string> {
  const { route, stop, stopTotal, outcome } = args;
  return {
    stopId: stop.id,
    routeId: route.id,
    stopSeq: String(stop.seq + 1),
    stopTotal: String(stopTotal),
    stopLabel: stop.address ?? stop.addressRaw,
    recipient: stop.recipientName ?? "",
    outcome,
    reason: outcome === "failed" ? (args.reason ?? "other") : "",
    note: outcome === "failed" ? (args.note ?? "").trim() : "",
    // This address's own answer first, and the route's only when it has none: a run of
    // no-contact drops can still carry the one parcel that has to be signed for.
    requireSignature: (stop.requireSignature ?? route.requireSignature) ? "1" : "",
  };
}
