import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
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
import { useOrg, useTemplates } from "@/queries/orgs";
import { signOutCompletely } from "@/lib/sign-out";
import { webHelpUrl, webUrl } from "@/lib/web-help";
import { useHasSession } from "@/hooks/use-session";
import { AuthGate } from "@/components/auth-gate";
import { LanguageMenu } from "@/components/language-menu";
import { InviteSheet } from "@/components/invite-sheet";
import { useAppTheme } from "@/lib/theme";
import { SUPPORT_EMAIL } from "../constants/support";
import { canManageWatermarks, canManageWorkspace, canUseField } from "../lib/roles";

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
  /**
   * Tighter than `managerOnly`: owner and admin only. A manager no longer curates the company
   * stamp. Capturing WITH a stamp is unaffected — that reads the template, it does not edit it.
   */
  adminOnly?: boolean;
  /**
   * Belongs to the field product, so a `driver` never sees it — they have no field access
   * and the server refuses these endpoints anyway. Mirrors FIELD_ONLY in the web sidebar.
   */
  fieldOnly?: boolean;
}[] = [
  { href: "/projects", label: "nav.projects", icon: "briefcase-outline", fieldOnly: true },
  { href: "/teamspace", label: "nav.teamspace", icon: "people-outline", fieldOnly: true },
  // Captures that are not filed under any project — including everything shot before the
  // crew signed in. Open to every role: a field member's own unfiled shots are their own.
  { href: "/my-captures", label: "nav.mine", icon: "images-outline" },
  { href: "/map", label: "nav.map", icon: "map-outline", fieldOnly: true },
  // Messages is a bottom tab too — the drawer lists it so every screen can reach it in one tap.
  { href: "/messages", label: "nav.messages", icon: "chatbubbles-outline" },
  // Team is open to every role, matching the office sidebar: field crews get a contact sheet.
  { href: "/team", label: "nav.team", icon: "person-add-outline" },
  { href: "/reports", label: "nav.reports", icon: "document-text-outline", fieldOnly: true },
  { href: "/share", label: "nav.share", icon: "link-outline" },
  {
    href: "/settings",
    params: { focus: "stamp" },
    label: "nav.watermarks",
    icon: "pricetag-outline",
    managerOnly: true,
    adminOnly: true,
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
  // Appearance and language are answered in the drawer now, not only in Settings.
  const { scheme, setTheme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { hasSession } = useHasSession();
  // Signed out every destination in this drawer is locked. Tapping one explains why and
  // offers the two doors instead of failing silently.
  const [gateOpen, setGateOpen] = useState(false);
  // Invite opens over whatever screen you were on, so it is a sheet of its own rather than a
  // destination. It is rendered outside the drawer's Modal, which unmounts when the drawer shuts.
  const [inviteOpen, setInviteOpen] = useState(false);

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
  // Workspace identity, not watermark configuration: the business logo shows whenever one
  // exists. The Show/Hide toggle only governs the stamp, so it is deliberately not consulted
  // here, and the default template's logo is a fallback for workspaces that only set that one.
  const templates = useTemplates();
  const brandTemplate = templates.data?.find((tpl) => tpl.isDefault) ?? templates.data?.[0] ?? null;
  const brandLogo = org.data?.org?.logoUrl ?? brandTemplate?.logoUrl ?? null;
  const myRole = org.data?.role;
  const isField = !canManageWorkspace(myRole);
  const go = (href: string, params?: Record<string, string>) => {
    setOpen(false);
    // Every drawer destination needs a workspace — except the upload queue, which is purely
    // device-local and is how a signed-out user reviews the shots already on this phone.
    // Signed out, every other tap opens the register/login prompt instead of pushing a
    // screen that would only bounce.
    if (!hasSession && href !== "/queue") {
      setGateOpen(true);
      return;
    }
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
        <Ionicons name="menu" size={22} color={colors.primaryForeground} />
      </Pressable>

      <Modal
        visible={mounted}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
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
            <ScrollView
              contentContainerStyle={styles.panelInner}
              showsVerticalScrollIndicator={false}
            >
              {hasSession ? (
                <Pressable
                  onPress={() => go("/profile")}
                  style={[styles.identity, { borderColor: colors.border }]}
                >
                  {user?.image ? (
                    <Image
                      source={{ uri: user.image }}
                      style={[styles.avatar, { borderColor: colors.amber }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, { borderColor: colors.amber }]}>
                      <Text
                        style={[
                          styles.avatarText,
                          { color: colors.amber, fontFamily: Fonts?.mono },
                        ]}
                      >
                        {initials(user?.name, user?.email)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.identityText}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.name,
                        { color: colors.foreground, fontFamily: Fonts?.displayMedium },
                      ]}
                    >
                      {user?.name ?? user?.email ?? "—"}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.meta, { color: colors.mutedForeground }]}
                    >
                      {user?.email ?? ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                </Pressable>
              ) : (
                /* Signed out there is no profile to open, so the header becomes the two doors. */
                <View
                  style={[styles.identity, styles.identityAnon, { borderColor: colors.border }]}
                >
                  <Text
                    style={[
                      styles.name,
                      { color: colors.foreground, fontFamily: Fonts?.displayMedium },
                    ]}
                  >
                    {tr("gate.title")}
                  </Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {tr("gate.body")}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setOpen(false);
                      router.push("/sign-up");
                    }}
                    style={[
                      styles.anonPrimary,
                      { backgroundColor: colors.amber, borderColor: colors.amber },
                    ]}
                  >
                    <Text style={[styles.anonBtnText, { color: colors.primaryForeground }]}>
                      {tr("home.nav.registerFree")}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setOpen(false);
                      router.push("/sign-in");
                    }}
                    style={[styles.anonSecondary, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.anonBtnText, { color: colors.foreground }]}>
                      {tr("home.nav.login")}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/*
                Workspace sits directly under the profile, above the destination tiles.
                Signed out there is no workspace yet, so the whole block is dropped rather
                than rendered as a row of em-dashes.
              */}
              {hasSession ? (
                <Text
                  style={[
                    styles.section,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {tr("profile.myTeamspace").toUpperCase()}
                </Text>
              ) : null}
              {hasSession ? (
                <Pressable
                  onPress={() => go("/teamspace")}
                  style={[
                    styles.card,
                    styles.workspace,
                    { borderColor: colors.border, backgroundColor: colors.card },
                  ]}
                >
                  {brandLogo ? (
                    <Image
                      source={{ uri: brandLogo }}
                      style={[styles.brandLogo, { borderColor: colors.border }]}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="shield-checkmark" size={18} color={colors.verified} />
                  )}
                  <View style={styles.identityText}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.name,
                        { color: colors.foreground, fontFamily: Fonts?.displayMedium },
                      ]}
                    >
                      {org.data?.org.name ?? "—"}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.meta,
                        { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                      ]}
                    >
                      {[
                        org.data?.plan.name?.toUpperCase(),
                        org.data
                          ? `${org.data.usage.members} · ${org.data.role.toUpperCase()}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={colors.mutedForeground} />
                </Pressable>
              ) : null}

              <View style={styles.tiles}>
                {TILES.filter(
                  (tile) =>
                    (!tile.managerOnly || !isField) &&
                    (!tile.adminOnly || canManageWatermarks(myRole)) &&
                    (!tile.fieldOnly || canUseField(myRole)),
                ).map((tile) => (
                  <Pressable
                    key={tile.label}
                    accessibilityLabel={tr(tile.label)}
                    onPress={() =>
                      // A nonce makes a repeat tap re-trigger the jump on an already-open screen.
                      go(
                        tile.href,
                        tile.params ? { ...tile.params, n: String(Date.now()) } : undefined,
                      )
                    }
                    style={[
                      styles.tile,
                      { borderColor: colors.amber, backgroundColor: colors.amber },
                    ]}
                  >
                    <Ionicons name={tile.icon} size={18} color={colors.primaryForeground} />
                    <Text
                      numberOfLines={1}
                      style={[styles.tileText, { color: colors.primaryForeground }]}
                    >
                      {tr(tile.label)}
                    </Text>
                  </Pressable>
                ))}
                {/* Adding a crew member is the workspace action people go looking for from any
                    screen, so it sits with the destinations instead of only inside Team. */}
                {hasSession && !isField ? (
                  <Pressable
                    accessibilityLabel={tr("nav.invite")}
                    onPress={() => {
                      setOpen(false);
                      setInviteOpen(true);
                    }}
                    style={[
                      styles.tile,
                      styles.inviteTile,
                      { borderColor: colors.amber, backgroundColor: colors.amber },
                    ]}
                  >
                    <Ionicons
                      name="mail-open-outline"
                      size={18}
                      color={colors.primaryForeground}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.inviteTileText, { color: colors.primaryForeground }]}
                    >
                      {tr("nav.invite")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View
                style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
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
                {/* Theme and language sit with the other device settings, so neither needs a
                    trip into Settings from the capture screen. */}
                <Pressable
                  onPress={() => setTheme(scheme === "dark" ? "light" : "dark")}
                  accessibilityLabel={tr("appearance.title")}
                  style={[styles.cardRow, styles.cardRowTop, { borderColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("appearance.title")}
                  </Text>
                  <View style={styles.rowValue}>
                    <Ionicons
                      name={scheme === "dark" ? "moon-outline" : "sunny-outline"}
                      size={15}
                      color={colors.amber}
                    />
                    <Text
                      style={[
                        styles.rowValueText,
                        { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                      ]}
                    >
                      {tr(scheme === "dark" ? "appearance.dark" : "appearance.light").toUpperCase()}
                    </Text>
                  </View>
                </Pressable>
                <View style={[styles.cardRow, styles.cardRowTop, { borderColor: colors.border }]}>
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("language.title")}
                  </Text>
                  <LanguageMenu />
                </View>
                {/* Help articles live on the website, so this hands off to the browser. */}
                <Pressable
                  onPress={() => void Linking.openURL(webHelpUrl())}
                  style={[styles.cardRow, styles.cardRowTop, { borderColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("home.nav.help")}
                  </Text>
                  <Ionicons name="open-outline" size={15} color={colors.mutedForeground} />
                </Pressable>
                <Pressable
                  onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
                  style={[styles.cardRow, styles.cardRowTop, { borderColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("profile.contact")}
                  </Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.mutedForeground} />
                </Pressable>
                {/* The legal pages live on the website, so these hand off to the browser. */}
                <Pressable
                  onPress={() => void Linking.openURL(webUrl("/terms"))}
                  style={[styles.cardRow, styles.cardRowTop, { borderColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("home.footer.terms")}
                  </Text>
                  <Ionicons name="open-outline" size={15} color={colors.mutedForeground} />
                </Pressable>
                <Pressable
                  onPress={() => void Linking.openURL(webUrl("/privacy"))}
                  style={[styles.cardRow, styles.cardRowTop, { borderColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {tr("home.footer.privacy")}
                  </Text>
                  <Ionicons name="open-outline" size={15} color={colors.mutedForeground} />
                </Pressable>
              </View>

              {/* Nothing to sign out of before there is an account. */}
              {hasSession ? (
                <Pressable
                  onPress={() => void signOut()}
                  disabled={signingOut}
                  style={[
                    styles.signOut,
                    { borderColor: colors.border, opacity: signingOut ? 0.6 : 1 },
                  ]}
                >
                  <Ionicons name="log-out-outline" size={16} color={colors.alert} />
                  <Text style={[styles.signOutText, { color: colors.alert }]}>
                    {tr("settings.signOut")}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <AuthGate visible={gateOpen} onClose={() => setGateOpen(false)} />
      <InviteSheet visible={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    // Kept compact on purpose: this button sets the capture header height, and every pixel
    // here pushes the live camera further down the screen.
    paddingHorizontal: 7,
    paddingVertical: 4,
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
  // Signed-out header: a stacked block, not the avatar row, so the two doors sit full width.
  identityAnon: { flexDirection: "column", alignItems: "stretch", gap: 8 },
  anonPrimary: { borderWidth: 1, borderRadius: 8, paddingVertical: 11, alignItems: "center" },
  anonSecondary: { borderWidth: 1, borderRadius: 8, paddingVertical: 11, alignItems: "center" },
  anonBtnText: { fontSize: 13, letterSpacing: 0.3 },
  avatarText: { fontSize: 14, letterSpacing: 1 },
  brandLogo: { width: 26, height: 26, borderRadius: 6, borderWidth: 1 },
  identityText: { flex: 1, minWidth: 0 },
  name: { fontSize: 14 },
  meta: { fontSize: 11, marginTop: 3 },
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
  // Invite spans the full row instead of sharing one with a destination: it is an action, not
  // a place, and the longer label needs the width. Centred so it reads as a button.
  inviteTile: { width: "100%", justifyContent: "center" },
  // Deliberately not built on `tileText`: that sets flex:1, and RN reads flex:0 as
  // flexBasis:0 with no grow, which collapses the label to zero width. Shrink-only instead.
  inviteTileText: { fontSize: 12, flexShrink: 1, textAlign: "center" },
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
  rowValue: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValueText: { fontSize: 11, letterSpacing: 1 },
  section: { fontSize: 10, letterSpacing: 2, marginTop: 4 },
  workspace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
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
