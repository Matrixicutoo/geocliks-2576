import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { authClient } from "@/lib/auth";
import { client } from "@/lib/api";
import { signOutCompletely } from "@/lib/sign-out";
import { usesAppStoreBilling } from "@/lib/purchases";
import { useOrg } from "@/queries/orgs";
import { useDeleteAccount, useUpdateProfile } from "@/queries/account";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || source.slice(0, 2).toUpperCase();
}

/**
 * Account settings reached from the profile drawer: avatar, display name, password,
 * plan/billing, sign out and permanent deletion. Workspace-wide settings stay in Settings.
 */
export default function Profile() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tr = useT();
  const org = useOrg();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [armed, setArmed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = org.data?.user;
  // Invited field crews don't own the plan and can't remove themselves — the owner does that.
  const isField = org.data?.role === "field";

  useEffect(() => {
    if (user?.name) setName((prev) => (prev ? prev : user.name));
  }, [user?.name]);

  const flash = (message: string) => {
    setError(null);
    setNote(message);
    setTimeout(() => setNote(null), 4000);
  };

  const pickAvatar = async () => {
    setError(null);
    const granted = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted.granted) {
      setError(tr("capture.camPermission"));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    const asset = picked.assets?.[0];
    if (picked.canceled || !asset) return;

    setUploading(true);
    try {
      const presigned = await client.account.presignAvatar({
        filename: asset.fileName ?? "avatar.jpg",
        contentType: asset.mimeType ?? "image/jpeg",
      });
      const blob = await (await fetch(asset.uri)).blob();
      const put = await fetch(presigned.url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": asset.mimeType ?? "image/jpeg" },
      });
      if (!put.ok) throw new Error(`Storage rejected the upload (${put.status})`);
      await updateProfile.mutateAsync({ image: presigned.key });
      flash(tr("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    setError(null);
    try {
      await updateProfile.mutateAsync({ image: null });
      flash(tr("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const saveName = async () => {
    setError(null);
    const next = name.trim();
    if (!next || next === user?.name) return;
    try {
      await updateProfile.mutateAsync({ name: next });
      flash(tr("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  async function emailResetLink() {
    setError(null);
    setSendingLink(true);
    try {
      await client.account.sendPasswordResetLink();
      flash(tr("profile.emailResetSent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSendingLink(false);
    }
  }

  const changePassword = async () => {
    setError(null);
    if (currentPassword.length < 1 || newPassword.length < 8) {
      setError(tr("signin.passwordHint"));
      return;
    }
    setChangingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) throw new Error(result.error.message ?? "Could not change password");
      setCurrentPassword("");
      setNewPassword("");
      flash(tr("profile.passwordUpdated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setChangingPassword(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await signOutCompletely(queryClient);
      router.replace("/landing");
    } finally {
      setSigningOut(false);
    }
  };

  const destroy = async () => {
    setError(null);
    try {
      await deleteAccount.mutateAsync({ confirm: "DELETE" });
      await signOutCompletely(queryClient);
      router.replace("/landing");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const avatar = user?.image ?? null;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel={tr("common.close")}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {tr("profile.title").toUpperCase()}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.avatarCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, { borderColor: colors.amber }]}>
              <Text style={[styles.avatarText, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                {initials(user?.name, user?.email)}
              </Text>
            </View>
          )}
          {org.data?.role ? (
            <View style={[styles.roleBadge, { borderColor: colors.amber }]}>
              <Text
                style={[styles.roleBadgeText, { color: colors.amber, fontFamily: Fonts?.mono }]}
              >
                {org.data.role.toUpperCase()}
              </Text>
            </View>
          ) : null}
          <View style={styles.avatarActions}>
            <Pressable
              onPress={() => void pickAvatar()}
              disabled={uploading}
              style={[styles.btn, { borderColor: colors.amber, opacity: uploading ? 0.6 : 1 }]}
            >
              {uploading ? (
                <ActivityIndicator color={colors.amber} size="small" />
              ) : (
                <Ionicons name="image-outline" size={15} color={colors.amber} />
              )}
              <Text style={[styles.btnText, { color: colors.amber }]}>
                {tr("profile.changePhoto")}
              </Text>
            </Pressable>
            {avatar ? (
              <Pressable
                onPress={() => void removeAvatar()}
                style={[styles.btn, { borderColor: colors.border }]}
              >
                <Ionicons name="trash-outline" size={15} color={colors.mutedForeground} />
                <Text style={[styles.btnText, { color: colors.mutedForeground }]}>
                  {tr("profile.removePhoto")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("profile.account").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {tr("profile.displayName").toUpperCase()}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={user?.name ?? ""}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={tr("profile.displayName")}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{user?.email ?? ""}</Text>
          <Pressable
            onPress={() => void saveName()}
            disabled={updateProfile.isPending || !name.trim() || name.trim() === user?.name}
            style={[
              styles.primary,
              {
                backgroundColor: colors.amber,
                opacity:
                  updateProfile.isPending || !name.trim() || name.trim() === user?.name ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.primaryText, { color: colors.background }]}>
              {tr("profile.saveChanges")}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("profile.password").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder={tr("profile.currentPassword")}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={tr("profile.currentPassword")}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder={tr("profile.newPassword")}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={tr("profile.newPassword")}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          />
          <Pressable
            onPress={() => void changePassword()}
            disabled={changingPassword}
            style={[styles.outline, { borderColor: colors.amber, opacity: changingPassword ? 0.6 : 1 }]}
          >
            <Text style={[styles.outlineText, { color: colors.amber }]}>
              {tr("profile.changePassword")}
            </Text>
          </Pressable>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {tr("profile.passwordManaged")}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {tr("profile.emailResetOr")}
          </Text>
          <Pressable
            onPress={() => void emailResetLink()}
            disabled={sendingLink}
            style={[styles.outline, { borderColor: colors.border, opacity: sendingLink ? 0.6 : 1 }]}
            accessibilityLabel={tr("profile.emailReset")}
          >
            <Text style={[styles.outlineText, { color: colors.foreground }]}>
              {tr("profile.emailReset")}
            </Text>
          </Pressable>
        </View>

        {isField ? null : (
        <>
        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("profile.planSection").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.planRow}>
            <Ionicons name="sparkles" size={16} color={colors.amber} />
            <Text style={[styles.planText, { color: colors.amber, fontFamily: Fonts?.mono }]}>
              {(org.data?.plan.name ?? "").toUpperCase()}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/plans")}
            style={[styles.primary, { backgroundColor: colors.amber }]}
          >
            <Ionicons name="arrow-up-circle-outline" size={16} color={colors.background} />
            <Text style={[styles.primaryText, { color: colors.background }]}>
              {tr("profile.upgrade")}
            </Text>
          </Pressable>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {tr(usesAppStoreBilling() ? "plans.appleNote" : "plans.stripeNote")}
          </Text>
        </View>
        </>
        )}

        <Pressable
          onPress={() => void signOut()}
          disabled={signingOut}
          style={[styles.outline, { borderColor: colors.border, opacity: signingOut ? 0.6 : 1 }]}
        >
          <Ionicons name="log-out-outline" size={16} color={colors.foreground} />
          <Text style={[styles.outlineText, { color: colors.foreground }]}>
            {tr("settings.signOut")}
          </Text>
        </Pressable>

        <Text style={[styles.section, { color: colors.alert, fontFamily: Fonts?.mono }]}>
          {tr("profile.danger").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.alert, backgroundColor: colors.card }]}>
          <Text style={[styles.meta, { color: colors.foreground }]}>
            {isField ? tr("perm.selfDeleteNote") : tr("profile.deleteWarning")}
          </Text>
          {isField ? null : armed ? (
            <>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                autoCapitalize="characters"
                placeholder={tr("profile.deleteConfirm")}
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel={tr("profile.deleteConfirm")}
                style={[styles.input, { borderColor: colors.alert, color: colors.foreground }]}
              />
              <View style={styles.dangerRow}>
                <Pressable
                  onPress={() => {
                    setArmed(false);
                    setConfirm("");
                  }}
                  style={[styles.outline, styles.dangerBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.outlineText, { color: colors.foreground }]}>
                    {tr("common.cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => void destroy()}
                  disabled={confirm.trim().toUpperCase() !== "DELETE" || deleteAccount.isPending}
                  style={[
                    styles.outline,
                    styles.dangerBtn,
                    {
                      borderColor: colors.alert,
                      backgroundColor: "rgba(255,77,79,0.10)",
                      opacity:
                        confirm.trim().toUpperCase() !== "DELETE" || deleteAccount.isPending
                          ? 0.5
                          : 1,
                    },
                  ]}
                >
                  <Text style={[styles.outlineText, { color: colors.alert }]}>
                    {deleteAccount.isPending ? tr("profile.deleting") : tr("profile.deleteAccount")}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Pressable
              onPress={() => setArmed(true)}
              style={[styles.outline, { borderColor: colors.alert }]}
            >
              <Ionicons name="trash-outline" size={16} color={colors.alert} />
              <Text style={[styles.outlineText, { color: colors.alert }]}>
                {tr("profile.deleteAccount")}
              </Text>
            </Pressable>
          )}
        </View>

        {note ? (
          <Text style={[styles.note, { color: colors.verified, fontFamily: Fonts?.mono }]}>
            {note}
          </Text>
        ) : null}
        {error ? (
          <Text style={[styles.note, { color: colors.alert }]}>{error}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 12 : 6,
    paddingBottom: 10,
  },
  topTitle: { fontSize: 14, letterSpacing: 3 },
  topSpacer: { width: 22 },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  card: { borderWidth: 1, padding: 14, gap: 10, borderRadius: 12 },
  avatarCard: { alignItems: "center", gap: 14, paddingVertical: 20 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 84, height: 84, borderRadius: 12 },
  avatarText: { fontSize: 24, letterSpacing: 1 },
  avatarActions: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  roleBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "center", borderRadius: 6 },
  roleBadgeText: { fontSize: 10, letterSpacing: 1.6 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnText: { fontSize: 12 },
  section: { fontSize: 10, letterSpacing: 2, marginTop: 8 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.6 },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, borderRadius: 8 },
  meta: { fontSize: 11.5, lineHeight: 17 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryText: { fontSize: 13, fontWeight: "700" },
  outline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  outlineText: { fontSize: 12.5, fontWeight: "600" },
  divider: { height: 1, marginVertical: 2 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planText: { fontSize: 12, letterSpacing: 1.4 },
  dangerRow: { flexDirection: "row", gap: 8 },
  dangerBtn: { flex: 1 },
  note: { fontSize: 12, textAlign: "center", marginTop: 8, lineHeight: 18 },
});
