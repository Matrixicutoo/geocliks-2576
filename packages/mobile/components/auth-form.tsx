import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  type TextInput as RNTextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useLocalSearchParams } from "expo-router";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { authClient, setEmailToken } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { LogoMark } from "@/components/logo";
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

/**
 * How long before the code can be mailed again. Same number as the website's own form, so a
 * person bouncing between the two sees one consistent wait.
 */
const RESEND_SECONDS = 50;

/**
 * The one auth screen in the app.
 *
 * There are no passwords on this product and no separate sign-up: an email address plus the
 * 6-digit code mailed to it either signs the person in or creates their account, so the same
 * screen serves the owner setting up a workspace and the crew member accepting an invite.
 * Google goes through the managed broker; X goes through the native social plugin.
 *
 * `app/sign-up.tsx` only forwards here, which is why this component takes no mode.
 */
export function AuthForm() {
  const colors = useColors();
  const t = useT();
  // An invite hands the address over so the crew member never mistypes the invited email. The
  // server refuses any invite accepted from a different address, so the field is locked too.
  const params = useLocalSearchParams<{ email?: string; created?: string }>();
  const invitedEmail = typeof params.email === "string" ? params.email.trim() : "";
  /**
   * Older builds bounced registration to the website and came back through `auth/callback` with
   * `?created=1`. That address is the person's own choice, not an invite, so it must stay editable
   * — only a genuinely invited address is locked.
   */
  const locked = !!invitedEmail && params.created !== "1";

  const [email, setEmail] = useState(invitedEmail);
  const [code, setCode] = useState("");
  /**
   * The OTP field, focused the moment the code step appears.
   *
   * `autoFocus` would do the same, but it is flagged for taking focus away from a screen reader's
   * own reading order; driving it from a ref keeps the keyboard up on arrival without the
   * attribute.
   */
  const codeInput = useRef<RNTextInput>(null);
  /** `email` collects the address, `code` spends the 6 digits mailed to it. */
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState<null | "google" | "apple" | "x" | "send" | "verify">(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Keyboard up as soon as the code step arrives, so the 6 digits can be typed straight in.
  useEffect(() => {
    if (step !== "code") return;
    const id = setTimeout(() => codeInput.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [step]);

  // Ticks the resend countdown down to zero, one second at a time.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

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
   * Apple sign-in. Goes through the managed broker exactly like Google, so there is no Apple OAuth
   * app, service id or signing key of our own to keep alive.
   *
   * App Store Review Guideline 4.8 is the reason this exists: an app offering a third-party login
   * must offer an equivalent privacy-preserving one. The email-code path arguably satisfies it
   * already, but reviewers flag the pattern on sight and each rejection costs a day, so Apple gets
   * a first-class button rather than an argument.
   */
  const apple = async () => {
    setError(null);
    setBusy("apple");
    try {
      await authClient.managedAuth.signIn({ provider: "apple" });
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
   * Mails the 6-digit code. This mints no session, so nothing is stored here — the token only
   * exists once the code is spent below.
   */
  const sendCode = async () => {
    const address = email.trim();
    if (!address) return;
    setError(null);
    setBusy("send");
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: address,
        type: "sign-in",
      });
      if (result.error) {
        setError(result.error.message ?? t("signin.codeSendError"));
        return;
      }
      setCode("");
      setStep("code");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  /**
   * Spends the code. An address the server has never seen gets an account created on the spot,
   * which is why `name` rides along — it is the fallback display name for a brand-new member.
   * The session is created here and nowhere else, so keep the bearer the body carries: the root
   * gate re-reads the session and swaps this screen for the app itself.
   */
  const verifyCode = async () => {
    const address = email.trim();
    setError(null);
    setBusy("verify");
    try {
      const result = await authClient.signIn.emailOtp({
        email: address,
        otp: code.trim(),
        name: address.split("@")[0],
      });
      if (result.error) {
        // Deliberately OUR copy, not the server's: every failure here is the same wrong-or-stale
        // code, and better-auth answers with untranslated English ("Invalid OTP") that would leak
        // into all eleven locales.
        setError(t("signin.codeError"));
        return;
      }
      const token = (result.data as { token?: string | null } | null)?.token;
      if (token) setEmailToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const codeReady = code.trim().length === 6;

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

          {invitedEmail && locked ? (
            <Text
              style={[styles.eyebrow, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {t("signin.joinEyebrow").toUpperCase()}
            </Text>
          ) : null}

          <Text style={[styles.headline, { color: colors.amber, fontFamily: Fonts?.display }]}>
            {step === "code"
              ? t("signin.codeTitle")
              : locked
                ? t("signin.joinTitle")
                : t("signin.mobileHeadline")}
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {step === "code" ? t("signin.codeBody", { email: email.trim() }) : t("signin.mobileSub")}
          </Text>

          {step === "code" ? (
            <View style={styles.codeBlock}>
              <TextInput
                value={code}
                onChangeText={(value) => setCode(value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder={t("signin.codeLabel")}
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                ref={codeInput}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                accessibilityLabel={t("signin.codeLabel")}
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
                disabled={busy !== null || !codeReady}
                accessibilityRole="button"
                accessibilityLabel={t("signin.continue")}
                style={[
                  styles.primary,
                  {
                    backgroundColor: colors.amber,
                    opacity: busy !== null || !codeReady ? 0.5 : 1,
                  },
                ]}
              >
                {busy === "verify" ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.primaryText, { color: colors.background }]}>
                    {t("signin.continue")}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={sendCode}
                disabled={busy !== null || cooldown > 0}
                accessibilityRole="button"
                accessibilityLabel={t("signin.resend")}
              >
                <Text
                  style={[
                    styles.switch,
                    { color: cooldown > 0 ? colors.mutedForeground : colors.amber },
                  ]}
                >
                  {cooldown > 0 ? t("signin.resendIn", { seconds: cooldown }) : t("signin.resend")}
                </Text>
              </Pressable>

              {locked ? null : (
                <Pressable
                  onPress={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t("signin.changeEmail")}
                >
                  <Text style={[styles.switchQuiet, { color: colors.mutedForeground }]}>
                    {t("signin.changeEmail")}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <>
              {/*
                Apple sits above Google and shares the solid-fill treatment on purpose:
                Guideline 4.8 wants the privacy-preserving option no less prominent than the
                third-party one, and "above, identical styling" is the reading no reviewer argues
                with.
              */}
              <Pressable
                onPress={apple}
                disabled={busy !== null}
                accessibilityRole="button"
                accessibilityLabel={t("signin.apple")}
                style={[
                  styles.google,
                  { backgroundColor: colors.foreground, opacity: busy ? 0.7 : 1 },
                ]}
              >
                {busy === "apple" ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={18} color={colors.background} />
                    <Text style={[styles.googleText, { color: colors.background }]}>
                      {t("signin.apple")}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={google}
                disabled={busy !== null}
                accessibilityRole="button"
                accessibilityLabel={t("signin.google")}
                style={[
                  styles.google,
                  styles.stacked,
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
                style={[styles.x, { borderColor: colors.border, opacity: busy ? 0.7 : 1 }]}
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
                  {t("signin.orEmail").toUpperCase()}
                </Text>
                <View style={[styles.rule, { backgroundColor: colors.border }]} />
              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                editable={!locked}
                placeholder={t("signin.emailPlaceholder")}
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel={t("signin.workEmail")}
                style={[
                  styles.input,
                  {
                    color: locked ? colors.mutedForeground : colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              />
              <Text style={[styles.lockNote, { color: colors.mutedForeground }]}>
                {locked ? t("signin.inviteLocked") : t("signin.codeHelp")}
              </Text>

              {error ? (
                <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
              ) : null}

              <Pressable
                onPress={sendCode}
                disabled={busy !== null || !email.trim()}
                accessibilityRole="button"
                accessibilityLabel={t("signin.sendCode")}
                style={[
                  styles.primary,
                  {
                    backgroundColor: colors.amber,
                    opacity: busy !== null || !email.trim() ? 0.5 : 1,
                  },
                ]}
              >
                {busy === "send" ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.primaryText, { color: colors.background }]}>
                    {t("signin.sendCode")}
                  </Text>
                )}
              </Pressable>
            </>
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
  /** Gap between two solid-fill buttons in the same stack (Apple above Google). */
  stacked: { marginTop: 10 },
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
  codeBlock: { gap: 12 },
  /** The six digits read as digits: wide tracking, mono face, centred. */
  codeInput: { letterSpacing: 8, fontSize: 20, textAlign: "center" },
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
  switchQuiet: { fontSize: 12.5, textAlign: "center", marginTop: 2 },
  error: { fontSize: 13 },
  legal: { fontSize: 11, textAlign: "center", marginTop: 22, letterSpacing: 0.5 },
});
