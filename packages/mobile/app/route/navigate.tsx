import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import NavMap, { type NavMapHandle } from "@/components/nav-map";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useLocale, useT } from "@/lib/i18n";
import { IMMINENT_M, useNavVoice } from "@/lib/nav-voice";
import { useDirections, useRoute } from "@/queries/routes";
import { ARRIVAL_RADIUS_M, useArrival } from "@/hooks/use-arrival";
import { arrivalClock, formatDuration, formatMetres, metresBetween, metresOffPath } from "@/lib/geo";
import { shootParams } from "@/lib/shoot";
import { useKeepScreenOn } from "@/hooks/use-keep-screen-on";

/**
 * In-app turn-by-turn to one stop.
 *
 * GeoCliks used to hand the driver to Google Maps, which was free and worked — right up to the
 * doorstep. Once Maps was in front, the app was backgrounded, and the proof photo waited on the
 * driver remembering to swipe back to it. Owning the screen for the whole leg is what lets the
 * arrival card put the camera in front of him the moment he pulls up, with no background
 * location permission and no notification he might miss.
 *
 * The turn list comes from the server (see api/lib/directions.ts) and is billed per request, so
 * it is asked for once when this screen opens and again only when the driver has genuinely
 * driven off the line.
 */

/** Past this far from the drawn line he is not on it any more, and the leg is worth re-asking. */
const OFF_ROUTE_M = 90;
/** Never re-ask faster than this, whatever the GPS says. Each re-ask is a billed request. */
const REROUTE_COOLDOWN_MS = 45_000;
/** Within this of a step's end, that instruction is done and the next one is the live one. */
const STEP_DONE_M = 35;

type Fix = { lat: number; lng: number; heading: number | null; speed: number | null };

/** The phone's own position, watched tightly — this screen is the one that earns the battery. */
function useLiveFix(enabled: boolean): { fix: Fix | null; denied: boolean } {
  const [fix, setFix] = useState<Fix | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    let sub: Location.LocationSubscription | null = null;

    const stop = () => {
      try {
        sub?.remove();
      } catch {
        // Already unwatched; only the library's listener bookkeeping failed.
      }
      sub = null;
    };

    void (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!live) return;
        if (status !== "granted") {
          setDenied(true);
          return;
        }
        const apply = (pos: Location.LocationObject) => {
          if (!live) return;
          setFix({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heading: typeof pos.coords.heading === "number" ? pos.coords.heading : null,
            speed: typeof pos.coords.speed === "number" ? pos.coords.speed : null,
          });
        };
        apply(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }));
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 3000 },
          apply,
        );
        if (!live) stop();
      } catch {
        if (live) setDenied(true);
      }
    })();

    return () => {
      live = false;
      stop();
    };
  }, [enabled]);

  return { fix, denied };
}

export default function RouteNavigate() {
  // Screen stays on while this is in front: see hooks/use-keep-screen-on.ts.
  useKeepScreenOn("navigate");
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ routeId: string; stopId: string }>();
  const routeId = typeof params.routeId === "string" ? params.routeId : null;
  const stopId = typeof params.stopId === "string" ? params.stopId : null;

  const query = useRoute(routeId);
  const route = query.data?.route ?? null;
  const stops = useMemo(() => query.data?.stops ?? [], [query.data]);
  const stop = useMemo(() => stops.find((s) => s.id === stopId) ?? null, [stops, stopId]);

  const { fix, denied } = useLiveFix(true);
  const arrival = useArrival(stop, !!stop);
  const directions = useDirections();
  const { locale } = useLocale();
  const voice = useNavVoice(locale);

  const map = useRef<NavMapHandle | null>(null);
  const [leg, setLeg] = useState<Awaited<ReturnType<typeof directions.mutateAsync>> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  // Following means the camera rides the driver. Panning the map by hand drops it, so he can
  // look ahead down the road without the next fix yanking the view back.
  const [following, setFollowing] = useState(true);
  const lastAsk = useRef(0);
  const asking = useRef(false);

  const pin = useMemo(
    () =>
      stop && typeof stop.lat === "number" && typeof stop.lng === "number"
        ? { lat: stop.lat, lng: stop.lng }
        : null,
    [stop],
  );

  /**
   * Ask the server for the leg. Guarded by a ref rather than the mutation's own pending flag
   * because the GPS can fire twice before React has re-rendered, and each extra call is money.
   */
  const askForLeg = useCallback(
    async (from: { lat: number; lng: number }) => {
      if (!stopId || asking.current) return;
      if (Date.now() - lastAsk.current < REROUTE_COOLDOWN_MS && leg) return;
      asking.current = true;
      lastAsk.current = Date.now();
      try {
        const next = await directions.mutateAsync({
          stopId,
          fromLat: from.lat,
          fromLng: from.lng,
          // The turn text comes back in this language, and is then spoken in it.
          locale,
        });
        setLeg(next);
        setStepIndex(0);
        // A recalculated leg renumbers the steps, so the spoken history no longer applies.
        voice.reset();
      } catch {
        // The card below already says there is no line; the destination pin is still on the map
        // and the driver can still steer at it.
      } finally {
        asking.current = false;
      }
    },
    [stopId, directions, leg, locale, voice],
  );

  // First leg, as soon as there is a position to start it from.
  useEffect(() => {
    if (!fix || !pin || leg) return;
    void askForLeg(fix);
  }, [fix, pin, leg, askForLeg]);

  const offPath = useMemo(
    () => (fix && leg ? metresOffPath(fix, leg.path) : null),
    [fix, leg],
  );

  // Off the line and past the cooldown: re-ask. Not while he is already at the address —
  // walking the parcel to a door is not a wrong turn.
  useEffect(() => {
    if (!fix || !leg || offPath == null) return;
    if (arrival.state === "at") return;
    if (offPath <= OFF_ROUTE_M) return;
    if (Date.now() - lastAsk.current < REROUTE_COOLDOWN_MS) return;
    void askForLeg(fix);
  }, [fix, leg, offPath, arrival.state, askForLeg]);

  // Advance the instruction as he passes each turn.
  useEffect(() => {
    if (!fix || !leg || leg.steps.length === 0) return;
    let next = stepIndex;
    while (next < leg.steps.length) {
      const step = leg.steps[next];
      if (!step) break;
      if (metresBetween(fix, step.at) > STEP_DONE_M) break;
      next++;
    }
    if (next !== stepIndex) setStepIndex(Math.min(next, leg.steps.length - 1));
  }, [fix, leg, stepIndex]);

  // The camera rides behind the driver, turned the way he is driving. Pitched, because a
  // flat-on view of a junction tells you much less than a low one does.
  useEffect(() => {
    if (!following || !fix) return;
    map.current?.follow(fix);
  }, [fix, following]);

  /*
    The voice.

    Two utterances per turn: one when it becomes the next thing to do, carrying the distance to
    it, and one as he reaches it, carrying just the instruction. The keys are what keep it to
    two — they change only when the step or the phase does, so this may run on every GPS fix
    and still say each thing exactly once.
  */
  const currentStep = leg?.steps[stepIndex] ?? null;
  useEffect(() => {
    if (arrival.state === "at") {
      voice.say(
        t("drive.arrivedVoice", { address: stop?.address ?? stop?.addressRaw ?? "" }),
        "arrived",
      );
      return;
    }
    if (!fix || !currentStep) return;
    const away = metresBetween(fix, currentStep.at);
    if (away <= IMMINENT_M) {
      voice.say(currentStep.instruction, `${stepIndex}:now`);
      return;
    }
    voice.say(
      t("drive.ahead", { distance: formatMetres(away), instruction: currentStep.instruction }),
      `${stepIndex}:ahead`,
    );
  }, [fix, currentStep, stepIndex, arrival.state, stop, voice, t]);

  /** Everything the bottom bar says: what is left of the drive, and when he gets there. */
  const remaining = useMemo(() => {
    if (!fix || !pin) return null;
    const straight = metresBetween(fix, pin);
    if (!leg) return { metres: Math.round(straight * 1.35), seconds: null as number | null };
    // The leg was measured from where he started it. Scaling it by how much of the straight
    // line is left is rough, but it counts down as he drives instead of freezing at the number
    // he set off with, and it never needs another billed request.
    const startStraight = leg.path[0] ? metresBetween(leg.path[0], pin) : straight;
    const share = startStraight > 0 ? Math.min(1, straight / startStraight) : 0;
    return {
      metres: Math.round(leg.metres * share),
      seconds: Math.round(leg.seconds * share),
    };
  }, [fix, pin, leg]);

  const step = currentStep;
  const atStop = arrival.state === "at";

  const goShoot = (outcome: "delivered" | "failed") => {
    if (!stop || !route) return;
    router.replace({
      pathname: "/",
      params: shootParams({ route, stop, stopTotal: stops.length, outcome }),
    });
  };

  const back = () => {
    if (routeId) router.replace({ pathname: "/route/[id]", params: { id: routeId } });
    else router.back();
  };

  if (query.isLoading) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.amber} />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <NavMap
        ref={map}
        pin={pin}
        path={leg?.path ?? []}
        dashed={leg?.provider === "direct"}
        markerTitle={stop?.address ?? stop?.addressRaw}
        strokeColor={colors.amber}
        // Any hand on the map means he wants to look somewhere else. The FOLLOW button gives
        // the camera back.
        onUserPan={() => setFollowing(false)}
      />

      <SafeAreaView edges={["top", "left", "right"]} style={styles.top} pointerEvents="box-none">
        <View style={[styles.banner, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Pressable onPress={back} hitSlop={10} accessibilityLabel={t("common.close")}>
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.bannerBody}>
            {step ? (
              <>
                <Text style={[styles.instruction, { color: colors.foreground }]} numberOfLines={2}>
                  {step.instruction}
                </Text>
                <Text
                  style={[
                    styles.bannerMeta,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {formatMetres(step.metres)}
                  {leg?.provider === "direct" ? ` · ${t("drive.straightLine")}` : ""}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.instruction, { color: colors.foreground }]} numberOfLines={2}>
                  {stop?.address ?? stop?.addressRaw ?? t("drive.title")}
                </Text>
                <Text
                  style={[
                    styles.bannerMeta,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {denied
                    ? t("drive.noLocation")
                    : !fix
                      ? t("drive.locating")
                      : directions.isPending
                        ? t("drive.routing")
                        : t("drive.straightLine")}
                </Text>
              </>
            )}
          </View>
          {directions.isPending ? <ActivityIndicator size="small" color={colors.amber} /> : null}
          {/* Mute lives on the banner, next to the words being read, so it is obvious what it
              silences — and it is a big target, because it gets pressed while driving. */}
          <Pressable
            onPress={voice.toggleMuted}
            hitSlop={12}
            accessibilityLabel={voice.muted ? t("drive.voiceOn") : t("drive.voiceOff")}
            accessibilityRole="switch"
            accessibilityState={{ checked: !voice.muted }}
          >
            <Ionicons
              name={voice.muted ? "volume-mute-outline" : "volume-high"}
              size={22}
              color={voice.muted ? colors.mutedForeground : colors.amber}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {!following ? (
        <Pressable
          onPress={() => setFollowing(true)}
          accessibilityLabel={t("drive.follow")}
          style={[styles.follow, { borderColor: colors.amber, backgroundColor: colors.card }]}
        >
          <Ionicons name="navigate" size={18} color={colors.amber} />
          <Text style={[styles.followText, { color: colors.amber, fontFamily: Fonts?.mono }]}>
            {t("drive.follow").toUpperCase()}
          </Text>
        </Pressable>
      ) : null}

      <SafeAreaView edges={["bottom", "left", "right"]} style={styles.bottom} pointerEvents="box-none">
        {atStop ? (
          /*
            The arrival card.
            
            This is the whole reason navigation moved inside the app: the driver pulls up and the
            next thing on his screen is the shutter, one tap away, with the address he is standing
            at written above it. No swiping back out of a maps app, no notification to miss.
          */
          <View
            style={[styles.card, { borderColor: colors.amber, backgroundColor: colors.card }]}
          >
            <View style={styles.arrivedHead}>
              <Ionicons name="location" size={18} color={colors.amber} />
              <Text style={[styles.arrivedTitle, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                {t("drive.arrived").toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.address, { color: colors.foreground }]} numberOfLines={2}>
              {stop?.address ?? stop?.addressRaw}
            </Text>
            {stop?.recipientName ? (
              <Text style={[styles.line, { color: colors.foreground }]}>{stop.recipientName}</Text>
            ) : null}
            {stop?.notes ? (
              <Text style={[styles.meta, { color: colors.amber }]} numberOfLines={3}>
                <Text style={{ fontFamily: Fonts?.mono }}>{t("run.officeNote").toUpperCase()}</Text>
                {" · "}
                {stop.notes}
              </Text>
            ) : null}

            <Pressable
              onPress={() => goShoot("delivered")}
              accessibilityLabel={t("run.takePhoto")}
              style={[styles.shoot, { backgroundColor: colors.amber }]}
            >
              <Ionicons name="camera" size={22} color={colors.primaryForeground} />
              <Text style={[styles.shootText, { color: colors.primaryForeground }]}>
                {t("run.takePhoto").toUpperCase()}
              </Text>
            </Pressable>

            <View style={styles.arrivedFoot}>
              {stop?.recipientPhone ? (
                <Pressable
                  onPress={() => void Linking.openURL(`tel:${stop.recipientPhone}`)}
                  accessibilityLabel={t("run.call")}
                  style={[styles.footBtn, { borderColor: colors.border }]}
                >
                  <Ionicons name="call-outline" size={15} color={colors.foreground} />
                  <Text style={[styles.footText, { color: colors.foreground }]}>
                    {t("run.call")}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={back}
                accessibilityLabel={t("drive.openStop")}
                style={[styles.footBtn, { borderColor: colors.border }]}
              >
                <Ionicons name="list-outline" size={15} color={colors.mutedForeground} />
                <Text style={[styles.footText, { color: colors.mutedForeground }]}>
                  {t("drive.openStop")}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.bar, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.barCol}>
              <Text style={[styles.barBig, { color: colors.foreground }]}>
                {remaining ? formatMetres(remaining.metres) : "—"}
              </Text>
              <Text
                style={[styles.barLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
              >
                {t("drive.remaining").toUpperCase()}
              </Text>
            </View>
            <View style={styles.barCol}>
              <Text style={[styles.barBig, { color: colors.foreground }]}>
                {remaining?.seconds != null ? formatDuration(remaining.seconds) : "—"}
              </Text>
              <Text
                style={[styles.barLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
              >
                {remaining?.seconds != null
                  ? t("drive.eta", { at: arrivalClock(remaining.seconds) }).toUpperCase()
                  : t("drive.drive").toUpperCase()}
              </Text>
            </View>
            <View style={styles.barCol}>
              <Text style={[styles.barBig, { color: colors.amber }]}>
                {arrival.metres != null ? formatMetres(arrival.metres) : "—"}
              </Text>
              <Text
                style={[styles.barLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
              >
                {t("drive.toDoor", { r: ARRIVAL_RADIUS_M }).toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* No pin, no line: the address never resolved. He still gets the text and the office
            still gets told, but this screen cannot point anywhere. */}
        {!pin ? (
          <View
            style={[styles.notice, { borderColor: colors.destructive, backgroundColor: colors.card }]}
          >
            <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
            <Text style={[styles.meta, { color: colors.destructive, flex: 1 }]}>
              {t("drive.noPin")}
            </Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { position: "absolute", top: 0, left: 0, right: 0, padding: 10 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  bannerBody: { flex: 1, gap: 2 },
  instruction: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  bannerMeta: { fontSize: 10, letterSpacing: 1.1 },
  follow: {
    position: "absolute",
    right: 12,
    bottom: 190,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  followText: { fontSize: 10, letterSpacing: 1.2 },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10, gap: 8 },
  bar: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  barCol: { flex: 1, alignItems: "center", gap: 3 },
  barBig: { fontSize: 17, fontWeight: "700" },
  barLabel: { fontSize: 9, letterSpacing: 1 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  arrivedHead: { flexDirection: "row", alignItems: "center", gap: 7 },
  arrivedTitle: { fontSize: 11, letterSpacing: 1.3 },
  address: { fontSize: 19, fontWeight: "700", lineHeight: 25 },
  line: { fontSize: 14 },
  meta: { fontSize: 11, lineHeight: 16 },
  // Deliberately taller than any other button in the app: it is the one thing he has to press
  // while holding a parcel, in the rain, with a customer watching.
  shoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
    borderRadius: 10,
    marginTop: 2,
  },
  shootText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.8 },
  arrivedFoot: { flexDirection: "row", gap: 8 },
  footBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 11,
  },
  footText: { fontSize: 12, fontWeight: "600" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
