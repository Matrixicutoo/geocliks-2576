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
import { usePendingInvite } from "../hooks/use-pending-invite";
import { usePushToken } from "../hooks/use-push-token";
import { ThemeProvider, useAppTheme } from "../lib/theme";
import { I18nProvider } from "../lib/i18n";
import appJson from "../app.json";

const queryClient = new QueryClient();

const applicationId = appJson.expo.extra.applicationId ?? "";
const hostname = applicationId ? `${applicationId}-mobile` : "localhost";

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { data: session, isPending } = authClient.useSession();
  // Redeems an invite code stashed before sign-up, so scanning a QR lands the crew member
  // inside the workspace that invited them instead of a fresh empty one.
  usePendingInvite(Boolean(session));
  // Registers this device for internal-message push once signed in (native builds only).
  usePushToken(Boolean(session));

  useEffect(() => {
    void authClient.managedAuth.handleRedirect();
  }, []);

  useEffect(() => {
    if (isPending) return;
    // Signed-out visitors land on the marketing screen; sign-in is one tap from there.
    const inPublicFlow =
      segments[0] === "sign-in" ||
      segments[0] === "sign-up" ||
      segments[0] === "auth" ||
      segments[0] === "landing" ||
      segments[0] === "verify" ||
      segments[0] === "join";
    if (!session && !inPublicFlow) router.replace("/landing");
    if (
      session &&
      (segments[0] === "sign-in" || segments[0] === "sign-up" || segments[0] === "landing")
    )
      router.replace("/");
  }, [session, isPending, segments, router]);

  const { colors, scheme } = useAppTheme();

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
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
