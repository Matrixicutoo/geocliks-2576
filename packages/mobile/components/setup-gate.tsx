import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { LogoMark } from "@/components/logo";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { canSetUpWorkspace } from "@/lib/roles";
import { useOrg, useSetupOrg } from "@/queries/orgs";
import type { Product } from "@/lib/product";

/**
 * First-run onboarding on the phone, and the only thing standing between a fresh account and
 * the app. The twin of the website's `SetupGate` — same two questions, same order, same words,
 * firing the same `orgs.setup` mutation.
 *
 * It has to exist on both clients or the products drift apart: registering on the phone used to
 * skip these questions entirely, which left the workspace on its auto-provisioned "Alex's Team"
 * name with `product === null` — and a null product is "show both systems", so a brand new owner
 * was handed job photos AND delivery routes instead of the one they run. The trial never started
 * either, since the product answer is what picks which plan the free week grants.
 *
 * Invited members never see it. They joined a Teamspace somebody else already set up, so the
 * gate is skipped for every role below admin — asking a driver to name their boss's company is
 * nonsense.
 *
 * Nothing here can be dismissed, and there is deliberately no back-to-the-app escape: an
 * unanswered product leaves the app with no home screen to send anyone to.
 */
export function SetupGate({ children }: { children: React.ReactNode }) {
  const t = useT();
  const colors = useColors();
  const org = useOrg();
  const setup = useSetupOrg();
  const [step, setStep] = useState<1 | 2>(1);
  const [userName, setUserName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prefilled = useRef(false);

  const needsSetup = Boolean(org.data?.needsSetup) && canSetUpWorkspace(org.data?.role);

  /**
   * A code sign-in has no name field, so Better Auth seeds `user.name` from the address
   * ("rosa.diaz" for rosa.diaz@…). It is a starting point, not an answer — prefill it and let
   * them write their real name over it. The Teamspace field starts empty on purpose: the
   * auto-provisioned "Rosa's Team" is exactly what this form exists to replace.
   */
  useEffect(() => {
    if (prefilled.current || !org.data) return;
    prefilled.current = true;
    setUserName(org.data.user.name ?? "");
  }, [org.data]);

  if (!needsSetup) return <>{children}</>;

  const canContinue = userName.trim().length >= 1 && orgName.trim().length >= 2;

  const submit = (chosen: Product) => {
    setError(null);
    setProduct(chosen);
    setup.mutate(
      { userName: userName.trim(), name: orgName.trim(), product: chosen },
      {
        // `needsSetup` flips to false once `orgs.current` refetches, which unmounts this gate.
        onError: (e: Error) => setError(e.message || t("setup.error")),
      },
    );
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <LogoMark size={34} />
            <Text style={[styles.brand, { color: colors.foreground, fontFamily: Fonts?.display }]}>
              GEO<Text style={{ color: colors.amber }}>CLIKS</Text>
            </Text>
          </View>

          <Text style={[styles.eyebrow, { color: colors.amber, fontFamily: Fonts?.mono }]}>
            {t("setup.stepOf", { n: step }).toUpperCase()}
          </Text>

          {step === 1 ? (
            <>
              <Text
                style={[styles.headline, { color: colors.foreground, fontFamily: Fonts?.display }]}
              >
                {t("setup.title")}
              </Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>{t("setup.body")}</Text>

              <View style={styles.fields}>
                <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                  {t("setup.yourName").toUpperCase()}
                </Text>
                <TextInput
                  value={userName}
                  onChangeText={setUserName}
                  maxLength={80}
                  autoFocus
                  autoCapitalize="words"
                  placeholder={t("setup.yourNamePlaceholder")}
                  placeholderTextColor={colors.mutedForeground}
                  accessibilityLabel={t("setup.yourName")}
                  style={[
                    styles.input,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.label,
                    styles.labelGap,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {t("setup.orgName").toUpperCase()}
                </Text>
                <TextInput
                  value={orgName}
                  onChangeText={setOrgName}
                  maxLength={80}
                  autoCapitalize="words"
                  placeholder={t("setup.orgNamePlaceholder")}
                  placeholderTextColor={colors.mutedForeground}
                  accessibilityLabel={t("setup.orgName")}
                  style={[
                    styles.input,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  {t("setup.orgNameHint")}
                </Text>
              </View>

              <Pressable
                onPress={() => setStep(2)}
                disabled={!canContinue}
                accessibilityRole="button"
                accessibilityLabel={t("setup.next")}
                style={[styles.primary, { backgroundColor: colors.amber, opacity: canContinue ? 1 : 0.5 }]}
              >
                <Text
                  style={[styles.primaryText, { color: colors.background, fontFamily: Fonts?.mono }]}
                >
                  {t("setup.next").toUpperCase()}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text
                style={[styles.headline, { color: colors.foreground, fontFamily: Fonts?.display }]}
              >
                {t("setup.systemTitle")}
              </Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                {t("setup.systemBody")}
              </Text>

              <View style={styles.cards}>
                <SystemCard
                  icon="camera-outline"
                  title={t("setup.fieldTitle")}
                  body={t("setup.fieldBody")}
                  trial={t("setup.fieldTrial")}
                  busy={setup.isPending && product === "field"}
                  disabled={setup.isPending}
                  onPick={() => submit("field")}
                />
                <SystemCard
                  icon="navigate-circle-outline"
                  title={t("setup.deliveryTitle")}
                  body={t("setup.deliveryBody")}
                  trial={t("setup.deliveryTrial")}
                  busy={setup.isPending && product === "delivery"}
                  disabled={setup.isPending}
                  onPick={() => submit("delivery")}
                />
              </View>

              <View style={styles.noteRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color={colors.verified}
                  style={{ marginTop: 1 }}
                />
                <Text style={[styles.note, { color: colors.mutedForeground }]}>
                  {t("setup.trialNote")}
                </Text>
              </View>

              {error ? (
                <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
              ) : null}

              <Pressable
                onPress={() => setStep(1)}
                disabled={setup.isPending}
                accessibilityRole="button"
                accessibilityLabel={t("setup.back")}
                style={[
                  styles.back,
                  { borderColor: colors.border, opacity: setup.isPending ? 0.5 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.backText,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {t("setup.back").toUpperCase()}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** One of the two systems, as a tap-sized pitch: what it does, and what the free week grants. */
function SystemCard({
  icon,
  title,
  body,
  trial,
  busy,
  disabled,
  onPick,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  trial: string;
  busy: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPick}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: pressed ? colors.amber : colors.border,
          backgroundColor: colors.card,
          opacity: disabled && !busy ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.cardHead}>
        <View style={[styles.cardIcon, { borderColor: colors.amber }]}>
          <Ionicons name={icon} size={18} color={colors.amber} />
        </View>
        {busy ? <ActivityIndicator color={colors.amber} /> : null}
      </View>
      <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: Fonts?.displayMedium }]}>
        {title}
      </Text>
      <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>{body}</Text>
      <Text style={[styles.cardTrial, { color: colors.verified, fontFamily: Fonts?.mono }]}>
        {trial.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 22, paddingBottom: 40 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brand: { fontSize: 18, letterSpacing: 0.4 },
  eyebrow: { fontSize: 10.5, letterSpacing: 1.4, marginTop: 34 },
  headline: { fontSize: 25, lineHeight: 31, letterSpacing: -0.3, marginTop: 6 },
  sub: { fontSize: 13, lineHeight: 19, marginTop: 7 },
  fields: { marginTop: 24 },
  label: { fontSize: 10.5, letterSpacing: 1.2, marginBottom: 6 },
  labelGap: { marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 },
  hint: { fontSize: 11.5, lineHeight: 17, marginTop: 7 },
  primary: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryText: { fontSize: 11.5, letterSpacing: 1.4 },
  cards: { marginTop: 22, gap: 12 },
  card: { borderWidth: 1, borderRadius: 10, padding: 16 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardIcon: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, lineHeight: 21, marginTop: 12 },
  cardBody: { fontSize: 12.5, lineHeight: 18, marginTop: 6 },
  cardTrial: { fontSize: 10, letterSpacing: 1, marginTop: 11 },
  noteRow: { flexDirection: "row", gap: 7, marginTop: 18 },
  note: { flex: 1, fontSize: 11.5, lineHeight: 17 },
  error: { fontSize: 12.5, marginTop: 12 },
  back: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 18,
  },
  backText: { fontSize: 10.5, letterSpacing: 1.2 },
});
