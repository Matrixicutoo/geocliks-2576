import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT, type TKey } from "@/lib/i18n";
import { useOrg } from "@/queries/orgs";
import { signOutCompletely } from "@/lib/sign-out";
import { SUPPORT_EMAIL } from "../constants/support";

type Props = {
  /** Live stamp preview state on the capture screen — the drawer toggles it. */
  showStamp?: boolean;
  onToggleStamp?: (next: boolean) => void;
};

const TILES: {
  href: string;
  /** Extra route params, e.g. the watermark tile jumps to the stamp block inside Settings. */
  params?: Record<string, string>;
  label: TKey;
  icon: keyof typeof Ionicons.glyphMap;
  /** Hidden from field crews, matching the office sidebar. */
  managerOnly?: boolean;
}[] = [
  { href: "/projects", label: "nav.projects", icon: "briefcase-outline" },
  { href: "/teamspace", label: "nav.teamspace", icon: "people-outline" },
  { href: "/map", label: "nav.map", icon: "map-outline" },
  // Messages is a bottom tab too — the drawer lists it so every screen can reach it in one tap.
  { href: "/messages", label: "nav.messages", icon: "chatbubbles-outline" },
  // Team is open to every role, matching the office sidebar: field crews get a contact sheet.
  { href: "/team", label: "nav.team", icon: "person-add-outline" },
  { href: "/reports", label: "nav.reports", icon: "document-text-outline" },
  { href: "/share", label: "nav.share", icon: "link-outline" },
  {
    href: "/settings",
    params: { focus: "stamp" },
    label: "nav.watermarks",
    icon: "pricetag-outline",
    managerOnly: true,
  },
  { href: "/plans", label: "nav.plan", icon: "card-outline", managerOnly: true },
  // The upload queue moved out of the tab bar to make room for Messages.
  { href: "/queue", label: "tabs.queue", icon: "cloud-upload-outline" },
  { href: "/settings", label: "settings.title", icon: "settings-outline" },
];

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || source.slice(0, 2).toUpperCase();
}

/**
 * Left slide-in drawer opened from the hamburger in the capture header.
 * Profile, plan upgrade, quick destinations, stamp toggle and workspace.
 */
export function ProfileMenu({ showStamp, onToggleStamp }: Props) {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tr = useT();
  const org = useOrg();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Panel covers 3/4 of the screen and slides in horizontally, left -> right.
  const width = Dimensions.get("window").width;
  const panelWidth = Math.round(width * 0.75);
  const slide = useRef(new Animated.Value(-panelWidth)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) setMounted(true);
    Animated.parallel([
      Animated.timing(slide, {
        toValue: open ? 0 : -panelWidth,
        duration: open ? 240 : 190,
        easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: open ? 1 : 0,
        duration: open ? 200 : 170,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, panelWidth, slide, fade]);

  const user = org.data?.user;
  const isField = org.data?.role === "field";
  const go = (href: string, params?: Record<string, string>) => {
    setOpen(false);
    router.push((params ? { pathname: href, params } : href) as never);
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await signOutCompletely(queryClient);
      setOpen(false);
      router.replace("/landing");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <Pressable
        accessibilityLabel={tr("profile.menu")}
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={[styles.trigger, { borderColor: colors.amber, backgroundColor: colors.amber }]}
      >
        <Ionicons name="menu" size={26} color={colors.primaryForeground} />
      </Pressable>

      <Modal visible={mounted} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <View style={styles.stage}>
          {/* Tapping anywhere beside the panel closes it. */}
          <Animated.View style={[styles.backdropFill, { opacity: fade }]}>
            <Pressable
              style={styles.backdropFill}
              onPress={() => setOpen(false)}
              accessibilityLabel={tr("common.close")}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.panel,
              {
                width: panelWidth,
                backgroundColor: colors.background,
                borderColor: colors.border,
                transform: [{ translateX: slide }],
              },
            ]}
          >
            <ScrollView contentContainerStyle={styles.panelInner} showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => go("/profile")}
                style={[styles.identity, { borderColor: colors.border }]}
              >
                <View style={[styles.avatar, { borderColor: colors.amber }]}>
                  <Text style={[styles.avatarText, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                    {initials(user?.name, user?.email)}
                  </Text>
                </View>
                <View style={styles.identityText}>
                  <Text
                    numberOfLines={1}
                    style={[styles.name, { color: colors.foreground, fontFamily: Fonts?.displayMedium }]}
                  >
                    {user?.name ?? user?.email ?? "—"}
                  </Text>
                  <Text numberOfLines={1} style={[styles.meta, { color: colors.mutedForeground }]}>
                    {user?.email ?? ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </Pressable>

              {org.data?.role === "field" ? null : (
              <Pressable
                onPress={() => go("/plans")}
                style={[styles.upgrade, { backgroundColor: colors.amber }]}
              >
                <Ionicons name="sparkles" size={15} color={colors.primaryForeground} />
                <Text
                  numberOfLines={1}
                  style={[styles.upgradeText, { color: colors.primaryForeground, fontFamily: Fonts?.mono }]}
                >
                  {tr("profile.upgrade").toUpperCase()}
                  {org.data?.plan.name ? ` · ${org.data.plan.name.toUpperCase()}` : ""}
                </Text>
                <Ionicons name="chevron-forward" size={15} color={colors.primaryForeground} />
              </Pressable>
              )}

              <View style={styles.tiles}>
                {TILES.filter((tile) => !tile.managerOnly || !isField).map((tile) => (
                  <Pressable
                    key={tile.label}
                    accessibilityLabel={tr(tile.label)}
                    onPress={() =>
                      // A nonce makes a repeat tap re-trigger the jump on an already-open screen.
                      go(tile.href, tile.params ? { ...tile.params, n: String(Date.now()) } : undefined)
                    }
                    style={[styles.tile, { borderColor: colors.amber, backgroundColor: colors.amber }]}
                  >
                    <Ionicons name={tile.icon} size={18} color={colors.primaryForeground} />
                    <Text numberOfLines={1} style={[styles.tileText, { color: colors.primaryForeground }]}>
                      {tr(tile.label)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <View style={styles.cardRow}>
                  <Text numberOfLines={2} style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("profile.showStamp")}
                  </Text>
                  <Switch
                    value={!!showStamp}
                    onValueChange={(v) => onToggleStamp?.(v)}
                    disabled={!onToggleStamp}
                    trackColor={{ true: colors.amber, false: colors.border }}
                    thumbColor={colors.background}
                    accessibilityLabel={tr("profile.showStamp")}
                  />
                </View>
                <Pressable
                  onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
                  style={[styles.cardRow, styles.cardRowTop, { borderColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("profile.contact")}
                  </Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                {tr("profile.myTeamspace").toUpperCase()}
              </Text>
              <Pressable
                onPress={() => go("/teamspace")}
                style={[styles.card, styles.workspace, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <Ionicons name="shield-checkmark" size={18} color={colors.verified} />
                <View style={styles.identityText}>
                  <Text
                    numberOfLines={1}
                    style={[styles.name, { color: colors.foreground, fontFamily: Fonts?.displayMedium }]}
                  >
                    {org.data?.org.name ?? "—"}
                  </Text>
                  <Text numberOfLines={1} style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                    {[
                      org.data?.plan.name?.toUpperCase(),
                      org.data ? `${org.data.usage.members} · ${org.data.role.toUpperCase()}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.mutedForeground} />
              </Pressable>

              <Pressable
                onPress={() => void signOut()}
                disabled={signingOut}
                style={[styles.signOut, { borderColor: colors.border, opacity: signingOut ? 0.6 : 1 }]}
              >
                <Ionicons name="log-out-outline" size={16} color={colors.alert} />
                <Text style={[styles.signOutText, { color: colors.alert }]}>
                  {tr("settings.signOut")}
                </Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 8,
  },
  stage: { flex: 1 },
  backdropFill: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
  },
  panelInner: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 32, gap: 12 },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, letterSpacing: 1 },
  identityText: { flex: 1, minWidth: 0 },
  name: { fontSize: 14 },
  meta: { fontSize: 11, marginTop: 3 },
  upgrade: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 8,
  },
  upgradeText: { fontSize: 11, letterSpacing: 1.4, flex: 1 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
    borderRadius: 8,
  },
  tileText: { fontSize: 12, flex: 1 },
  card: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardRowTop: { borderTopWidth: 1 },
  rowText: { fontSize: 12.5, flex: 1 },
  section: { fontSize: 10, letterSpacing: 2, marginTop: 4 },
  workspace: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 12 },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: 4,
    borderRadius: 8,
  },
  signOutText: { fontSize: 12.5, fontWeight: "600" },
});
