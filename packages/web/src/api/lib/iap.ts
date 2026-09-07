import { X509Certificate, createPublicKey, createVerify } from "node:crypto";

/**
 * In-app purchase plumbing.
 *
 * Apple requires that digital subscriptions sold inside an iOS app go through StoreKit
 * (App Store Review Guideline 3.1.1). StoreKit 2 hands the client a *signed* transaction
 * (a JWS with the full Apple certificate chain embedded in its `x5c` header), so the
 * server can verify a purchase offline: no App Store Connect key, no shared secret, no
 * network call to Apple is required. We pin the Apple Root CA - G3 fingerprint, walk the
 * chain, then check the ES256 signature over the JWS.
 */

/** Apple Root CA - G3, SHA-256 fingerprint of the DER certificate (from apple.com/certificateauthority). */
const APPLE_ROOT_CA_G3_SHA256 =
  "63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79";

/**
 * Store product id -> GeoCliks plan id.
 *
 * These exact ids must exist as auto-renewable subscriptions in App Store Connect
 * (one subscription group, "GeoCliks Plans"). The client never hardcodes them — it reads
 * them from `iap.products`.
 */
export const APPLE_PRODUCTS: Record<string, string> = {
  "com.geocliks.plus.monthly": "plus",
  "com.geocliks.business.monthly": "business",
};

/** Plan id -> Apple product id (reverse of APPLE_PRODUCTS). */
export const APPLE_SKU_BY_PLAN: Record<string, string> = Object.fromEntries(
  Object.entries(APPLE_PRODUCTS).map(([sku, plan]) => [plan, sku]),
);

export function appleBundleId(): string {
  return process.env.APPLE_BUNDLE_ID ?? "com.timemark_a7k2.runable";
}

/** Subset of Apple's JWSTransactionDecodedPayload that we act on. */
export interface AppleTransaction {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  bundleId: string;
  purchaseDate?: number;
  expiresDate?: number;
  revocationDate?: number;
  type?: string;
  environment?: string;
  appAccountToken?: string;
}

function b64uToBuffer(part: string): Buffer {
  return Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function b64uToJson<T>(part: string): T {
  return JSON.parse(b64uToBuffer(part).toString("utf8")) as T;
}

function certFromBase64Der(der: string): X509Certificate {
  return new X509Certificate(Buffer.from(der, "base64"));
}

function withinValidity(cert: X509Certificate, at: Date): boolean {
  return new Date(cert.validFrom) <= at && at <= new Date(cert.validTo);
}

export class IapVerificationError extends Error {}

/**
 * Verifies an Apple StoreKit 2 signed transaction and returns its decoded payload.
 * Throws IapVerificationError when anything about the chain, signature, bundle id,
 * product id or expiry is wrong.
 */
export function verifyAppleJws(jws: string, now: Date = new Date()): AppleTransaction {
  const parts = jws.split(".");
  if (parts.length !== 3) throw new IapVerificationError("Malformed signed transaction");
  const [headerPart, payloadPart, signaturePart] = parts as [string, string, string];

  const header = b64uToJson<{ alg?: string; x5c?: string[] }>(headerPart);
  if (header.alg !== "ES256") throw new IapVerificationError("Unexpected signing algorithm");
  const chain = header.x5c ?? [];
  if (chain.length < 3) throw new IapVerificationError("Missing Apple certificate chain");

  let leaf: X509Certificate;
  let intermediate: X509Certificate;
  let root: X509Certificate;
  try {
    leaf = certFromBase64Der(chain[0] as string);
    intermediate = certFromBase64Der(chain[1] as string);
    root = certFromBase64Der(chain[2] as string);
  } catch {
    throw new IapVerificationError("Unreadable certificate chain");
  }

  // 1. The chain must terminate at the pinned Apple root.
  if (root.fingerprint256.toUpperCase() !== APPLE_ROOT_CA_G3_SHA256) {
    throw new IapVerificationError("Certificate chain is not anchored to Apple Root CA - G3");
  }

  // 2. Every certificate must be inside its validity window.
  for (const cert of [leaf, intermediate, root]) {
    if (!withinValidity(cert, now)) throw new IapVerificationError("Expired certificate in chain");
  }

  // 3. leaf <- intermediate <- root (root is self-signed).
  if (!root.verify(root.publicKey)) throw new IapVerificationError("Bad Apple root signature");
  if (!intermediate.verify(root.publicKey)) {
    throw new IapVerificationError("Intermediate certificate not signed by Apple root");
  }
  if (!leaf.verify(intermediate.publicKey)) {
    throw new IapVerificationError("Leaf certificate not signed by Apple intermediate");
  }

  // 4. The JWS signature itself (raw r||s, hence ieee-p1363).
  const verifier = createVerify("sha256");
  verifier.update(`${headerPart}.${payloadPart}`);
  verifier.end();
  const ok = verifier.verify(
    { key: createPublicKey(leaf.publicKey), dsaEncoding: "ieee-p1363" },
    b64uToBuffer(signaturePart),
  );
  if (!ok) throw new IapVerificationError("Signature does not match Apple certificate");

  const payload = b64uToJson<AppleTransaction>(payloadPart);

  // 5. The transaction must belong to this app, this catalog, and still be live.
  if (payload.bundleId !== appleBundleId()) {
    throw new IapVerificationError("Transaction belongs to a different app");
  }
  if (!APPLE_PRODUCTS[payload.productId]) {
    throw new IapVerificationError("Unknown product");
  }
  if (payload.revocationDate) throw new IapVerificationError("Purchase was refunded");
  if (payload.expiresDate && payload.expiresDate <= now.getTime()) {
    throw new IapVerificationError("Subscription has expired");
  }

  return payload;
}

/** Plan id a verified transaction grants. */
export function planForAppleProduct(productId: string): string | null {
  return APPLE_PRODUCTS[productId] ?? null;
}
