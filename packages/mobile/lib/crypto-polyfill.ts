/**
 * Hermes (React Native) ships without a global `crypto` object, so any library that
 * reaches for `crypto.getRandomValues` / `crypto.randomUUID` — better-auth and the
 * managed-auth PKCE flow both do — throws "Property 'crypto' doesn't exist".
 *
 * This module installs a minimal WebCrypto-shaped global backed by expo-crypto.
 * It must be imported before any auth/crypto consumer (see app/_layout.tsx).
 */
import * as ExpoCrypto from "expo-crypto";

function getRandomValues<T extends ArrayBufferView | null>(array: T): T {
  if (!array) return array;
  const bytes = ExpoCrypto.getRandomBytes(array.byteLength);
  const view = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  view.set(bytes);
  return array;
}

function randomUUID(): string {
  if (typeof ExpoCrypto.randomUUID === "function") return ExpoCrypto.randomUUID();
  const bytes = ExpoCrypto.getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const g = globalThis as unknown as Record<string, unknown>;
const existing = g.crypto as Record<string, unknown> | undefined;

if (!existing) {
  g.crypto = { getRandomValues, randomUUID };
} else {
  if (typeof existing.getRandomValues !== "function") existing.getRandomValues = getRandomValues;
  if (typeof existing.randomUUID !== "function") existing.randomUUID = randomUUID;
}

export {};
