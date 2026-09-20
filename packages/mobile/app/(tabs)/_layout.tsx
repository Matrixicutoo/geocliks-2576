import { useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useT } from "@/lib/i18n";
import { useUnreadMessages } from "@/queries/messages";
import { useOrg } from "@/queries/orgs";
import { useWaitingRoutes } from "@/queries/routes";
import { useHasSession } from "@/hooks/use-session";
import { AuthGate } from "@/components/auth-gate";
import { showsProduct } from "@/lib/product";
import { openAssistant, useAssistantAccess } from "@/lib/assistant";

export default function TabLayout() {
  const colors = useColors();
  const t = useT();
  // Android's gesture bar / 3-button strip sits right under the tabs, so lift the bar clear of it.
  // insets.bottom already covers the system strip in full — adding padding on top of it just
  // leaves dead space, so only apply a floor for devices that report no inset at all.
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(insets.bottom, 8);
  // Unread total drives the Messages tab badge, so a new message is visible from any tab.
  const unread = useUnreadMessages();
  const unreadTotal = unread.data?.total ?? 0;
  // Routes badge = runs handed to this driver for today that he has not started yet, in red.
  // It used to count stops still owed across his active runs, in amber, which meant the badge
  // was loudest in the middle of a shift that was going fine and said nothing special about the
  // one thing he actually has to act on: a route dispatch just gave him. Same signal as the red
  // count on the truck beside the shutter, so the two can never contradict each other.
  const waiting = useWaitingRoutes();
  const org = useOrg();
  // Capture is the one public tab. Every other tab press signed out opens the
  // register/login prompt instead of navigating to a screen with no workspace behind it.
  const { hasSession } = useHasSession();
  // Signing in is the assistant's only gate, on every plan — same rule as the drawer link and
  // the Settings footer link. Signed out there is no workspace to ask about, so no tab either.
  const hasAssistant = useAssistantAccess();
  const [gateOpen, setGateOpen] = useState(false);
  const gateIfSignedOut = {
    tabPress: (e: { preventDefault: () => void }) => {
      if (hasSession) return;
      e.preventDefault();
      setGateOpen(true);
    },
  };
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            height: 68 + bottomGap,
            paddingTop: 8,
            paddingBottom: bottomGap,
          },
          tabBarLabelStyle: { fontSize: 10, letterSpacing: 0.2, marginBottom: 0 },
          tabBarIconStyle: { marginTop: 0 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.capture"),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "camera" : "camera-outline"} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          listeners={gateIfSignedOut}
          options={{
            title: t("tabs.messages"),
            tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.amber, color: colors.background },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        {/*
        Teamspace, Map and Projects keep their routes but are off the tab bar - they are reached
        from the hamburger drawer now, same as Settings. `href: null` hides the tab without
        unregistering the screen, so every existing link to them still resolves.
      */}
        <Tabs.Screen name="teamspace" options={{ href: null, title: t("tabs.teamspace") }} />
        <Tabs.Screen name="map" options={{ href: null, title: t("tabs.map") }} />
        <Tabs.Screen name="projects" options={{ href: null, title: t("tabs.projects") }} />
        {/*
        Hidden outright unless BOTH the role allows delivery AND this is a delivery workspace -
        a field-only Teamspace has no runs to show, and the role check alone let an owner of one
        see the tab. `href: null` keeps the route registered so existing deep links resolve.
      */}
        <Tabs.Screen
          name="routes"
          listeners={gateIfSignedOut}
          options={{
            href: showsProduct(org.data?.product, org.data?.role, "delivery")
              ? undefined
              : null,
            title: t("tabs.routes"),
            tabBarBadge: waiting.length > 0 ? waiting.length : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.alert, color: "#FFFFFF" },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "navigate-circle" : "navigate-circle-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        {/* Settings keeps its route - it lives in the hamburger drawer now, not the tab bar. */}
        <Tabs.Screen name="settings" options={{ href: null, title: t("tabs.settings") }} />
        {/*
        Declared last, so it is the tab furthest to the end of the bar - after Routes. The press
        is intercepted rather than followed: it slides the chat sheet up over the current screen
        instead of navigating, so you keep your place and your transcript.
      */}
        <Tabs.Screen
          name="assistant"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openAssistant();
            },
          }}
          options={{
            href: hasAssistant ? undefined : null,
            title: t("tabs.assistant"),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "sparkles" : "sparkles-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <AuthGate visible={gateOpen} onClose={() => setGateOpen(false)} />
    </>
  );
}
