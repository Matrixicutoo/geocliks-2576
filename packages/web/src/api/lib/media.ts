import { presignGet } from "./s3";

/**
 * Resolve a stored photo key to a viewable URL.
 * Demo/sample photos are shipped as public assets (`/images/...`) and pass through untouched;
 * real captures live in Tigris and get a short-lived presigned GET URL.
 */
export async function photoUrl(storageKey: string): Promise<string> {
  if (storageKey.startsWith("/") || storageKey.startsWith("http")) return storageKey;
  try {
    return await presignGet(storageKey);
  } catch {
    return "";
  }
}

export function isLocalAsset(storageKey: string) {
  return storageKey.startsWith("/") || storageKey.startsWith("http");
}
