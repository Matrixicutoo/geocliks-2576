/**
 * Today as YYYY-MM-DD in the phone's OWN timezone — the same form a route's `date` carries.
 *
 * Deliberately not `toISOString().slice(0, 10)`: that is UTC, so a driver in Moncton opening the
 * camera after 8pm would be reading tomorrow's run instead of the one he is still driving.
 *
 * Shared because three screens decide "is this today's run?" and they have to agree: the camera
 * picks the day's route, the tab bar badges the route waiting for him, and the run editor
 * defaults its date.
 */
export function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
