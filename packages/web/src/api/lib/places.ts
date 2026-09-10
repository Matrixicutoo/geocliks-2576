/**
 * Address suggestions while you type, from Google Places Autocomplete (New).
 *
 * The same degrade-quietly rule as `geocode.ts`: if the key is missing, or the Places API (New)
 * is not switched on for the Cloud project, every call returns an empty list. The field then
 * behaves exactly like the plain text box it was before — nothing breaks, no error is shown,
 * and suggestions start appearing the moment the API is enabled in the console.
 *
 * The key stays on the server. The browser talks to our own procedure, never to Google, so the
 * key is never shipped to a page and quota abuse needs a signed-in session.
 */

export type AddressSuggestion = {
  /** What to show in the dropdown, e.g. "34 Clearview St, Moncton, NB, Canada". */
  description: string;
  /** Google's stable id for the place — kept so a later lookup can skip re-geocoding. */
  placeId: string | null;
};

const ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";

function apiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_SERVER_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
}

/** True when a key exists. It does NOT promise the Places API is enabled for the project. */
export function placesConfigured(): boolean {
  return Boolean(apiKey());
}

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
    };
  }>;
  error?: { status?: string; message?: string };
};

/**
 * One-line-per-reason logging, once per reason, so a disabled API does not fill the log with a
 * line per keystroke.
 */
const warned = new Set<string>();
function warnOnce(reason: string, detail: string): void {
  if (warned.has(reason)) return;
  warned.add(reason);
  console.warn(`[places] suggestions off (${reason}): ${detail}`);
}

/**
 * Suggest addresses for a partial query. Never throws — an empty array means "no suggestions
 * available", whether that is a bad query, a disabled API, or a network blip.
 *
 * `region` biases results to a country (ISO code, e.g. "ca"), which keeps a Canadian delivery
 * office from being offered the same street name in Texas.
 */
export async function suggestAddresses(
  query: string,
  options: { region?: string; sessionToken?: string } = {},
): Promise<AddressSuggestion[]> {
  const key = apiKey();
  const input = query.trim();
  // Two characters is noise: it costs a request and returns the whole country.
  if (!key || input.length < 3) return [];

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
      },
      body: JSON.stringify({
        input,
        ...(options.region ? { includedRegionCodes: [options.region.toUpperCase()] } : {}),
        ...(options.sessionToken ? { sessionToken: options.sessionToken } : {}),
      }),
      signal: AbortSignal.timeout(6_000),
    });

    const body = (await res.json().catch(() => ({}))) as AutocompleteResponse;

    if (!res.ok) {
      // The expected one until the project owner enables Places API (New) in Google Cloud.
      warnOnce(body.error?.status ?? String(res.status), body.error?.message ?? "request failed");
      return [];
    }

    return (body.suggestions ?? [])
      .map((s) => ({
        description: s.placePrediction?.text?.text ?? "",
        placeId: s.placePrediction?.placeId ?? null,
      }))
      .filter((s) => s.description.length > 0)
      .slice(0, 6);
  } catch (err) {
    warnOnce("network", err instanceof Error ? err.message : String(err));
    return [];
  }
}
