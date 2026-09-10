import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { useT, type TKey } from "@/lib/i18n";
import { useOrg } from "@/queries/orgs";
import { useRemoveRoute, useRoutes } from "@/queries/routes";
import { canManageWorkspace, canRunDeliveries } from "../../lib/roles";

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
  const query = useRoutes();
  const org = useOrg();
  const removeRoute = useRemoveRoute();
  const rows = query.data ?? [];
  // Owner, admin and manager can delete a run; field crew cannot. The server enforces the same
  // rule, so hiding the button is presentation, not the guard.
  const canDelete = canManageWorkspace(org.data?.role);
  // Dispatcher and above build runs. Field crew only run the ones handed to them, so they never
  // see this button - and the server refuses them anyway.
  const canCreate = canRunDeliveries(org.data?.role);

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

      {query.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.amber} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Ionicons name="map-outline" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {t("routes.empty")}
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t("routes.emptyHintDriver")}
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
                  {t("routes.progress", { n: item.doneCount, total: item.stopCount })}
                </Text>
              </View>
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
