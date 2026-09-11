import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { useInviteMember } from "@/queries/team";

/**
 * The roles a workspace hands out to its own crew — the same list the Team screen offers.
 * Owner and admin are absent on purpose: the server (`assertMayGrant` in `api/routes/team.ts`)
 * only lets a GeoCliks superadmin grant those, from the web console.
 */
const ROLES = ["manager", "dispatcher", "driver", "field"] as const;
type Role = (typeof ROLES)[number];

const ROLE_HINT: Record<Role, string> = {
  manager: "Projects, reports and share links.",
  dispatcher: "Builds and runs delivery routes only.",
  driver: "Delivers assigned routes. No projects or job photos.",
  field: "Captures photos, sees assigned projects only.",
};

/**
 * Invite a crew member without leaving the screen you are on. Opened from the Invite entry in
 * the drawer; the Team screen keeps its own full invite card with pending invites and QR codes.
 */
export function InviteSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const tr = useT();
  const invite = useInviteMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const send = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter the crew member's work email first.");
      return;
    }
    if (!role) {
      setError("Pick a role for this invite first.");
      return;
    }
    try {
      const res = await invite.mutateAsync({ email: email.trim(), role, projectIds: [] });
      const sentTo = email.trim();
      setEmail("");
      setRole(null);
      setNotice(
        res.emailSent
          ? `Invite emailed to ${sentTo} — code ${res.code}.`
          : `Invite created — code ${res.code}. No email was sent${
              res.emailReason ? ` (${res.emailReason})` : ""
            }. Share the code yourself.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.stage}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={tr("common.close")} />
        <View
          style={[styles.panel, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <View style={[styles.head, { borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
              {tr("nav.invite").toUpperCase()}
            </Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel={tr("common.close")}>
              <Ionicons name="close" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Work email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="crew@company.com"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              accessibilityLabel="Work email"
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.card,
                },
              ]}
            />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Role</Text>
            <View style={styles.chips}>
              {ROLES.map((item) => {
                const on = role === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setRole(item)}
                    style={[
                      styles.chip,
                      {
                        borderColor: on ? colors.amber : colors.border,
                        backgroundColor: on ? colors.amber : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: on ? colors.primaryForeground : colors.foreground,
                          fontFamily: Fonts?.mono,
                        },
                      ]}
                    >
                      {item.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {role ? (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                {ROLE_HINT[role]}
              </Text>
            ) : null}

            {error ? <Text style={[styles.hint, { color: colors.alert }]}>{error}</Text> : null}
            {notice ? (
              <Text style={[styles.hint, { color: colors.verified }]}>{notice}</Text>
            ) : null}

            <Pressable
              onPress={() => void send()}
              disabled={invite.isPending}
              style={[
                styles.primary,
                { backgroundColor: colors.amber, opacity: invite.isPending ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="person-add-outline" size={15} color={colors.primaryForeground} />
              <Text
                style={[
                  styles.primaryText,
                  { color: colors.primaryForeground, fontFamily: Fonts?.mono },
                ]}
              >
                {invite.isPending ? "SENDING…" : "SEND INVITE"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, justifyContent: "center", padding: 16 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  panel: { borderWidth: 1, borderRadius: 14, maxHeight: "85%", overflow: "hidden" },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  title: { fontSize: 15, letterSpacing: 0.5 },
  body: { padding: 14, gap: 8 },
  label: { fontSize: 11 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, fontSize: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  chipText: { fontSize: 10, letterSpacing: 1.2 },
  hint: { fontSize: 11, lineHeight: 15 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 10,
    paddingVertical: 11,
    marginTop: 4,
  },
  primaryText: { fontSize: 11, letterSpacing: 1.2 },
});
