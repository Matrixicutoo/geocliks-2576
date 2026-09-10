import { useMemo, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useT } from "@/lib/i18n";
import { useUnreadMessages } from "@/queries/messages";
import { useOrg } from "@/queries/orgs";
import { useRoutes } from "@/queries/routes";
import { useHasSession } from "@/hooks/use-session";
import { AuthGate } from "@/components/auth-gate";
import { canUseDelivery } from "@/lib/roles";

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
  // Routes badge = stops still owed on the driver's own runs, so an order added mid-shift
  // shows up from any tab. Counts assigned routes too: the run he has not started yet is
  // exactly the one he needs prodding about.
  const myRoutes = useRoutes();
  const org = useOrg();
  // Capture is the one public tab. Every other tab press signed out opens the
  // register/login prompt instead of navigating to a screen with no workspace behind it.
  const { hasSession } = useHasSession();
  const [gateOpen, setGateOpen] = useState(false);
  const gateIfSignedOut = {
    tabPress: (e: { preventDefault: () => void }) => {
      if (hasSession) return;
      e.preventDefault();
      setGateOpen(true);
    },
  };
  const myId = org.data?.user?.id ?? null;
  const stopsLeft = useMemo(() => {
    let left = 0;
    for (const route of myRoutes.data ?? []) {
      if (route.driverId !== myId) continue;
      if (route.status !== "active" && route.status !== "assigned") continue;
      left += Math.max(0, (route.stopCount ?? 0) - (route.doneCount ?? 0));
    }
    return left;
  }, [myRoutes.data, myId]);

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
        A field member has no delivery access at all, so the Routes tab is hidden outright
        rather than opening a screen the server would refuse. `href: null` keeps the route
        registered so existing deep links still resolve.
      */}
        <Tabs.Screen
          name="routes"
          listeners={gateIfSignedOut}
          options={{
            href: canUseDelivery(org.data?.role) ? undefined : null,
            title: t("tabs.routes"),
            tabBarBadge: stopsLeft > 0 ? stopsLeft : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.amber, color: colors.background },
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
      </Tabs>
      <AuthGate visible={gateOpen} onClose={() => setGateOpen(false)} />
    </>
  );
}
