import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { authClient } from "@/lib/auth";
import { useAcceptInvite, useInviteInfo } from "@/queries/team";
import { clearPendingInvite, readPendingInvite, savePendingInvite } from "@/lib/pending-invite";

/**
 * Invite redemption on the phone. Reached three ways: scanning an invite QR (the web /join page
 * offers the app), tapping "Have an invite code?" on the pre-login screen, or coming back here
 * after signing up. Signed out, the code is stashed first so it survives account creation.
 */
export default function Join() {
  const colors = useColors();
  const router = useRouter();
  const t = useT();
  const params = useLocalSearchParams<{ code?: string }>();
  const initial = typeof params.code === "string" ? params.code : "";

  const [input, setInput] = useState(initial);
  const [code, setCode] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const session = authClient.useSession();
  const signedIn = Boolean(session.data?.user);
  const invite = useInviteInfo(code);
  const accept = useAcceptInvite();

  // An invite names one person. The server refuses a mismatch outright, so rather than let the
  // crew member tap Join and collect an error, the wrong-account case gets its own panel with the
  // one action that actually helps: sign out and come back as the invited address.
  const invitedEmail = invite.data?.email?.trim() ?? "";
  const currentEmail = session.data?.user.email?.trim() ?? "";
  const mismatch =
    signedIn &&
    Boolean(invitedEmail) &&
    Boolean(currentEmail) &&
    invitedEmail.toLowerCase() !== currentEmail.toLowerCase();

  const switchAccount = async () => {
    setError(null);
    const value = code.trim();
    if (value.length >= 4) await savePendingInvite(value);
    await authClient.signOut();
    router.replace(
      invitedEmail ? `/sign-in?email=${encodeURIComponent(invitedEmail)}` : "/sign-in",
    );
  };

  // A code stashed before sign-up is prefilled, so the crew member never retypes it.
  useEffect(() => {
    if (initial) return;
    void readPendingInvite().then((stashed) => {
      if (!stashed) return;
      setInput(stashed);
      setCode(stashed);
    });
  }, [initial]);

  const submit = () => {
    setError(null);
    const value = input.trim();
    setCode(value);
    // Arrived from a QR or an invite email: the code is already resolved, so the arrow
    // is the single tap that carries the crew member on to registration.
    if (value && value === code && invite.data) {
      join();
      return;
    }
  };

  const join = () => {
    const value = code.trim();
    if (value.length < 4) return;
    setError(null);
    if (!signedIn) {
      void savePendingInvite(value);
      const invitedEmail = invite.data?.email;
      // Already registered -> sign in. Otherwise create the account. Same rule as the web page.
      // Both cases go to the in-app form: it signs existing crew in, and offers the website
      // link to the ones who still have to register.
      const target = "/sign-in";
      router.push(
        invitedEmail ? `${target}?email=${encodeURIComponent(invitedEmail)}` : target,
      );
      return;
    }
    accept.mutate(
      { code: value },
      {
        onSuccess: () => {
          void clearPendingInvite();
          router.replace("/");
        },
        onError: (e: Error) => setError(e.message),
      },
    );
  };

  const meta = (label: string, value: string) => (
    <Text key={label} style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
      {label} · {value}
    </Text>
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Pressable
            accessibilityLabel={t("common.close")}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: Fonts?.semibold }]}>
            {t("invite.join")}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.help, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
            {t("invite.codeHelp")}
          </Text>

          <View style={styles.field}>
            <TextInput
              accessibilityLabel={t("invite.codePlaceholder")}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={submit}
              placeholder={t("invite.codePlaceholder")}
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="go"
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.foreground, fontFamily: Fonts?.mono },
              ]}
            />
            <Pressable
              accessibilityLabel={t("invite.join")}
              onPress={submit}
              style={[styles.check, { backgroundColor: colors.amber }]}
            >
              <Ionicons name="arrow-forward" size={18} color="#0B0E13" />
            </Pressable>
          </View>

          {code.trim().length >= 4 && invite.isPending && (
            <View style={styles.center}>
              <ActivityIndicator color={colors.amber} />
              <Text style={[styles.help, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
                {t("join.checking")}
              </Text>
            </View>
          )}

          {code.trim().length >= 4 && invite.isError && (
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: Fonts?.display }]}>
                {t("join.closedTitle")}
              </Text>
              <Text style={[styles.cardBody, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
                {t("invite.codeInvalid")}
              </Text>
            </View>
          )}

          {invite.data && (
            <View style={[styles.card, { borderColor: colors.amber, backgroundColor: colors.card }]}>
              <Text style={[styles.eyebrow, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                {t("join.eyebrow").toUpperCase()}
              </Text>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: Fonts?.display }]}>
                {t("join.headline", {
                  inviter: invite.data.inviterName,
                  workspace: invite.data.workspace,
                })}
              </Text>
              <View style={styles.metaBlock}>
                {meta(t("join.metaEmail"), invite.data.email)}
                {meta(t("join.metaRole"), invite.data.role)}
                {meta(t("join.metaCode"), code.trim().toUpperCase())}
              </View>

              {mismatch ? (
                <View style={[styles.warn, { borderColor: colors.alert, backgroundColor: colors.background }]}>
                  <Text style={[styles.warnTitle, { color: colors.alert, fontFamily: Fonts?.mono }]}>
                    {t("join.mismatchTitle").toUpperCase()}
                  </Text>
                  <Text style={[styles.cardBody, { color: colors.foreground, fontFamily: Fonts?.sans }]}>
                    {t("join.mismatchBody", { invited: invitedEmail, current: currentEmail })}
                  </Text>
                  <Pressable
                    accessibilityLabel={t("join.signOutUse", { email: invitedEmail })}
                    onPress={() => {
                      void switchAccount();
                    }}
                    style={[styles.secondary, { borderColor: colors.alert }]}
                  >
                    <Ionicons name="log-out-outline" size={16} color={colors.alert} />
                    <Text style={[styles.secondaryText, { color: colors.alert, fontFamily: Fonts?.semibold }]}>
                      {t("join.signOutUse", { email: invitedEmail })}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Pressable
                    accessibilityLabel={
                      signedIn
                        ? t("join.accept", { workspace: invite.data.workspace })
                        : t("join.signInToAccept")
                    }
                    onPress={join}
                    disabled={accept.isPending}
                    style={[styles.primary, { backgroundColor: colors.amber, opacity: accept.isPending ? 0.6 : 1 }]}
                  >
                    {accept.isPending ? (
                      <ActivityIndicator color="#0B0E13" />
                    ) : (
                      <Ionicons name={signedIn ? "checkmark-circle" : "arrow-forward"} size={17} color="#0B0E13" />
                    )}
                    <Text style={[styles.primaryText, { fontFamily: Fonts?.semibold }]}>
                      {signedIn
                        ? t("join.accept", { workspace: invite.data.workspace })
                        : t("join.signInToAccept")}
                    </Text>
                  </Pressable>

                  <Text style={[styles.cardBody, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
                    {signedIn
                      ? t("join.signedInAs", { email: session.data?.user.email ?? "" })
                      : t("join.createHint", { email: invite.data.email })}
                  </Text>
                </>
              )}
            </View>
          )}

          {error && (
            <Text style={[styles.error, { color: colors.destructive, fontFamily: Fonts?.sans }]}>
              {error}
            </Text>
          )}

          <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
            {t("join.footer")}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 15, fontWeight: "600" },

  body: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 48 },
  help: { fontSize: 13, lineHeight: 20 },

  field: { marginTop: 18, flexDirection: "row", alignItems: "stretch", gap: 10 },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    letterSpacing: 1.5,
    borderRadius: 8,
  },
  check: { width: 50, alignItems: "center", justifyContent: "center" },

  center: { marginTop: 26, alignItems: "center", gap: 10 },

  card: { marginTop: 24, borderWidth: 1, padding: 18, borderRadius: 12 },
  eyebrow: { fontSize: 9.5, letterSpacing: 1.6 },
  cardTitle: { marginTop: 8, fontSize: 21, fontWeight: "800", lineHeight: 26, letterSpacing: -0.3 },
  cardBody: { marginTop: 12, fontSize: 12.5, lineHeight: 19 },
  metaBlock: { marginTop: 14, gap: 5 },
  meta: { fontSize: 11 },

  primary: {
    marginTop: 20,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
  },
  primaryText: { color: "#0B0E13", fontSize: 14, fontWeight: "700" },

  warn: { marginTop: 18, borderWidth: 1, padding: 14, borderRadius: 12 },
  warnTitle: { fontSize: 9.5, letterSpacing: 1.4 },
  secondary: {
    marginTop: 14,
    minHeight: 46,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  secondaryText: { fontSize: 12.5, fontWeight: "700", textAlign: "center", flexShrink: 1 },

  error: { marginTop: 16, fontSize: 12.5, lineHeight: 19 },
  footer: { marginTop: 28, fontSize: 11.5, lineHeight: 18, textAlign: "center" },
});
