// System-managed layout — extend in place, never rewrite from scratch.
// Keep the provider chain intact: ErrorBoundary → OneDollarStats → SafeArea → QueryClient.
// To switch navigation, replace only the <Slot /> line with <Stack /> or <Tabs />.
import "../lib/crypto-polyfill";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import { Manrope_500Medium, Manrope_600SemiBold } from "@expo-google-fonts/manrope";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import { ActivityIndicator, View } from "react-native";
import { ErrorBoundary } from "../components/__ErrorBoundary";
import { OneDollarStatsProvider } from "../lib/__analytics";
import { isWeb, startWebSafeArea } from "../lib/__web-safe-area";
import { authClient } from "../lib/auth";
import { useOrg } from "../queries/orgs";
import { canUseDelivery, canUseField } from "../lib/roles";
import { usePendingInvite } from "../hooks/use-pending-invite";
import { usePushToken } from "../hooks/use-push-token";
import { useDrainOnSignIn } from "../hooks/use-drain-on-signin";
import { ThemeProvider, useAppTheme } from "../lib/theme";
import { I18nProvider } from "../lib/i18n";
import appJson from "../app.json";

const queryClient = new QueryClient();

const applicationId = appJson.expo.extra.applicationId ?? "";
const hostname = applicationId ? `${applicationId}-mobile` : "localhost";

/**
 * Screens that belong to exactly ONE product. A `driver` has no projects and no job photos;
 * a `field` member has no routes. The tab bar and the drawer already hide the entries, but
 * every screen stays REGISTERED so old deep links keep resolving — which means the URL alone
 * could still open the wrong product's screen. These sets are what close that off.
 */
const FIELD_ONLY_SCREENS = ["teamspace", "map", "projects", "reports"];
const DELIVERY_ONLY_SCREENS = ["routes", "route"];

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const org = useOrg();
  const { data: session, isPending } = authClient.useSession();
  // Redeems an invite code stashed before sign-up, so scanning a QR lands the crew member
  // inside the workspace that invited them instead of a fresh empty one.
  usePendingInvite(Boolean(session));
  // Registers this device for internal-message push once signed in (native builds only).
  usePushToken(Boolean(session));
  // Uploads anything captured before signing in, so photos taken without an account land
  // in the team space the moment one exists.
  useDrainOnSignIn(Boolean(session));

  useEffect(() => {
    void authClient.managedAuth.handleRedirect();
  }, []);

  useEffect(() => {
    if (isPending) return;
    // Signed-out visitors land on the CAMERA, not the marketing screen: the app has to be
    // useful before it asks for anything. Only the capture tab is public — every other tab
    // is intercepted in (tabs)/_layout.tsx and opens the register/login prompt. The queue is
    // public too because it is purely device-local: it lists the captures already saved on
    // this phone, which is exactly what a signed-out user needs to see.
    // expo-router types `segments` as a union of fixed-length tuples, so index 1 is only
    // legal after widening it to a plain string list.
    const parts: string[] = [...segments];
    const isCaptureTab = parts[0] === "(tabs)" && (parts.length === 1 || parts[1] === "index");
    const inPublicFlow =
      isCaptureTab ||
      segments[0] === "sign-in" ||
      segments[0] === "sign-up" ||
      segments[0] === "auth" ||
      segments[0] === "landing" ||
      segments[0] === "verify" ||
      segments[0] === "join" ||
      segments[0] === "queue";
    if (!session && !inPublicFlow) router.replace("/");
    if (
      session &&
      (segments[0] === "sign-in" || segments[0] === "sign-up" || segments[0] === "landing")
    )
      router.replace("/");
  }, [session, isPending, segments, router]);

  // Product split: bounce a member off the side of the app their membership does not cover,
  // onto the home of the side it does. Waits for the real role — redirecting on an undefined
  // role would throw everyone off their own landing screen on a cold start. Presentation
  // only; the server refuses the same calls in `fieldProc` / `requireDelivery`.
  const role = org.data?.role;
  useEffect(() => {
    if (!session || !role) return;
    const parts: string[] = [...segments];
    const screen = parts[0] === "(tabs)" ? (parts[1] ?? "index") : parts[0];
    if (!screen) return;
    if (FIELD_ONLY_SCREENS.includes(screen) && !canUseField(role)) router.replace("/routes");
    else if (DELIVERY_ONLY_SCREENS.includes(screen) && !canUseDelivery(role))
      router.replace("/teamspace");
  }, [session, role, segments, router]);

  const { colors, scheme } = useAppTheme();

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="messages/[id]" />
        <Stack.Screen name="queue" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="plans" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="join" />
      </Stack>
    </>
  );
}

/** Splash while fonts load — inside the provider so it follows the app theme. */
function FontSplash() {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (isWeb) startWebSafeArea();
  }, []);

  return (
    <ErrorBoundary>
      {/* Runable analytics provider — do not remove, required for analytics tracking */}
      <OneDollarStatsProvider
        config={{
          hostname,
          collectorUrl: "https://r.lilstts.com/events",
          devmode: true,
        }}
      >
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <I18nProvider>{fontsLoaded ? <Gate /> : <FontSplash />}</I18nProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </OneDollarStatsProvider>
    </ErrorBoundary>
  );
}
