import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import Constants from "expo-constants";
import { useVideoPlayer, VideoView } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { formatCoords, formatStamp } from "@/components/stamp";
import FieldMap from "@/components/field-map";
import { useOrg } from "@/queries/orgs";
import { usePhoto, useRemovePhoto, useVerifyPhoto } from "@/queries/photos";
import { useCreatePhotoShareLink } from "@/queries/share";
import { useT, type TKey } from "@/lib/i18n";

const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "";

/** Seeded demo photos are public web assets; captures come back as absolute presigned URLs. */
function resolve(url: string) {
  return url.startsWith("http") ? url : `${apiUrl}${url}`;
}

const EVENT_LABEL: Record<string, TKey> = {
  captured: "event.captured",
  verified: "event.verified",
  reverified: "event.reverified",
  edited: "event.edited",
  moved: "event.moved",
  exported: "event.exported",
  shared: "event.shared",
  viewed: "event.viewed",
};

type ChainEvent = { id: string; type: string; at: string | Date; detail: string | null };

/**
 * Mirrors collapseViews in packages/web/src/web/components/photo-drawer.tsx: every public
 * /v/<code> load appends a "viewed" row, so consecutive views fold into one line with a count
 * instead of burying the real custody steps. Nothing is hidden or deleted.
 */
function collapseViews<T extends ChainEvent>(events: T[]) {
  const rows: { event: T; count: number; last: string | Date }[] = [];
  for (const event of events) {
    const prev = rows[rows.length - 1];
    if (event.type === "viewed" && prev && prev.event.type === "viewed") {
      prev.count += 1;
      prev.last = event.at;
      continue;
    }
    rows.push({ event, count: 1, last: event.at });
  }
  return rows;
}

const TAG_LABEL: Record<string, TKey> = {
  general: "tag.work",
  before: "tag.before",
  after: "tag.after",
  issue: "tag.issue",
  arrival: "tag.arrival",
  departure: "tag.departure",
  pickup: "tag.pickup",
  delivery: "tag.delivery",
};

/** Verified clip playback — the stamp is burned into the pixels when the server can burn it. */
function ClipPlayer({ uri, poster }: { uri: string; poster: string | null }) {
  const t = useT();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      style={styles.photo}
      nativeControls
      surfaceType="textureView"
      contentFit="contain"
      accessibilityLabel={poster ? t("photo.verifiedClip") : t("photo.verifiedClip")}
    />
  );
}

/**
 * Full-screen evidence detail — the mobile twin of the web PhotoDrawer.
 * Opened by tapping a photo in Teamspace or a fix in the Field Map log.
 */
export function PhotoDetail({ photoId, onClose }: { photoId: string | null; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useT();
  const photo = usePhoto(photoId);
  const verify = useVerifyPhoto();
  const remove = useRemovePhoto();
  const shareLink = useCreatePhotoShareLink();
  const org = useOrg();
  /** Field crews capture evidence; only manager and above can remove it. */
  const canDelete = org.data?.role !== "field";
  const [confirmDelete, setConfirmDelete] = useState(false);
  const data = photo.data;

  const rows: [string, string][] = data
    ? [
        [t("evidence.photoCode").toUpperCase(), data.photoCode],
        [t("photo.deviceTime").toUpperCase(), formatStamp(new Date(data.capturedAt))],
        [
          t("photo.networkTime").toUpperCase(),
          data.verifiedAt ? formatStamp(new Date(data.verifiedAt)) : "—",
        ],
        [t("photo.timeSource").toUpperCase(), data.timeSource],
        [t("photo.clockSkew").toUpperCase(), `${Math.round((data.clockSkewMs ?? 0) / 1000)}s`],
        [t("evidence.coords").toUpperCase(), formatCoords(data.lat, data.lng)],
        [
          t("photo.accuracy").toUpperCase(),
          data.accuracyM != null ? `±${Math.round(data.accuracyM)} m` : "—",
        ],
        [t("evidence.address").toUpperCase(), data.address ?? "—"],
        [t("evidence.author").toUpperCase(), data.author?.name ?? data.author?.email ?? "—"],
        [t("photo.device").toUpperCase(), data.deviceModel ?? "—"],
        [
          t("photo.contentHash").toUpperCase(),
          data.contentHash ? `${data.contentHash.slice(0, 20)}…` : "—",
        ],
        [
          t("photo.signature").toUpperCase(),
          data.signature ? `${data.signature.slice(0, 20)}…` : "—",
        ],
        ...(data.recipient
          ? ([[t("evidence.recipient").toUpperCase(), data.recipient]] as [string, string][])
          : []),
      ]
    : [];

  return (
    <Modal
      visible={!!photoId}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={[
            styles.bar,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              paddingTop: Math.max(insets.top, 12) + 10,
            },
          ]}
        >
          <Text style={[styles.barCode, { color: colors.amber, fontFamily: Fonts?.mono }]}>
            {data?.photoCode ?? t("common.loading").toUpperCase()}
          </Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel={t("photo.close")}>
            <Ionicons name="close" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {photo.isLoading || !data ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <View style={[styles.frame, { borderColor: colors.border }]}>
              {data.kind === "video" ? (
                <ClipPlayer
                  uri={resolve(data.url)}
                  poster={data.posterUrl ? resolve(data.posterUrl) : null}
                />
              ) : (
                <Image
                  source={{ uri: resolve(data.url) }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              )}
              <View style={styles.overlay}>
                <View style={[styles.overlayTick, { backgroundColor: colors.amber }]} />
                <View style={styles.overlayText}>
                  <Text style={[styles.overlayTime, { fontFamily: Fonts?.mono }]}>
                    {formatStamp(new Date(data.capturedAt))}
                  </Text>
                  <Text style={[styles.overlayMeta, { fontFamily: Fonts?.mono }]}>
                    {formatCoords(data.lat, data.lng)}
                  </Text>
                  <Text numberOfLines={2} style={[styles.overlayMeta, { fontFamily: Fonts?.mono }]}>
                    {data.address ?? t("project.noAddress")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.chips}>
              <View
                style={[
                  styles.chip,
                  {
                    borderColor: data.integrity === "verified" ? colors.verified : colors.alert,
                  },
                ]}
              >
                <Ionicons
                  name={data.integrity === "verified" ? "shield-checkmark" : "alert-circle"}
                  size={12}
                  color={data.integrity === "verified" ? colors.verified : colors.alert}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: data.integrity === "verified" ? colors.verified : colors.alert,
                      fontFamily: Fonts?.mono,
                    },
                  ]}
                >
                  {data.integrity === "verified"
                    ? t("evidence.verified").toUpperCase()
                    : t("evidence.unverified").toUpperCase()}
                </Text>
              </View>
              <View style={[styles.chip, { borderColor: colors.border }]}>
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {(TAG_LABEL[data.tag] ? t(TAG_LABEL[data.tag] as TKey) : data.tag).toUpperCase()}
                </Text>
              </View>
              {data.project ? (
                <View style={[styles.chip, { borderColor: colors.border }]}>
                  <Text
                    numberOfLines={1}
                    style={[styles.chipText, { color: colors.sky, fontFamily: Fonts?.mono }]}
                  >
                    {data.project.name.toUpperCase()}
                  </Text>
                </View>
              ) : null}
            </View>

            {data.note ? (
              <Text style={[styles.note, { color: colors.foreground }]}>{data.note}</Text>
            ) : null}

            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {t("evidence.verificationRecord").toUpperCase()}
            </Text>
            <View style={[styles.record, { borderColor: colors.border, backgroundColor: colors.card }]}>
              {rows.map(([term, value]) => (
                <View key={term} style={styles.recordRow}>
                  <Text
                    style={[styles.term, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                  >
                    {term}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.value, { color: colors.foreground, fontFamily: Fonts?.mono }]}
                  >
                    {String(value)}
                  </Text>
                </View>
              ))}
            </View>

            {data.signaturePath ? (
              <>
                <Text
                  style={[
                    styles.label,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {t("evidence.signature").toUpperCase()}
                </Text>
                <View
                  style={[
                    styles.signature,
                    { borderColor: colors.border, backgroundColor: colors.card },
                  ]}
                >
                  <Svg
                    width="100%"
                    height="100%"
                    viewBox={data.signatureBox ?? "0 0 320 150"}
                  >
                    <Path
                      d={data.signaturePath}
                      stroke={colors.foreground}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                </View>
              </>
            ) : null}

            {data.lat != null && data.lng != null ? (
              <>
                <FieldMap
                  pins={[
                    {
                      id: data.id,
                      lat: data.lat,
                      lng: data.lng,
                      photoCode: data.photoCode,
                      address: data.address,
                      capturedAt: data.capturedAt,
                    },
                  ]}
                  showRoute={false}
                  height={220}
                />
                <Text
                  style={[styles.caption, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                >
                  {t("photo.captureLocation").toUpperCase()} · {formatCoords(data.lat, data.lng)}
                </Text>
              </>
            ) : (
              <Text
                style={[
                  styles.noFix,
                  { color: colors.mutedForeground, borderColor: colors.border, fontFamily: Fonts?.mono },
                ]}
              >
                {t("photo.noGps").toUpperCase()}
              </Text>
            )}

            <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {t("evidence.chainOfCustody").toUpperCase()}
            </Text>
            <View style={[styles.chain, { borderColor: colors.border }]}>
              {collapseViews(data.events).map(({ event, count, last }) => (
                <View key={event.id} style={styles.event}>
                  <View style={[styles.dot, { backgroundColor: colors.amber }]} />
                  <View style={styles.eventBody}>
                    <Text style={[styles.eventTitle, { color: colors.foreground }]}>
                      {count > 1
                        ? t("event.viewedTimes", { n: count })
                        : EVENT_LABEL[event.type]
                          ? t(EVENT_LABEL[event.type] as TKey)
                          : event.type}
                    </Text>
                    <Text
                      style={[
                        styles.eventMeta,
                        { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                      ]}
                    >
                      {count > 1
                        ? `${formatStamp(new Date(event.at))} - ${formatStamp(new Date(last))}`
                        : `${formatStamp(new Date(event.at))}${event.detail ? ` · ${event.detail}` : ""}`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* One native sheet covers email, messaging apps, the social networks and copy. */}
            <Pressable
              disabled={shareLink.isPending}
              onPress={async () => {
                try {
                  const res = await shareLink.mutateAsync({ photoId: data.id });
                  const url = `${apiUrl}/share/${res.token}`;
                  const title = t("shareMenu.photoTitle", { code: data.photoCode });
                  await Share.share({ title, message: `${title}\n${url}`, url });
                } catch {
                  // Nothing to do — the sheet simply does not open.
                }
              }}
              accessibilityLabel={t("shareMenu.title")}
              style={[styles.action, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              {shareLink.isPending ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name="share-social-outline" size={14} color={colors.accent} />
              )}
              <Text
                style={[styles.actionText, { color: colors.foreground, fontFamily: Fonts?.mono }]}
              >
                {t("shareMenu.title").toUpperCase()}
              </Text>
            </Pressable>

            <Pressable
              disabled={verify.isPending}
              onPress={() => verify.mutate({ id: data.id })}
              style={[styles.action, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              {verify.isPending ? (
                <ActivityIndicator size="small" color={colors.verified} />
              ) : (
                <Ionicons name="refresh" size={14} color={colors.verified} />
              )}
              <Text
                style={[styles.actionText, { color: colors.foreground, fontFamily: Fonts?.mono }]}
              >
                {t("evidence.reverify").toUpperCase()}
              </Text>
            </Pressable>

            {/* Deleting evidence cannot be undone, so the button arms a confirm step first. */}
            {canDelete ? (
              <Pressable
                disabled={remove.isPending}
                onPress={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  remove.mutate({ id: data.id }, { onSuccess: onClose });
                }}
                style={[
                  styles.action,
                  {
                    borderColor: confirmDelete ? colors.alert : colors.border,
                    backgroundColor: confirmDelete ? `${colors.alert}22` : colors.card,
                  },
                ]}
              >
                {remove.isPending ? (
                  <ActivityIndicator size="small" color={colors.alert} />
                ) : (
                  <Ionicons name="trash-outline" size={14} color={colors.alert} />
                )}
                <Text style={[styles.actionText, { color: colors.alert, fontFamily: Fonts?.mono }]}>
                  {(confirmDelete ? t("common.confirm") : t("common.delete")).toUpperCase()}
                </Text>
              </Pressable>
            ) : null}

            {canDelete && confirmDelete ? (
              <Text
                style={[
                  styles.verifyOut,
                  { color: colors.alert, borderColor: colors.alert, fontFamily: Fonts?.mono },
                ]}
              >
                {`${t("photo.deleteConfirm")} ${t("photo.deleteHint")}`}
              </Text>
            ) : null}

            {verify.data ? (
              <Text
                style={[
                  styles.verifyOut,
                  {
                    color: verify.data.ok ? colors.verified : colors.alert,
                    borderColor: verify.data.ok ? colors.verified : colors.alert,
                    fontFamily: Fonts?.mono,
                  },
                ]}
              >
                {verify.data.ok ? t("photo.sealIntact") : t("photo.sealBroken")}
              </Text>
            ) : null}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  barCode: { fontSize: 11, letterSpacing: 1.6 },
  loading: { paddingTop: 48 },
  body: { padding: 16, paddingBottom: 40, gap: 10 },
  frame: { borderWidth: 1, overflow: "hidden" },
  photo: { width: "100%", height: 260, backgroundColor: "#0B0F14" },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  overlayTick: { width: 3 },
  overlayText: { flex: 1, paddingHorizontal: 10, paddingVertical: 7, gap: 1 },
  overlayTime: { fontSize: 12, color: "#FFFFFF" },
  overlayMeta: { fontSize: 10, color: "rgba(255,255,255,0.82)" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
    maxWidth: "60%",
    borderRadius: 6,
  },
  chipText: { fontSize: 9, letterSpacing: 1.1 },
  note: { fontSize: 13, lineHeight: 19 },
  label: { fontSize: 9, letterSpacing: 1.4, marginTop: 8 },
  record: { borderWidth: 1, padding: 10, gap: 5, borderRadius: 8 },
  recordRow: { flexDirection: "row", gap: 8 },
  signature: {
    height: 130,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  term: { width: 108, fontSize: 9, letterSpacing: 0.8 },
  value: { flex: 1, fontSize: 10 },
  caption: { fontSize: 9, letterSpacing: 1.2, marginTop: 2 },
  noFix: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9, fontSize: 9.5, letterSpacing: 1.1, borderRadius: 8 },
  chain: { borderLeftWidth: 1, paddingLeft: 12, gap: 10, marginLeft: 4 },
  event: { flexDirection: "row", gap: 8 },
  dot: { position: "absolute", left: -16, top: 6, width: 7, height: 7 },
  eventBody: { flex: 1, gap: 1 },
  eventTitle: { fontSize: 12.5 },
  eventMeta: { fontSize: 10 },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  actionText: { fontSize: 10, letterSpacing: 1.4 },
  verifyOut: { borderWidth: 1, padding: 10, fontSize: 10.5, lineHeight: 15, borderRadius: 8 },
});
