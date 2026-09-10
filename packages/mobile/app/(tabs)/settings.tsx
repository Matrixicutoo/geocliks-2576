import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { client } from "@/lib/api";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { PUSH_STATUS_KEY } from "@/hooks/use-push-token";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { Stamp } from "@/components/stamp";
import { signOutCompletely } from "@/lib/sign-out";
import { useAppTheme } from "@/lib/theme";
import { useLocale } from "@/lib/i18n";
import { LOCALES } from "@/i18n/locales";
import {
  useOrg,
  useSetAppearance,
  useSetDefaultTemplate,
  useTemplates,
  useUpdateOrg,
} from "@/queries/orgs";
import { SUPPORT_EMAIL } from "../../constants/support";
import { canManageWatermarks } from "../../lib/roles";

export default function Settings() {
  const colors = useColors();
  const router = useRouter();
  // The drawer's Watermarks tile deep-links here and scrolls straight to the stamp block.
  const params = useLocalSearchParams<{ focus?: string; n?: string }>();
  const focusStamp = params.focus === "stamp" ? (params.n ?? "1") : null;
  const scroller = useRef<ScrollView>(null);
  const stampY = useRef(0);
  const queryClient = useQueryClient();
  const org = useOrg();
  const templates = useTemplates();
  const setDefault = useSetDefaultTemplate();
  const setAppearance = useSetAppearance();
  const { scheme, override, workspace, setTheme, useWorkspaceDefault } = useAppTheme();
  const lang = useLocale();
  const [signingOut, setSigningOut] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  // Push registration is deliberately silent in the field; this surfaces its last outcome.
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const loadPushStatus = useCallback(() => {
    void AsyncStorage.getItem(PUSH_STATUS_KEY).then((v) => setPushStatus(v ?? "NOT RUN YET"));
  }, []);
  useEffect(loadPushStatus, [loadPushStatus]);
  const isAdmin = org.data?.role === "owner" || org.data?.role === "admin";
  // Every role captures with the stamp; curating templates is the owner and admins only.
  const canManageTemplates = canManageWatermarks(org.data?.role);

  // Renaming the teamspace to the business name. Owner and admin only, same as on the web.
  const updateOrg = useUpdateOrg();
  const workspaceName = org.data?.org.name;
  const [orgName, setOrgName] = useState("");
  const [orgSaved, setOrgSaved] = useState(false);
  useEffect(() => {
    if (workspaceName) setOrgName((prev) => (prev ? prev : workspaceName));
  }, [workspaceName]);
  const orgNameDirty = orgName.trim().length >= 2 && orgName.trim() !== workspaceName;

  /**
   * The business logo belongs to the workspace, not to one watermark template: it labels the
   * workspace in the menu and is stamped by any template that has no logo of its own. Arrives
   * as a ready-to-use link; the column itself keeps only the bare storage key.
   */
  const orgLogo = org.data?.org?.logoUrl ?? null;
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const pickLogo = async () => {
    setLogoError(null);
    // No pre-flight permission check: the picker raises the OS prompt itself and simply
    // comes back cancelled if the phone says no, so there is nothing extra to explain.
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    const asset = picked.canceled ? null : picked.assets[0];
    if (!asset) return;
    setLogoBusy(true);
    try {
      const contentType = asset.mimeType ?? "image/png";
      const presigned = await client.upload.presignLogo({
        filename: asset.fileName ?? "logo.png",
        contentType,
      });
      const blob = await (await fetch(asset.uri)).blob();
      const put = await fetch(presigned.url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": contentType },
      });
      if (!put.ok) throw new Error(`Storage rejected the upload (${put.status})`);
      await updateOrg.mutateAsync({ logoUrl: presigned.key });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : String(err));
    } finally {
      setLogoBusy(false);
    }
  };
  const removeLogo = async () => {
    setLogoError(null);
    try {
      await updateOrg.mutateAsync({ logoUrl: null });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : String(err));
    }
  };
  const saveOrgName = async () => {
    if (!orgNameDirty) return;
    await updateOrg.mutateAsync({ name: orgName.trim() });
    setOrgSaved(true);
    setTimeout(() => setOrgSaved(false), 4000);
  };

  // Arriving from the drawer's "Watermarks" tile: scroll down to the stamp template section.
  useEffect(() => {
    if (!focusStamp) return;
    const timer = setTimeout(
      () => scroller.current?.scrollTo({ y: Math.max(0, stampY.current - 24), animated: true }),
      400,
    );
    return () => clearTimeout(timer);
  }, [focusStamp]);

  const active = templates.data?.find((t) => t.isDefault) ?? templates.data?.[0] ?? null;

  const signOut = async () => {
    setSigningOut(true);
    try {
      // Dropping the token is not enough — this screen stays mounted unless we navigate.
      await signOutCompletely(queryClient);
      router.replace("/landing");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        ref={scroller}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <ProfileMenu />
          <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
            SETTINGS
          </Text>
          <LanguageMenu />
        </View>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {org.isLoading ? (
            <ActivityIndicator color={colors.amber} />
          ) : (
            <>
              <Text
                style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
              >
                WORKSPACE
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: colors.foreground, fontFamily: Fonts?.displayMedium },
                ]}
              >
                {org.data?.org.name}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {org.data?.user.email} · {org.data?.role}
              </Text>
              <View style={[styles.planRow, { borderColor: colors.border }]}>
                <Text style={[styles.plan, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                  {org.data?.plan.name.toUpperCase()} PLAN
                </Text>
                <Text
                  style={[
                    styles.planUsage,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {org.data?.usage.photos} PHOTOS · {org.data?.usage.projects} PROJECTS
                </Text>
              </View>
            </>
          )}
        </View>

        {isAdmin ? (
          <>
            <Text
              style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {lang.t("profile.workspace").toUpperCase()}
            </Text>
            <View
              style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Text
                style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
              >
                {lang.t("templates.logo").toUpperCase()}
              </Text>
              <View style={styles.logoRow}>
                {orgLogo ? (
                  <Image
                    source={{ uri: orgLogo }}
                    style={[styles.logoBox, { borderColor: colors.border }]}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.logoBox, { borderColor: colors.border }]}>
                    <Ionicons name="image-outline" size={20} color={colors.mutedForeground} />
                  </View>
                )}
                <Pressable
                  accessibilityLabel={lang.t("templates.upload")}
                  onPress={() => void pickLogo()}
                  disabled={logoBusy}
                  style={[
                    styles.logoButton,
                    { borderColor: colors.amber, opacity: logoBusy ? 0.5 : 1 },
                  ]}
                >
                  <Text style={[styles.logoButtonText, { color: colors.amber }]}>
                    {logoBusy ? lang.t("common.loading") : lang.t("templates.upload")}
                  </Text>
                </Pressable>
                {orgLogo ? (
                  <Pressable
                    accessibilityLabel={lang.t("common.delete")}
                    onPress={() => void removeLogo()}
                    style={[styles.logoButton, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.logoButtonText, { color: colors.mutedForeground }]}>
                      {lang.t("common.delete")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {logoError ? (
                <Text style={[styles.meta, { color: colors.destructive }]}>{logoError}</Text>
              ) : null}
              <Text
                style={[
                  styles.label,
                  styles.labelSpaced,
                  { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                ]}
              >
                {lang.t("profile.businessName").toUpperCase()}
              </Text>
              <TextInput
                value={orgName}
                onChangeText={setOrgName}
                placeholder={workspaceName ?? ""}
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel={lang.t("profile.businessName")}
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              />
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {lang.t("profile.workspaceHint")}
              </Text>
              {orgSaved ? (
                <Text
                  style={[styles.savedNote, { color: colors.verified, fontFamily: Fonts?.mono }]}
                >
                  {lang.t("profile.saved").toUpperCase()}
                </Text>
              ) : null}
              <Pressable
                accessibilityLabel={lang.t("profile.businessName")}
                onPress={() => void saveOrgName()}
                disabled={updateOrg.isPending || !orgNameDirty}
                style={[
                  styles.primary,
                  {
                    backgroundColor: colors.amber,
                    opacity: updateOrg.isPending || !orgNameDirty ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.primaryText, { color: colors.background }]}>
                  {lang.t("profile.saveChanges")}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          NOTIFICATIONS
        </Text>
        <Pressable
          accessibilityLabel="Refresh notification status"
          onPress={loadPushStatus}
          style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            THIS DEVICE
          </Text>
          <Text style={[styles.pushStatus, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
            {pushStatus ?? "checking…"}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            Tap to refresh. Push notifications work on the installed app only, never in a browser.
          </Text>
        </Pressable>

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          STAMP TEMPLATE
        </Text>
        <View
          onLayout={(event) => {
            stampY.current = event.nativeEvent.layout.y;
          }}
          style={[styles.previewBox, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Stamp
            data={{
              at: new Date(),
              lat: 45.5019,
              lng: -73.5674,
              accuracyM: 4,
              address: "1250 René-Lévesque Blvd W, Montreal, QC",
              project: "Fiber Run — Sector 4",
              code: "GC-4K7Q-88ZR-1MPD",
              company: active?.companyLine ?? org.data?.org.name ?? null,
              logoUrl: active?.showLogo ? (active.logoUrl ?? orgLogo ?? null) : null,
              verified: true,
            }}
          />
        </View>

        {canManageTemplates ? (
          <View style={styles.templateList}>
            {templates.data?.map((t) => {
              const isActive = active?.id === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setDefault.mutate({ id: t.id })}
                  style={[
                    styles.template,
                    {
                      borderColor: isActive ? colors.amber : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Ionicons
                    name={isActive ? "radio-button-on" : "radio-button-off"}
                    size={16}
                    color={isActive ? colors.amber : colors.mutedForeground}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateName, { color: colors.foreground }]}>
                      {t.name}
                    </Text>
                    <Text
                      style={[
                        styles.meta,
                        { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                      ]}
                    >
                      {t.layout.toUpperCase()} · {t.fields.length} FIELDS
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {lang.t("perm.templatesNote")}
          </Text>
        )}

        <Pressable
          onPress={() => setAppearanceOpen((v) => !v)}
          accessibilityLabel={lang.t("appearance.title")}
          style={[
            styles.dropdownHead,
            {
              borderColor: appearanceOpen ? colors.amber : colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {lang.t("appearance.title").toUpperCase()}
          </Text>
          <View style={styles.dropdownValue}>
            <Ionicons
              name={scheme === "light" ? "sunny-outline" : "moon-outline"}
              size={14}
              color={colors.amber}
            />
            <Text
              style={[styles.dropdownValueText, { color: colors.amber, fontFamily: Fonts?.mono }]}
            >
              {(override ?? "AUTO").toUpperCase()}
            </Text>
            <Ionicons
              name={appearanceOpen ? "chevron-up" : "chevron-down"}
              size={15}
              color={colors.mutedForeground}
            />
          </View>
        </Pressable>
        <View
          style={[
            styles.card,
            { borderColor: colors.border, backgroundColor: colors.card },
            appearanceOpen ? null : styles.hidden,
          ]}
        >
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {lang.t("appearance.thisDeviceMobile").toUpperCase()}
          </Text>
          <View style={styles.segment}>
            {(["light", "dark"] as const).map((s) => {
              const on = override === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setTheme(s)}
                  style={[styles.segmentItem, { borderColor: on ? colors.amber : colors.border }]}
                >
                  <Ionicons
                    name={s === "light" ? "sunny-outline" : "moon-outline"}
                    size={14}
                    color={on ? colors.amber : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: on ? colors.amber : colors.mutedForeground,
                        fontFamily: Fonts?.mono,
                      },
                    ]}
                  >
                    {s.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={useWorkspaceDefault}
              style={[
                styles.segmentItem,
                { borderColor: override === null ? colors.amber : colors.border },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: override === null ? colors.amber : colors.mutedForeground,
                    fontFamily: Fonts?.mono,
                  },
                ]}
              >
                AUTO
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.meta, { color: colors.mutedForeground, marginTop: 6 }]}>
            {override === null
              ? `Following the workspace default (${workspace}).`
              : `This device is set to ${scheme}. Only this device.`}
          </Text>

          {isAdmin ? (
            <>
              <Text
                style={[
                  styles.label,
                  { color: colors.mutedForeground, fontFamily: Fonts?.mono, marginTop: 14 },
                ]}
              >
                {lang.t("appearance.workspaceDefault").toUpperCase()}
              </Text>
              <View style={styles.segment}>
                {(["light", "dark"] as const).map((s) => {
                  const on = workspace === s;
                  return (
                    <Pressable
                      key={s}
                      disabled={setAppearance.isPending}
                      onPress={() => setAppearance.mutate({ theme: s })}
                      style={[
                        styles.segmentItem,
                        { borderColor: on ? colors.amber : colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color: on ? colors.amber : colors.mutedForeground,
                            fontFamily: Fonts?.mono,
                          },
                        ]}
                      >
                        {s.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.meta, { color: colors.mutedForeground, marginTop: 6 }]}>
                Applies to every crew member who has not picked their own.
              </Text>
            </>
          ) : null}
        </View>

        <Pressable
          onPress={() => setLanguageOpen((v) => !v)}
          accessibilityLabel={lang.t("language.title")}
          style={[
            styles.dropdownHead,
            {
              borderColor: languageOpen ? colors.amber : colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {lang.t("language.title").toUpperCase()}
          </Text>
          <View style={styles.dropdownValue}>
            <Ionicons name="language-outline" size={14} color={colors.amber} />
            <Text
              numberOfLines={1}
              style={[styles.dropdownValueText, { color: colors.amber, maxWidth: 150 }]}
            >
              {LOCALES.find((l) => l.code === lang.locale)?.native ?? lang.locale}
            </Text>
            <Ionicons
              name={languageOpen ? "chevron-up" : "chevron-down"}
              size={15}
              color={colors.mutedForeground}
            />
          </View>
        </Pressable>
        <View
          style={[
            styles.card,
            { borderColor: colors.border, backgroundColor: colors.card },
            languageOpen ? null : styles.hidden,
          ]}
        >
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {lang.t("language.thisDeviceMobile").toUpperCase()}
          </Text>
          <View style={styles.langGrid}>
            <Pressable
              onPress={lang.useWorkspaceDefault}
              style={[
                styles.langItem,
                { borderColor: lang.override === null ? colors.amber : colors.border },
              ]}
            >
              <Text
                style={[
                  styles.langText,
                  {
                    color: lang.override === null ? colors.amber : colors.mutedForeground,
                  },
                ]}
              >
                {lang.t("language.followWorkspace")}
              </Text>
            </Pressable>
            {LOCALES.map((item) => {
              const on = lang.override === item.code;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => lang.setLocale(item.code)}
                  style={[styles.langItem, { borderColor: on ? colors.amber : colors.border }]}
                >
                  <Text
                    style={[styles.langText, { color: on ? colors.amber : colors.mutedForeground }]}
                  >
                    {item.native}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isAdmin ? (
            <>
              <Text
                style={[
                  styles.label,
                  { color: colors.mutedForeground, fontFamily: Fonts?.mono, marginTop: 14 },
                ]}
              >
                {lang.t("language.workspaceDefault").toUpperCase()}
              </Text>
              <View style={styles.langGrid}>
                {LOCALES.map((item) => {
                  const on = lang.workspace === item.code;
                  return (
                    <Pressable
                      key={item.code}
                      disabled={setAppearance.isPending}
                      onPress={() => setAppearance.mutate({ locale: item.code })}
                      style={[styles.langItem, { borderColor: on ? colors.amber : colors.border }]}
                    >
                      <Text
                        style={[
                          styles.langText,
                          { color: on ? colors.amber : colors.mutedForeground },
                        ]}
                      >
                        {item.native}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
          <Text style={[styles.meta, { color: colors.mutedForeground, marginTop: 8 }]}>
            {lang.t("language.note")}
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          HOW VERIFICATION WORKS
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            Every capture is hashed (SHA-256) on upload and signed together with its time, GPS fix
            and photo code. The verified time comes from the server, not the phone, so changing
            device settings cannot fake it. If the device clock is more than 5 minutes off, the
            photo is flagged as device-timed instead of network-verified.
          </Text>
        </View>

        <Pressable
          onPress={signOut}
          style={[styles.signOut, { borderColor: colors.destructive }]}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.destructive} />
          ) : (
            <Text style={[styles.signOutText, { color: colors.destructive }]}>
              {lang.t("settings.signOut")}
            </Text>
          )}
        </Pressable>

        <Text style={[styles.support, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {SUPPORT_EMAIL}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { fontSize: 15, letterSpacing: 3 },
  card: { borderWidth: 1, padding: 14, gap: 4, borderRadius: 12 },
  label: { fontSize: 9, letterSpacing: 1.5 },
  labelSpaced: { marginTop: 14 },
  logoRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 8 },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  logoButtonText: { fontSize: 13, fontWeight: "600" },
  value: { fontSize: 17 },
  meta: { fontSize: 11 },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 4,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  plan: { fontSize: 11, letterSpacing: 1, flexShrink: 1 },
  planUsage: { fontSize: 11, flexShrink: 1 },
  pushStatus: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  section: { fontSize: 9, letterSpacing: 1.5, marginTop: 14 },
  hidden: { display: "none" },
  dropdownHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 14,
    borderRadius: 8,
  },
  dropdownValue: { flexDirection: "row", alignItems: "center", gap: 6 },
  dropdownValueText: { fontSize: 12.5 },
  previewBox: { borderWidth: 1, padding: 12, borderRadius: 12 },
  templateList: { gap: 8 },
  template: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  templateName: { fontSize: 13, fontWeight: "600" },
  body: { fontSize: 12, lineHeight: 19 },
  segment: { flexDirection: "row", gap: 8, marginTop: 8 },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  langItem: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  langText: { fontSize: 11.5 },
  segmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  segmentText: { fontSize: 10, letterSpacing: 1.2 },
  signOut: { borderWidth: 1, padding: 14, alignItems: "center", marginTop: 18, borderRadius: 8 },
  signOutText: { fontSize: 13, fontWeight: "700" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    marginTop: 4,
    borderRadius: 8,
  },
  primary: { paddingVertical: 12, alignItems: "center", marginTop: 8, borderRadius: 8 },
  primaryText: { fontSize: 13, fontWeight: "700" },
  savedNote: { fontSize: 10, letterSpacing: 1.2, marginTop: 4 },
  support: { fontSize: 10, textAlign: "center", marginTop: 14, letterSpacing: 0.6 },
});
