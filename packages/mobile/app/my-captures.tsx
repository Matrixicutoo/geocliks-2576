import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useT } from "@/lib/i18n";
import { formatCoords, formatStamp } from "@/components/stamp";
import { PhotoDetail } from "@/components/photo-detail";
import { usePhotos } from "@/queries/photos";

const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "";

function resolve(url: string) {
  return url.startsWith("http") ? url : `${apiUrl}${url}`;
}

/**
 * Personal captures — stills and clips that are not filed under a project yet.
 *
 * Everything shot without an account arrives here the moment the queue drains, and so
 * does any signed-in capture left on "Unassigned". It is a filter over the photo feed
 * rather than a real auto-created project, so it never consumes one of the three
 * projects a free workspace is allowed. Filing a capture into a project later is done
 * from the detail sheet and simply moves it out of this list.
 */
export default function MyCaptures() {
  const colors = useColors();
  const t = useT();
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

  const photos = usePhotos({ unassigned: true, kind, limit: 60 });
  const rows = useMemo(() => photos.data?.photos ?? [], [photos.data]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <ProfileMenu />
        <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {t("mine.title").toUpperCase()}
        </Text>
        <LanguageMenu />
      </View>

      <Text style={[styles.body, { color: colors.mutedForeground }]}>{t("mine.body")}</Text>

      <View style={[styles.toggle, { borderColor: colors.border }]}>
        {(["photo", "video"] as const).map((option) => {
          const active = kind === option;
          return (
            <Pressable
              key={option}
              onPress={() => setKind(option)}
              accessibilityLabel={t(option === "photo" ? "mine.photos" : "mine.videos")}
              style={[
                styles.toggleItem,
                active ? { backgroundColor: colors.amber } : null,
              ]}
            >
              <Ionicons
                name={option === "photo" ? "images-outline" : "videocam-outline"}
                size={15}
                color={active ? colors.background : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.toggleText,
                  {
                    color: active ? colors.background : colors.mutedForeground,
                    fontFamily: Fonts?.mono,
                  },
                ]}
              >
                {t(option === "photo" ? "mine.photos" : "mine.videos").toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {photos.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.amber} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Ionicons
                name={kind === "photo" ? "images-outline" : "videocam-outline"}
                size={26}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t("mine.emptyBody")}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setOpenPhoto(item.id)}
              style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <View>
                {item.kind === "video" && !item.posterUrl ? (
                  <View style={[styles.photo, styles.videoFallback]}>
                    <Ionicons name="videocam-outline" size={26} color={colors.mutedForeground} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: resolve(item.kind === "video" ? item.posterUrl! : item.url) }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                )}
                {item.kind === "video" ? (
                  <View style={styles.playBadge}>
                    <Ionicons name="play" size={16} color="#0B0F14" />
                  </View>
                ) : null}
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text
                    style={[styles.stamp, { color: colors.foreground, fontFamily: Fonts?.mono }]}
                  >
                    {formatStamp(new Date(item.capturedAt))}
                  </Text>
                  <View style={styles.badge}>
                    <Ionicons
                      name={item.integrity === "verified" ? "shield-checkmark" : "alert-circle"}
                      size={12}
                      color={item.integrity === "verified" ? colors.verified : colors.alert}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: item.integrity === "verified" ? colors.verified : colors.alert,
                          fontFamily: Fonts?.mono,
                        },
                      ]}
                    >
                      {item.integrity === "verified" ? "VERIFIED" : "UNVERIFIED"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                >
                  {formatCoords(item.lat, item.lng)}
                </Text>
                {item.address ? (
                  <Text numberOfLines={1} style={[styles.addr, { color: colors.mutedForeground }]}>
                    {item.address}
                  </Text>
                ) : null}
                <Text style={[styles.code, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                  {item.photoCode} · {item.tag.toUpperCase()}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <PhotoDetail photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: { fontSize: 15, letterSpacing: 3 },
  body: { fontSize: 12, lineHeight: 18, paddingHorizontal: 16, paddingTop: 12 },
  toggle: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  toggleText: { fontSize: 10, letterSpacing: 1.2 },
  loading: { paddingTop: 40 },
  list: { padding: 16, gap: 12 },
  card: { borderWidth: 1 },
  photo: { width: "100%", height: 190, backgroundColor: "#1A212C" },
  videoFallback: { alignItems: "center", justifyContent: "center" },
  playBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,176,33,0.92)",
  },
  cardBody: { padding: 10, gap: 3 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stamp: { fontSize: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeText: { fontSize: 9, letterSpacing: 1 },
  meta: { fontSize: 10 },
  addr: { fontSize: 11 },
  code: { fontSize: 10, letterSpacing: 0.8 },
  empty: { borderWidth: 1, padding: 26, alignItems: "center", gap: 8, borderRadius: 12 },
  emptyText: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
