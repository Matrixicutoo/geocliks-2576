import { Platform } from "react-native";

/**
 * Store purchase gateway.
 *
 * Apple requires digital subscriptions to be sold through StoreKit inside an iOS app
 * (App Store Review Guideline 3.1.1), so on iOS we buy with expo-iap and post the signed
 * transaction to the server for verification. Every other platform (Android, web, desktop)
 * keeps using the Stripe/Autumn checkout URL from `billing.checkout`.
 *
 * expo-iap is required lazily: Expo Go and the web bundle have no StoreKit, and importing it
 * eagerly would crash those targets.
 */

export interface StorePurchase {
  id?: string;
  productId: string;
  /** iOS: the StoreKit 2 JWS signed transaction. Android: the Play purchase token. */
  purchaseToken?: string;
}

export interface StoreProduct {
  id: string;
  title?: string;
  displayPrice?: string;
}

interface Subscription {
  remove: () => void;
}

interface IapModule {
  initConnection: () => Promise<boolean>;
  endConnection: () => Promise<void>;
  fetchProducts: (params: { skus: string[]; type?: string }) => Promise<StoreProduct[]>;
  requestPurchase: (params: unknown) => Promise<unknown>;
  finishTransaction: (params: { purchase: StorePurchase; isConsumable?: boolean }) => Promise<unknown>;
  getAvailablePurchases: (params?: unknown) => Promise<StorePurchase[]>;
  purchaseUpdatedListener: (cb: (purchase: StorePurchase) => void) => Subscription;
  purchaseErrorListener: (cb: (err: { message?: string; code?: string }) => void) => Subscription;
}

let cached: IapModule | null | undefined;

/** true when this build sells subscriptions through the App Store rather than Stripe. */
export function usesAppStoreBilling(): boolean {
  return Platform.OS === "ios";
}

/**
 * Whether this build may sell a plan at all.
 *
 * False on Android. Google Play's Payments policy requires digital subscriptions bought inside a
 * Play-distributed app to go through Play's billing system, and separately forbids pointing the
 * user at any other way to pay — so the Android build cannot open the Stripe checkout, and cannot
 * link to it, name a price for it, or hint at it either.
 *
 * Rather than take Play's cut on a B2B tool whose buyer is a manager with a laptop, the Android
 * app sells nothing: it shows the plan the workspace is on and stops there. Entitlements are
 * resolved server-side from the subscription, so a plan bought on the web is already in force on
 * the phone the moment it signs in — nothing about the app's capabilities depends on this. This is
 * the same posture Slack, Notion and Salesforce take on Android.
 *
 * iOS is also false for now, but for a different and temporary reason: the StoreKit products
 * (`com.geocliks.plus.monthly`, `com.geocliks.business.monthly`) do not exist in App Store Connect
 * yet. Listing a subscription whose product id does not resolve is an App Store Review Guideline
 * 2.1 rejection, so v1 ships the same read-only plan screen Android gets. Selling paid plans on
 * iOS is a v1.1 change: create the two subscriptions, sign the Paid Apps Agreement, then drop
 * `"ios"` from the list below — `usesAppStoreBilling()` is deliberately left returning true so
 * the StoreKit path stays wired and that revert is one line.
 *
 * Web/desktop keep Stripe.
 */
const NO_SALE_PLATFORMS = ["android", "ios"];

export function sellsSubscriptions(): boolean {
  return !NO_SALE_PLATFORMS.includes(Platform.OS);
}

function loadIap(): IapModule | null {
  if (cached !== undefined) return cached;
  if (!usesAppStoreBilling()) {
    cached = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("expo-iap") as Partial<IapModule>;
    cached = typeof mod?.requestPurchase === "function" ? (mod as IapModule) : null;
  } catch {
    cached = null;
  }
  return cached;
}

/** StoreKit reachable? False in Expo Go / simulators without a StoreKit configuration. */
export function iapAvailable(): boolean {
  return loadIap() !== null;
}

let connected = false;

async function connect(iap: IapModule): Promise<void> {
  if (connected) return;
  await iap.initConnection();
  connected = true;
}

export async function fetchStoreProducts(skus: string[]): Promise<StoreProduct[]> {
  const iap = loadIap();
  if (!iap || skus.length === 0) return [];
  await connect(iap);
  try {
    return (await iap.fetchProducts({ skus, type: "subs" })) ?? [];
  } catch {
    return [];
  }
}

/**
 * Buys a subscription through StoreKit. Resolves with the purchase once StoreKit reports it —
 * expo-iap delivers results through listeners, not the requestPurchase return value.
 */
export function buySubscription(sku: string, timeoutMs = 180000): Promise<StorePurchase> {
  const iap = loadIap();
  if (!iap) return Promise.reject(new Error("in_app_purchase_unavailable"));

  return new Promise<StorePurchase>((resolve, reject) => {
    let done = false;
    let updated: Subscription | null = null;
    let failed: Subscription | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      done = true;
      updated?.remove();
      failed?.remove();
      if (timer) clearTimeout(timer);
    };

    updated = iap.purchaseUpdatedListener((purchase) => {
      if (done) return;
      if (purchase.productId && purchase.productId !== sku) return;
      cleanup();
      resolve(purchase);
    });

    failed = iap.purchaseErrorListener((err) => {
      if (done) return;
      cleanup();
      reject(new Error(err?.code === "user-cancelled" ? "cancelled" : (err?.message ?? "store_error")));
    });

    timer = setTimeout(() => {
      if (done) return;
      cleanup();
      reject(new Error("cancelled"));
    }, timeoutMs);

    connect(iap)
      .then(() => iap.requestPurchase({ request: { apple: { sku }, google: { skus: [sku] } }, type: "subs" }))
      .catch((err: unknown) => {
        if (done) return;
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      });
  });
}

/** Marks a purchase as delivered — must run only after the server accepted it. */
export async function finishPurchase(purchase: StorePurchase): Promise<void> {
  const iap = loadIap();
  if (!iap) return;
  try {
    await iap.finishTransaction({ purchase, isConsumable: false });
  } catch {
    // Non-fatal: StoreKit replays unfinished transactions on the next launch.
  }
}

/** Active subscriptions already owned by this Apple ID — powers "Restore purchases". */
export async function restoreSubscriptions(skus: string[]): Promise<StorePurchase[]> {
  const iap = loadIap();
  if (!iap) return [];
  await connect(iap);
  const owned = await iap.getAvailablePurchases();
  const wanted = new Set(skus);
  return (owned ?? []).filter((p) => wanted.has(p.productId) && !!p.purchaseToken);
}
