import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { formatStamp } from "@/components/stamp";
import { useOrg } from "@/queries/orgs";
import { useOpenConversation } from "@/queries/messages";
import {
  useInviteMember,
  useInvites,
  useRemoveMember,
  useRevokeInvite,
  useSetRole,
  useTeam,
} from "@/queries/team";

/**
 * Owner is deliberately missing: the workspace keeps exactly one owner and the server refuses to
 * change the owner's row, so offering it here would only produce an error.
 */
const ROLES = ["admin", "manager", "field"] as const;
type Role = (typeof ROLES)[number];

const ROLE_HINT: Record<string, string> = {
  owner: "Billing, plan and everything below.",
  admin: "Invites, roles, projects, exports.",
  manager: "Projects, reports and share links.",
  field: "Captures photos, sees assigned projects only.",
};

function initials(name?: string | null, email?: string | null) {
  const source = (name ?? email ?? "?").trim();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Native Team screen — the phone counterpart of /app/team. Field crews get a read-only contact
 * sheet of the people on their own projects; owners and admins also get roles, removals and
 * invites. The page copy stays English on purpose, exactly like the web Team page.
 */
export default function Team() {
  const colors = useColors();
  const router = useRouter();
  const tr = useT();
  const org = useOrg();
  const team = useTeam();
  const invites = useInvites();
  const invite = useInviteMember();
  const revokeInvite = useRevokeInvite();
  const setRole = useSetRole();
  const removeMember = useRemoveMember();
  const openChat = useOpenConversation();

  const [email, setEmail] = useState("");
  // No default on purpose: the role has to be stated before the invite can go out.
  const [role, setRole_] = useState<Role | null>(null);
  const [manageId, setManageId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const myRole = org.data?.role;
  const isAdmin = myRole === "owner" || myRole === "admin";
  const isField = myRole === "field";
  const myId = org.data?.user.id;
  const seats = org.data?.plan.limits.seats ?? 0;
  const members = (team.data ?? []).length;
  const pending = (invites.data ?? []).length;
  const used = members + pending;

  const roleColor = (value: string) =>
    value === "owner" || value === "admin"
      ? colors.amber
      : value === "manager"
        ? colors.sky
        : colors.mutedForeground;

  /** Open (or reuse) the 1:1 thread with a teammate and jump straight into it. */
  const contact = async (userId: string) => {
    setError(null);
    try {
      const conversation = await openChat.mutateAsync({ userId });
      router.push(`/messages/${conversation.id}` as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const changeRole = async (memberId: string, next: Role) => {
    setError(null);
    setNotice(null);
    try {
      await setRole.mutateAsync({ memberId, role: next });
      setNotice(`Role updated to ${next}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const remove = async (memberId: string) => {
    setError(null);
    setNotice(null);
    try {
      await removeMember.mutateAsync({ memberId });
      setConfirmId(null);
      setManageId(null);
      setNotice("Member removed. Their photos stay in the teamspace.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const revoke = async (id: string, to: string) => {
    setError(null);
    setNotice(null);
    try {
      await revokeInvite.mutateAsync({ id });
      setNotice(`Invite to ${to} revoked. The code no longer works.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

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
      setRole_(null);
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
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel={tr("common.close")}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.amber, fontFamily: Fonts?.display }]}>
          TEAM
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lede, { color: colors.mutedForeground }]}>
          {isField
            ? "The crew on the projects you are assigned to. Message anyone here."
            : "Roles decide who captures, who exports, and who sees what."}
        </Text>

        {isField ? null : (
          <View style={[styles.seatChip, { borderColor: colors.border }]}>
            <Text style={[styles.seatText, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {used} / {seats} SEATS{pending > 0 ? ` · ${pending} PENDING` : ""}
            </Text>
          </View>
        )}

        {notice ? (
          <Text style={[styles.notice, { color: colors.verified }]}>{notice}</Text>
        ) : null}
        {error ? <Text style={[styles.error, { color: colors.alert }]}>{error}</Text> : null}

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          MEMBERS
        </Text>

        {team.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : (
          (team.data ?? []).map((member) => {
            const name = member.user?.name ?? member.user?.email ?? "Unknown user";
            const isSelf = member.userId === myId;
            const isOwnerRow = member.role === "owner";
            const open = manageId === member.id;
            return (
              <View
                key={member.id}
                style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <View style={styles.memberRow}>
                  <View style={[styles.avatar, { borderColor: colors.amber }]}>
                    <Text
                      style={[styles.avatarText, { color: colors.amber, fontFamily: Fonts?.mono }]}
                    >
                      {initials(member.user?.name, member.user?.email)}
                    </Text>
                  </View>
                  <View style={styles.memberBody}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.memberName,
                        { color: colors.foreground, fontFamily: Fonts?.displayMedium },
                      ]}
                    >
                      {name}
                      {isSelf ? " (you)" : ""}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.memberMeta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                    >
                      {member.user?.email ?? "—"}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.memberMeta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                    >
                      {member.photoCount} PHOTOS · JOINED{" "}
                      {formatStamp(new Date(member.createdAt)).slice(0, 10)}
                    </Text>
                  </View>
                  <View style={[styles.roleBadge, { borderColor: roleColor(member.role) }]}>
                    <Text
                      style={[styles.roleBadgeText, { color: roleColor(member.role), fontFamily: Fonts?.mono }]}
                    >
                      {member.role.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  {isSelf ? null : (
                    <Pressable
                      onPress={() => void contact(member.userId)}
                      disabled={openChat.isPending}
                      style={[styles.smallBtn, { borderColor: colors.border, opacity: openChat.isPending ? 0.5 : 1 }]}
                    >
                      <Ionicons name="chatbubble-outline" size={13} color={colors.foreground} />
                      <Text style={[styles.smallBtnText, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
                        MESSAGE
                      </Text>
                    </Pressable>
                  )}
                  {isAdmin && !isSelf && !isOwnerRow ? (
                    <Pressable
                      onPress={() => {
                        setManageId(open ? null : member.id);
                        setConfirmId(null);
                      }}
                      style={[
                        styles.smallBtn,
                        { borderColor: open ? colors.amber : colors.border },
                      ]}
                    >
                      <Ionicons
                        name="options-outline"
                        size={13}
                        color={open ? colors.amber : colors.foreground}
                      />
                      <Text
                        style={[
                          styles.smallBtnText,
                          { color: open ? colors.amber : colors.foreground, fontFamily: Fonts?.mono },
                        ]}
                      >
                        MANAGE
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {open ? (
                  <View style={[styles.manage, { borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.mutedForeground }]}>Role</Text>
                    <View style={styles.chips}>
                      {ROLES.map((item) => {
                        const on = member.role === item;
                        return (
                          <Pressable
                            key={item}
                            onPress={() => void changeRole(member.id, item)}
                            disabled={setRole.isPending}
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
                    <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                      {ROLE_HINT[member.role] ?? ""}
                    </Text>

                    {confirmId === member.id ? (
                      <View style={styles.confirmRow}>
                        <Pressable
                          onPress={() => void remove(member.id)}
                          disabled={removeMember.isPending}
                          style={[styles.smallBtn, { borderColor: colors.alert }]}
                        >
                          <Text style={[styles.smallBtnText, { color: colors.alert, fontFamily: Fonts?.mono }]}>
                            CONFIRM REMOVE
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setConfirmId(null)}
                          style={[styles.smallBtn, { borderColor: colors.border }]}
                        >
                          <Text style={[styles.smallBtnText, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
                            CANCEL
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setConfirmId(member.id)}
                        style={[styles.smallBtn, styles.removeBtn, { borderColor: colors.border }]}
                      >
                        <Ionicons name="trash-outline" size={13} color={colors.alert} />
                        <Text style={[styles.smallBtnText, { color: colors.alert, fontFamily: Fonts?.mono }]}>
                          REMOVE FROM WORKSPACE
                        </Text>
                      </Pressable>
                    )}
                    <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                      Removing takes away access, not evidence — their photos stay in the teamspace.
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        {isField && members <= 1 ? (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Nobody else is assigned to your projects yet. Ask your supervisor to add you to a
            project crew.
          </Text>
        ) : null}

        {isField ? null : (
          <>
            <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              PENDING INVITES
            </Text>
            {pending === 0 ? (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                No invites waiting. Everyone you invited has joined.
              </Text>
            ) : (
              (invites.data ?? []).map((row) => (
                <View
                  key={row.id}
                  style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                  <View style={styles.memberRow}>
                    <Ionicons name="mail-outline" size={16} color={colors.mutedForeground} />
                    <View style={styles.memberBody}>
                      <Text
                        numberOfLines={1}
                        style={[styles.memberName, { color: colors.foreground, fontFamily: Fonts?.mono }]}
                      >
                        {row.email}
                      </Text>
                      <Text
                        style={[styles.memberMeta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                      >
                        {row.role.toUpperCase()} · CODE {row.code}
                      </Text>
                    </View>
                  </View>
                  {isAdmin ? (
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => void revoke(row.id, row.email)}
                        disabled={revokeInvite.isPending}
                        style={[styles.smallBtn, { borderColor: colors.border }]}
                      >
                        <Ionicons name="close-circle-outline" size={13} color={colors.alert} />
                        <Text style={[styles.smallBtnText, { color: colors.alert, fontFamily: Fonts?.mono }]}>
                          REVOKE
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </>
        )}

        {isAdmin ? (
          <>
            <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              INVITE A CREW MEMBER
            </Text>
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
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
                  { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background },
                ]}
              />
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Role</Text>
              <View style={styles.chips}>
                {ROLES.map((item) => {
                  const on = role === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setRole_(item)}
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
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>{ROLE_HINT[role]}</Text>
              ) : null}
              <Pressable
                onPress={() => void send()}
                disabled={invite.isPending}
                style={[styles.primary, { backgroundColor: colors.amber, opacity: invite.isPending ? 0.6 : 1 }]}
              >
                <Ionicons name="person-add-outline" size={15} color={colors.primaryForeground} />
                <Text
                  style={[styles.primaryText, { color: colors.primaryForeground, fontFamily: Fonts?.mono }]}
                >
                  {invite.isPending ? "SENDING…" : "SEND INVITE"}
                </Text>
              </Pressable>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                The invite is locked to this email address. Pending invites hold a seat until they
                are accepted or revoked.
              </Text>
            </View>
          </>
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
  content: { paddingHorizontal: 16, paddingBottom: 44, gap: 10 },
  lede: { fontSize: 12.5, lineHeight: 18 },
  seatChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seatText: { fontSize: 10, letterSpacing: 1.6 },
  section: { fontSize: 10, letterSpacing: 2, marginTop: 6 },
  card: { borderWidth: 1, padding: 12, gap: 10, borderRadius: 12 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 13, letterSpacing: 1 },
  memberBody: { flex: 1, minWidth: 0, gap: 2 },
  memberName: { fontSize: 13.5 },
  memberMeta: { fontSize: 10, letterSpacing: 0.4 },
  roleBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  roleBadgeText: { fontSize: 9, letterSpacing: 1.2 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  smallBtnText: { fontSize: 10, letterSpacing: 1.2 },
  removeBtn: { alignSelf: "flex-start", marginTop: 4 },
  manage: { borderTopWidth: 1, paddingTop: 10, gap: 8 },
  label: { fontSize: 11 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: "100%",
    borderRadius: 8,
  },
  chipText: { fontSize: 10, letterSpacing: 1.2 },
  confirmRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  hint: { fontSize: 11, lineHeight: 16 },
  notice: { fontSize: 11.5, lineHeight: 16 },
  error: { fontSize: 11.5, lineHeight: 16 },
  loading: { paddingVertical: 26, alignItems: "center" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 13,
    borderRadius: 8,
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
    borderRadius: 8,
  },
  primaryText: { fontSize: 11, letterSpacing: 1.4 },
});
