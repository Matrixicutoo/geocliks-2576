import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { AssignDriverSheet } from "@/components/assign-driver-sheet";
import { DeliveryChecklist } from "@/components/delivery-checklist";
import { useT, type TKey } from "@/lib/i18n";
import { useOrg } from "@/queries/orgs";
import { useArchiveRoute, useRemoveRoute, useRoutes } from "@/queries/routes";
import { canRunDeliveries } from "../../lib/roles";

const STATUS_LABEL: Record<string, TKey> = {
  draft: "routes.status.draft",
  assigned: "routes.status.assigned",
  active: "routes.status.active",
  completed: "routes.status.completed",
  cancelled: "routes.status.cancelled",
};

export default function RoutesList() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  /**
   * Which half of the board is on screen. A finished run is filed away rather than deleted, so
   * the archive is a second list behind the same header, exactly as on the website.
   */
  const [tab, setTab] = useState<"active" | "archived">("active");
  const archivedTab = tab === "archived";
  const query = useRoutes(archivedTab ? { archived: true } : undefined);
  const org = useOrg();
  const removeRoute = useRemoveRoute();
  const archiveRoute = useArchiveRoute();
  const rows = query.data ?? [];
  // Whoever may build a run may also throw one away - a dispatcher clears their own duplicates
  // rather than waiting on a manager. Same set as `canCreate` today, kept as its own name
  // because the two answer different questions. The server enforces the rule, so hiding the
  // button is presentation, not the guard.
  const canDelete = canRunDeliveries(org.data?.role);
  // Dispatcher and above build runs. Field crew only run the ones handed to them, so they never
  // see this button - and the server refuses them anyway.
  const canCreate = canRunDeliveries(org.data?.role);
  // Which run's driver popup is open. Same control the projects list has for crew, except a run
  // holds one driver, so the popup is a single-select.
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const assigning = rows.find((row) => row.id === assignFor);

  /** File a finished run away, or take it back out. The server refuses a run still running. */
  const toggleArchive = (id: string) => {
    archiveRoute.mutate(
      { id, archived: !archivedTab },
      {
        onError: (e) =>
          Alert.alert(t(archivedTab ? "routes.restore" : "routes.archive"), e.message),
      },
    );
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(t("routes.deleteRoute"), name, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          removeRoute.mutate(
            { id },
            {
              // Most likely "Stop the route before deleting it" - the server refuses to delete
              // a run that is currently moving.
              onError: (e) => Alert.alert(t("routes.deleteRoute"), e.message),
            },
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}
          >
            {t("routes.title").toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {canCreate ? (
            <Pressable
              onPress={() => router.push("/route/new")}
              accessibilityLabel={t("routes.new")}
              hitSlop={6}
              style={[styles.newBtn, { backgroundColor: colors.amber }]}
            >
              <Ionicons name="add" size={16} color={colors.primaryForeground} />
              <Text style={[styles.newText, { color: colors.primaryForeground }]}>
                {t("routes.new").toUpperCase()}
              </Text>
            </Pressable>
          ) : null}
          <LanguageMenu />
        </View>
      </View>

      {/* Filed runs stay reachable without cluttering the working board. */}
      <View style={styles.tabs}>
        {(["active", "archived"] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setTab(value)}
            style={[
              styles.tab,
              {
                borderColor: tab === value ? colors.amber : colors.border,
                backgroundColor: tab === value ? colors.amber : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: tab === value ? colors.primaryForeground : colors.mutedForeground,
                  fontFamily: Fonts?.mono,
                },
              ]}
            >
              {t(value === "active" ? "routes.tabActive" : "routes.tabArchived").toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {query.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.amber} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          // First-run guide for a brand new delivery workspace, riding above the list the way
          // it sits above the table on the website. It hides itself once every step is done, so
          // established workspaces never see it. Field crew never see it either - the steps it
          // walks through (build a run, invite drivers, assign one) are all dispatcher work.
          ListHeaderComponent={canCreate ? <DeliveryChecklist /> : null}
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Ionicons
                name={archivedTab ? "archive-outline" : "map-outline"}
                size={28}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {t(archivedTab ? "routes.emptyArchived" : "routes.empty")}
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t(archivedTab ? "routes.emptyArchivedHint" : "routes.emptyHintDriver")}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/route/${item.id}`)}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: "transparent",
                  backgroundColor: pressed ? colors.amberDeep : colors.amber,
                },
              ]}
            >
              <View style={styles.cardBody}>
                <Text style={[styles.name, { color: colors.primaryForeground }]}>{item.name}</Text>
                <Text
                  style={[
                    styles.meta,
                    styles.metaOnAmber,
                    { color: colors.primaryForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {item.date} · {t(STATUS_LABEL[item.status] ?? "routes.status.draft")}
                </Text>
                {/* This line used to be amber, which is invisible on an amber card. */}
                <Text
                  style={[styles.meta, styles.metaOnAmber, { color: colors.primaryForeground }]}
                >
                  {t("routes.progress", { n: item.doneCount, total: item.stopCount })} ·{" "}
                  {item.driverName ?? t("queue.unassigned")}
                </Text>
              </View>
              {/* Who is driving this run. A driver only sees the runs assigned to them, so this
                  is the control that decides their whole day. */}
              {canCreate && (
                <Pressable
                  onPress={() => setAssignFor(item.id)}
                  accessibilityLabel={t("driver.title")}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.delete,
                    { backgroundColor: pressed ? colors.background : "transparent" },
                  ]}
                >
                  <Ionicons name="car-outline" size={17} color={colors.primaryForeground} />
                </Pressable>
              )}
              {/* Filing a finished run away, and taking it back out. Only drawn on a run that
                  is over — the server refuses the rest — so a live run can never be taken off
                  the board under its driver. */}
              {canCreate &&
              (archivedTab || item.status === "completed" || item.status === "cancelled") ? (
                <Pressable
                  onPress={() => toggleArchive(item.id)}
                  accessibilityLabel={t(archivedTab ? "routes.restore" : "routes.archive")}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.delete,
                    { backgroundColor: pressed ? colors.background : "transparent" },
                  ]}
                >
                  <Ionicons
                    name={archivedTab ? "arrow-undo-outline" : "archive-outline"}
                    size={17}
                    color={colors.primaryForeground}
                  />
                </Pressable>
              ) : null}
              {canDelete && (
                <Pressable
                  onPress={() => confirmDelete(item.id, item.name)}
                  accessibilityLabel={t("routes.deleteRoute")}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.delete,
                    { backgroundColor: pressed ? colors.destructive : "transparent" },
                  ]}
                >
                  <Ionicons name="trash-outline" size={17} color={colors.primaryForeground} />
                </Pressable>
              )}
              <Ionicons name="chevron-forward" size={18} color={colors.primaryForeground} />
            </Pressable>
          )}
        />
      )}

      {assignFor && canCreate ? (
        <AssignDriverSheet
          routeId={assignFor}
          routeName={assigning?.name}
          driverId={assigning?.driverId ?? null}
          onClose={() => setAssignFor(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1, minWidth: 0 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  newText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  title: { fontSize: 15, letterSpacing: 1.5, flexShrink: 1, minWidth: 0, marginRight: 10 },
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  tab: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  tabText: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  delete: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 11, letterSpacing: 0.3 },
  metaOnAmber: { opacity: 0.8 },
  empty: { borderWidth: 1, borderRadius: 12, padding: 28, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: "700" },
  emptyText: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
