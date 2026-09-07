import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useLocale, useT } from "@/lib/i18n";
import {
  useApplyApple,
  useBillingCurrent,
  useCheckout,
  useIapProducts,
  useSyncProcessor,
} from "@/queries/billing";
import {
  buySubscription,
  finishPurchase,
  iapAvailable,
  restoreSubscriptions,
  usesAppStoreBilling,
} from "@/lib/purchases";

/**
 * Native plan picker. Lists the same plans as the web pricing table and hands off straight to
 * Stripe checkout (Autumn-hosted) in an in-app browser — no web dashboard sign-in detour.
 */
export default function Plans() {
  const colors = useColors();
  const router = useRouter();
  const tr = useT();
  const { locale } = useLocale();
  const current = useBillingCurrent(locale);
  const checkout = useCheckout();
  const syncProcessor = useSyncProcessor();
  const applyApple = useApplyApple();
  // App Store build: StoreKit owns paid upgrades, so the Stripe path is never shown on iOS.
  const appStore = usesAppStoreBilling();
  const storeProducts = useIapProducts();

  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans = current.data?.plans ?? [];
  const activeId = current.data?.plan.id ?? null;
  const activePrice = current.data?.plan.priceCents ?? 0;
  const isOwner = current.data?.role === "owner";
  const isField = current.data?.role === "field";
  const appleSkus = storeProducts.data?.apple ?? [];
  const skuFor = (planId: string) => appleSkus.find((p) => p.plan === planId)?.sku ?? null;

  const flash = (message: string) => {
    setError(null);
    setNote(message);
    setTimeout(() => setNote(null), 5000);
  };

  const openCheckout = async (url: string) => {
    if (Platform.OS === "web") {
      globalThis.location?.assign(url);
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(url, { dismissButtonStyle: "close" });
    } catch {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else {
        setError(url);
        return;
      }
    }
    // Browser dismissed — read the truth back from the processor.
    try {
      const synced = await syncProcessor.mutateAsync({});
      // Not synced is not a failure: the processor may simply not show the subscription yet, and
      // the server deliberately leaves the plan untouched instead of guessing a downgrade.
      flash(synced.synced ? tr("plans.checkoutDone") : tr("plans.checkoutPending"));
    } catch {
      flash(tr("plans.checkoutPending"));
    }
  };

  /** iOS purchase: StoreKit -> server verification of the signed transaction -> finish. */
  const buyWithAppStore = async (planId: string) => {
    const sku = skuFor(planId);
    if (!sku || !iapAvailable()) {
      setError(tr("plans.iapUnavailable"));
      return;
    }
    try {
      const purchase = await buySubscription(sku);
      if (!purchase.purchaseToken) throw new Error(tr("plans.storeError"));
      await applyApple.mutateAsync({ jws: purchase.purchaseToken, productId: purchase.productId });
      await finishPurchase(purchase);
      flash(tr("plans.applied"));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "cancelled") return;
      setError(
        message === "in_app_purchase_unavailable" ? tr("plans.iapUnavailable") : message,
      );
    }
  };

  const restore = async () => {
    setError(null);
    setBusy("__restore");
    try {
      const owned = await restoreSubscriptions(appleSkus.map((p) => p.sku));
      let applied = 0;
      for (const purchase of owned) {
        if (!purchase.purchaseToken) continue;
        await applyApple.mutateAsync({ jws: purchase.purchaseToken, productId: purchase.productId });
        applied += 1;
      }
      flash(applied > 0 ? tr("plans.restored") : tr("plans.nothingToRestore"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const pick = async (planId: string) => {
    setError(null);
    setBusy(planId);
    try {
      // Paid plans on iOS must go through StoreKit — no external checkout, per guideline 3.1.1.
      if (appStore && skuFor(planId)) {
        await buyWithAppStore(planId);
        return;
      }
      const res = await checkout.mutateAsync({ plan: planId });
      if (res.kind === "contact") {
        const mailto = "mailto" in res ? (res.mailto as string) : "";
        if (mailto) await Linking.openURL(mailto);
        return;
      }
      if (res.kind === "applied") {
        flash(tr("plans.applied"));
        return;
      }
      if (res.kind === "checkout" && res.url) {
        flash(tr("plans.checkoutOpening"));
        await openCheckout(res.url);
        return;
      }
      setError(tr("plans.unavailable"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel={tr("common.close")}
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {tr("plans.title").toUpperCase()}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Only the workspace owner changes the plan — field crews get the reason, not the grid. */}
        {isField ? (
          <View style={[styles.lockCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text
              style={[styles.lockTitle, { color: colors.foreground, fontFamily: Fonts?.displayMedium }]}
            >
              {tr("perm.managerOnly")}
            </Text>
            <Text style={[styles.lede, { color: colors.mutedForeground }]}>
              {tr("perm.planNote")}
            </Text>
          </View>
        ) : (
          <>
        <Text style={[styles.lede, { color: colors.mutedForeground }]}>{tr("plans.choose")}</Text>

        {current.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : null}

        {plans.map((plan) => {
          const isCurrent = plan.id === activeId;
          const isContact = plan.priceCents < 0;
          const isDowngrade = !isContact && plan.priceCents < activePrice;
          const cta = isCurrent
            ? tr("plans.current")
            : isContact
              ? tr("plans.contactSales")
              : isDowngrade
                ? tr("plans.downgrade")
                : tr("plans.upgrade");
          const disabled = isCurrent || !isOwner || busy !== null;

          return (
            <View
              key={plan.id}
              style={[
                styles.card,
                {
                  borderColor: isCurrent ? colors.amber : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View style={styles.cardHead}>
                <Text
                  style={[styles.planName, { color: colors.foreground, fontFamily: Fonts?.display }]}
                >
                  {plan.name.toUpperCase()}
                </Text>
                {isCurrent ? (
                  <View style={[styles.chip, { borderColor: colors.amber }]}>
                    <Text style={[styles.chipText, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                      {tr("plans.current").toUpperCase()}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.amber, fontFamily: Fonts?.display }]}>
                  {plan.priceLabel}
                </Text>
                <Text style={[styles.period, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                  {isContact ? plan.period : tr("plans.perMonth")}
                </Text>
              </View>

              <Text style={[styles.tagline, { color: colors.mutedForeground }]}>{plan.tagline}</Text>

              <View style={styles.features}>
                {plan.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={14} color={colors.verified} />
                    <Text style={[styles.feature, { color: colors.foreground }]}>{feature}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => void pick(plan.id)}
                disabled={disabled}
                accessibilityLabel={`${cta} ${plan.name}`}
                style={[
                  isCurrent || isDowngrade || isContact ? styles.outline : styles.primary,
                  isCurrent || isDowngrade || isContact
                    ? { borderColor: isCurrent ? colors.amber : colors.border }
                    : { backgroundColor: colors.amber },
                  { opacity: disabled && !isCurrent ? 0.5 : 1 },
                ]}
              >
                {busy === plan.id ? (
                  <ActivityIndicator
                    size="small"
                    color={isCurrent || isDowngrade || isContact ? colors.amber : colors.background}
                  />
                ) : (
                  <Text
                    style={[
                      isCurrent || isDowngrade || isContact ? styles.outlineText : styles.primaryText,
                      {
                        color: isCurrent
                          ? colors.amber
                          : isDowngrade || isContact
                            ? colors.foreground
                            : colors.background,
                      },
                    ]}
                  >
                    {cta}
                  </Text>
                )}
              </Pressable>
            </View>
          );
        })}

        {!current.isLoading && !isOwner ? (
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            {tr("plans.ownerOnly")}
          </Text>
        ) : null}

        {appStore ? (
          <Pressable
            onPress={() => void restore()}
            disabled={busy !== null}
            accessibilityLabel={tr("plans.restore")}
            style={[styles.outline, { borderColor: colors.border, opacity: busy ? 0.5 : 1 }]}
          >
            {busy === "__restore" ? (
              <ActivityIndicator size="small" color={colors.amber} />
            ) : (
              <Text style={[styles.outlineText, { color: colors.foreground }]}>
                {tr("plans.restore")}
              </Text>
            )}
          </Pressable>
        ) : null}

        <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {appStore ? tr("plans.appleNote") : tr("plans.stripeNote")}
        </Text>

        {note ? (
          <Text style={[styles.note, { color: colors.verified, fontFamily: Fonts?.mono }]}>
            {note}
          </Text>
        ) : null}
        {error ? <Text style={[styles.note, { color: colors.alert }]}>{error}</Text> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 12 : 6,
    paddingBottom: 10,
  },
  topTitle: { fontSize: 14, letterSpacing: 3 },
  topSpacer: { width: 22 },
  content: { paddingHorizontal: 16, paddingBottom: 44, gap: 12 },
  lede: { fontSize: 12.5, lineHeight: 18 },
  lockCard: { borderWidth: 1, padding: 16, gap: 8, borderRadius: 12 },
  lockTitle: { fontSize: 15, fontWeight: "700" },
  loading: { paddingVertical: 30, alignItems: "center" },
  card: { borderWidth: 1, padding: 14, gap: 10, borderRadius: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  planName: { fontSize: 15, letterSpacing: 2 },
  chip: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  chipText: { fontSize: 9, letterSpacing: 1.4 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  price: { fontSize: 28, letterSpacing: 0.5 },
  period: { fontSize: 10, letterSpacing: 1.2, paddingBottom: 5 },
  tagline: { fontSize: 12, lineHeight: 18 },
  features: { gap: 6 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  feature: { fontSize: 12, lineHeight: 17, flex: 1 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 2,
  },
  primaryText: { fontSize: 13, fontWeight: "700" },
  outline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: 2,
    borderRadius: 8,
  },
  outlineText: { fontSize: 12.5, fontWeight: "600" },
  note: { fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18 },
  footer: { fontSize: 10, textAlign: "center", letterSpacing: 1, marginTop: 4, lineHeight: 16 },
});
