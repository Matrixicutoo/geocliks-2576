import { useState } from "react";
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
import Svg, { Path } from "react-native-svg";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { authClient, setEmailToken } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { LogoMark } from "@/components/logo";
import { openWebSignUp as openSignUpUrl } from "@/lib/web-signup";
import { SUPPORT_EMAIL } from "../constants/support";

/**
 * X brand mark, drawn inline.
 *
 * The bundled @expo/vector-icons is 14.1.0, whose Ionicons set has no `logo-x` — only the retired
 * `logo-twitter` bird. Rather than ship the wrong logo (or bump an icon font on the auth screen),
 * the glyph is drawn with react-native-svg using the SAME path data as the web app.
 *
 * That path is duplicated verbatim in web's auth-form.tsx, site-footer.tsx and admin-settings.tsx
 * — keep all four identical.
 */
function XIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.53 3h3.06l-6.69 7.64L21.75 21h-6.16l-4.82-6.3L5.25 21H2.19l7.15-8.17L2.25 3h6.31l4.36 5.77L17.53 3Zm-1.07 16.13h1.7L7.62 4.78H5.8l10.66 14.35Z" />
    </Svg>
  );
}

export type AuthMode = "sign-in" | "sign-up";

/**
 * The whole auth body for both native screens.
 *
 * `app/sign-in.tsx` and `app/sign-up.tsx` are two separate routes so the app matches the website,
 * where /sign-in and /sign-up were split apart. They share this one component on purpose: the
 * Google hand-off, the 2FA second step and the bearer-token dance are fiddly enough that keeping
 * two copies would guarantee they drift.
 */
export function AuthForm({ mode }: { mode: AuthMode }) {
  const colors = useColors();
  const t = useT();
  // An invite hands the address over so the crew member never mistypes the invited email. The
  // server now refuses any invite accepted from a different address, so the field is locked too.
  const params = useLocalSearchParams<{ email?: string; created?: string }>();
  const invitedEmail = typeof params.email === "string" ? params.email.trim() : "";
  /**
   * Set by `auth/callback`, i.e. they registered on the website a second ago and the browser
   * just handed them back. The address is already in the field; all that is left is the
   * password they chose, and this line is what tells them so instead of leaving them staring
   * at a login screen wondering whether the sign-up worked.
   */
  const justCreated = params.created === "1";
  /**
   * Only an INVITED address is locked. Someone coming back from the website sign-up arrives
   * with `?email=` too, but that address is their own choice, not an invite - locking it (and
   * telling them it "comes from your invite") would be a lie they cannot correct after a typo.
   */
  const locked = !!invitedEmail && !justCreated;
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState<null | "google" | "x" | "email">(null);
  const [error, setError] = useState<string | null>(null);
  /**
   * Owners and admins can turn on authenticator 2FA from the website. For those accounts
   * `signIn.email` returns `{ twoFactorRedirect: true }` and no session, so the phone app has to be
   * able to finish the second step too — otherwise turning 2FA on would lock the owner out of the
   * very app they use in the field.
   */
  const [needsCode, setNeedsCode] = useState(false);
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);

  /** Cross-link to the sibling screen, carrying the invited email so context is never lost. */
  const goSibling = () => {
    const to = mode === "sign-in" ? "/sign-up" : "/sign-in";
    router.replace(
      invitedEmail ? `${to}?email=${encodeURIComponent(invitedEmail)}` : to,
    );
  };

  const google = async () => {
    setError(null);
    setBusy("google");
    try {
      await authClient.managedAuth.signIn({ provider: "google" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("AUTH_SESSION_DISMISSED")) setError(message);
    } finally {
      setBusy(null);
    }
  };

  /**
   * X sign-in, the one social provider that does NOT use the managed broker.
   *
   * Google above goes through `managedAuth.signIn`, which runs its own browser round trip. X is a
   * plain better-auth social provider, so it needs the Expo client plugin (see lib/auth.ts) to open
   * the browser, catch our scheme on the way back, and store the session. `callbackURL` is a path
   * on the API host, not a deep link: the plugin rewrites the return hop to the app itself.
   *
   * A cancelled browser session is not an error worth showing — the person tapped "Done".
   */
  const withX = async () => {
    setError(null);
    setBusy("x");
    try {
      await authClient.signIn.social({ provider: "twitter", callbackURL: "/app" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("AUTH_SESSION_DISMISSED") && !/dismiss|cancel/i.test(message)) {
        setError(message);
      }
    } finally {
      setBusy(null);
    }
  };

  /**
   * Registration happens on the website, not in the app.
   *
   * New accounts are protected by a Cloudflare Turnstile challenge, and Turnstile has no native
   * React Native widget — Cloudflare requires a real browser, and it is widely broken inside iOS
   * WKWebView. Rather than ship an untestable in-app WebView bridge, sign-up opens the site in the
   * phone's browser and the crew comes back here to sign in. Most crew members arrive through an
   * invite link anyway, so this path is mainly for the person creating the workspace.
   */
  const openWebSignUp = async () => {
    setError(null);
    const blocked = await openSignUpUrl(invitedEmail);
    if (blocked) setError(`${t("signin.openInBrowser")} ${blocked}`);
  };

  const withEmail = async () => {
    setError(null);
    setBusy("email");
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message ?? t("signin.authError"));
        return;
      }
      if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        setNeedsCode(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const verifyCode = async () => {
    setError(null);
    setBusy("email");
    try {
      const trimmed = code.trim();
      const result = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code: trimmed })
        : await authClient.twoFactor.verifyTotp({ code: trimmed });
      if (result.error) {
        setError(t("signin.twoFactorError"));
        return;
      }
      // The session is created here, not at sign-in: keep the bearer the body carries.
      const token = (result.data as { token?: string | null } | null)?.token;
      if (token) setEmailToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const headline = mode === "sign-up" && invitedEmail ? t("signin.joinTitle") : t("signin.mobileHeadline");

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.mark}>
              <LogoMark size={34} />
            </View>
            <Text style={[styles.brand, { color: colors.foreground, fontFamily: Fonts?.display }]}>
              GEO<Text style={{ color: colors.amber }}>CLIKS</Text>
            </Text>
          </View>

          {mode === "sign-up" && invitedEmail ? (
            <Text style={[styles.eyebrow, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {t("signin.joinEyebrow").toUpperCase()}
            </Text>
          ) : null}

          <Text style={[styles.headline, { color: colors.amber, fontFamily: Fonts?.display }]}>
            {headline}
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {t("signin.mobileSub")}
          </Text>

          {needsCode ? null : (
            <>
              <Pressable
                onPress={google}
                disabled={busy !== null}
                accessibilityRole="button"
                accessibilityLabel={t("signin.google")}
                style={[
                  styles.google,
                  { backgroundColor: colors.foreground, opacity: busy ? 0.7 : 1 },
                ]}
              >
                {busy === "google" ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color={colors.background} />
                    <Text style={[styles.googleText, { color: colors.background }]}>
                      {t("signin.google")}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={withX}
                disabled={busy !== null}
                accessibilityRole="button"
                accessibilityLabel={t("signin.x")}
                style={[
                  styles.x,
                  { borderColor: colors.border, opacity: busy ? 0.7 : 1 },
                ]}
              >
                {busy === "x" ? (
                  <ActivityIndicator color={colors.foreground} />
                ) : (
                  <>
                    <XIcon size={18} color={colors.foreground} />
                    <Text style={[styles.xText, { color: colors.foreground }]}>
                      {t("signin.x")}
                    </Text>
                  </>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={[styles.rule, { backgroundColor: colors.border }]} />
                <Text
                  style={[styles.or, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                >
                  {t("signin.or").toUpperCase()}
                </Text>
                <View style={[styles.rule, { backgroundColor: colors.border }]} />
              </View>
            </>
          )}

          {needsCode ? (
            <View style={styles.webSignUp}>
              <Text
                style={[styles.codeTitle, { color: colors.foreground, fontFamily: Fonts?.display }]}
              >
                {t("signin.twoFactorTitle")}
              </Text>
              <Text style={[styles.webSignUpBody, { color: colors.mutedForeground }]}>
                {t("signin.twoFactorBody")}
              </Text>
              <TextInput
                value={code}
                onChangeText={(value) =>
                  setCode(useBackup ? value : value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                placeholder={
                  useBackup ? t("signin.twoFactorBackupPlaceholder") : t("signin.twoFactorCode")
                }
                placeholderTextColor={colors.mutedForeground}
                keyboardType={useBackup ? "default" : "number-pad"}
                autoCapitalize="characters"
                autoCorrect={false}
                accessibilityLabel={
                  useBackup ? t("signin.twoFactorBackupPlaceholder") : t("signin.twoFactorCode")
                }
                style={[
                  styles.input,
                  styles.codeInput,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    fontFamily: Fonts?.mono,
                  },
                ]}
              />
              {error ? (
                <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
              ) : null}
              <Pressable
                onPress={verifyCode}
                disabled={busy !== null || code.trim().length < 6}
                accessibilityRole="button"
                accessibilityLabel={t("signin.twoFactorVerify")}
                style={[
                  styles.primary,
                  {
                    backgroundColor: colors.amber,
                    opacity: busy !== null || code.trim().length < 6 ? 0.5 : 1,
                  },
                ]}
              >
                {busy === "email" ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.primaryText, { color: colors.background }]}>
                    {t("signin.twoFactorVerify")}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setUseBackup((v) => !v);
                  setCode("");
                  setError(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  useBackup ? t("signin.twoFactorUseApp") : t("signin.twoFactorBackup")
                }
              >
                <Text style={[styles.switch, { color: colors.mutedForeground }]}>
                  {useBackup ? t("signin.twoFactorUseApp") : t("signin.twoFactorBackup")}
                </Text>
              </Pressable>
            </View>
          ) : mode === "sign-up" ? (
            <View style={styles.webSignUp}>
              <Text style={[styles.webSignUpBody, { color: colors.mutedForeground }]}>
                {t("signin.signUpWebBody")}
              </Text>
              {error ? (
                <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
              ) : null}
              <Pressable
                onPress={openWebSignUp}
                accessibilityRole="button"
                accessibilityLabel={t("signin.signUpWebButton")}
                style={[styles.primary, { backgroundColor: colors.amber }]}
              >
                <Ionicons name="open-outline" size={17} color={colors.background} />
                <Text style={[styles.primaryText, { color: colors.background }]}>
                  {t("signin.signUpWebButton")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {justCreated ? (
                <View
                  style={[styles.notice, { borderColor: colors.success, backgroundColor: colors.card }]}
                >
                  <Ionicons name="checkmark-circle" size={17} color={colors.success} />
                  <Text style={[styles.noticeText, { color: colors.foreground }]}>
                    {t("signin.accountCreated")}
                  </Text>
                </View>
              ) : null}
              <TextInput
                value={email}
                onChangeText={setEmail}
                editable={!locked}
                placeholder={t("signin.emailPlaceholder")}
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel={t("signin.emailPlaceholder")}
                style={[
                  styles.input,
                  {
                    color: locked ? colors.mutedForeground : colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              />
              {locked ? (
                <Text style={[styles.lockNote, { color: colors.mutedForeground }]}>
                  {t("signin.inviteLocked")}
                </Text>
              ) : null}
              <View style={styles.pwWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("signin.password")}
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel={t("signin.password")}
                  style={[
                    styles.input,
                    styles.pwInput,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                />
                <Pressable
                  onPress={() => setShowPw((v) => !v)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t(showPw ? "signin.hidePassword" : "signin.showPassword")}
                  style={styles.pwToggle}
                >
                  <Ionicons
                    name={showPw ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>

              {error ? (
                <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
              ) : null}

              <Pressable
                onPress={withEmail}
                disabled={busy !== null || !email || password.length < 8}
                accessibilityRole="button"
                accessibilityLabel={locked ? t("signin.submitJoin") : t("signin.submitSignIn")}
                style={[
                  styles.primary,
                  {
                    backgroundColor: colors.amber,
                    opacity: busy !== null || !email || password.length < 8 ? 0.5 : 1,
                  },
                ]}
              >
                {busy === "email" ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.primaryText, { color: colors.background }]}>
                    {locked ? t("signin.submitJoin") : t("signin.submitSignIn")}
                  </Text>
                )}
              </Pressable>
            </>
          )}

          {needsCode ? null : (
            <Pressable
              onPress={mode === "sign-in" ? openWebSignUp : goSibling}
              accessibilityRole="button"
              accessibilityLabel={
                mode === "sign-in"
                  ? `${t("signin.noAccount")} ${t("signin.goCreate")}`
                  : `${t("signin.haveAccount")} ${t("signin.goSignIn")}`
              }
            >
              <Text style={[styles.switch, { color: colors.mutedForeground }]}>
                {mode === "sign-in"
                  ? `${t("signin.noAccount")} `
                  : `${t("signin.haveAccount")} `}
                <Text style={{ color: colors.amber }}>
                  {mode === "sign-in" ? t("signin.goCreate") : t("signin.goSignIn")}
                </Text>
              </Text>
            </Pressable>
          )}

          <Text style={[styles.legal, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {SUPPORT_EMAIL}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, gap: 12, flexGrow: 1, justifyContent: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 16, letterSpacing: 3 },
  eyebrow: { fontSize: 11, letterSpacing: 2, marginTop: 24 },
  headline: { fontSize: 24, marginTop: 24, lineHeight: 30 },
  sub: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  google: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 8,
  },
  googleText: { fontSize: 15, fontWeight: "600" },
  /**
   * X is the secondary provider, so it reads as an outline button against Google's solid fill
   * rather than competing with it. Same height and radius so the pair still looks like one stack.
   */
  x: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  xText: { fontSize: 15, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 6 },
  rule: { height: 1, flex: 1 },
  or: { fontSize: 11, letterSpacing: 2 },
  input: { height: 50, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, borderRadius: 8 },
  lockNote: { marginTop: -4, fontSize: 11.5, lineHeight: 17 },
  pwWrap: { position: "relative", justifyContent: "center" },
  pwInput: { paddingRight: 48 },
  pwToggle: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  webSignUp: { gap: 12 },
  codeTitle: { fontSize: 22, lineHeight: 28 },
  codeInput: { letterSpacing: 6, fontSize: 18 },
  webSignUpBody: { fontSize: 13.5, lineHeight: 20 },
  primary: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    borderRadius: 8,
  },
  primaryText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },
  switch: { fontSize: 13, textAlign: "center", marginTop: 14 },
  error: { fontSize: 13 },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  noticeText: { flex: 1, fontSize: 13.5, lineHeight: 19 },
  legal: { fontSize: 11, textAlign: "center", marginTop: 22, letterSpacing: 0.5 },
});
