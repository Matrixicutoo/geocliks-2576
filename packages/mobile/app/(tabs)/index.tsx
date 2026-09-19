import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as Location from "expo-location";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { Stamp, formatCoords } from "@/components/stamp";
import { useProjects } from "@/queries/projects";
import { useOrg, useTemplates } from "@/queries/orgs";
import { useT, type TKey } from "@/lib/i18n";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useInvalidatePhotos, useVideoPolicy } from "@/queries/photos";
import { useHasSession } from "@/hooks/use-session";
import { useTeamspaceNudge } from "@/hooks/use-teamspace-nudge";
import { TeamspaceSheet } from "@/components/teamspace-sheet";
import { drainQueue, enqueue, readQueue, subscribeQueue, type QueuedPhoto } from "@/lib/queue";
import { clockStampForCapture, ensureClockSync } from "@/lib/clock";
import { SignaturePad } from "@/components/signature-pad";
import { ScanReview } from "@/components/scan-review";
import {
  buildScanPdf,
  hasNativeScanner,
  pageOf,
  scanFileName,
  scanWithNativeScanner,
  type ScanPage,
} from "@/lib/doc-scan";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Remembered capture selections. A crew member doing forty drops a day should not have to
// re-pick DELIVERY and the same project on every single shot. CLOCK mode is excluded on purpose:
// it still forces arrival/departure.
const TAG_KEY = "geocliks.capture.tag.v1";
const PROJECT_KEY = "geocliks.capture.project.v1";
const STAMP_KEY = "geocliks.capture.stamp.v1";

const TAGS: { key: QueuedPhoto["tag"]; label: TKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "arrival", label: "tag.arrival", icon: "enter-outline" },
  { key: "before", label: "tag.before", icon: "time-outline" },
  { key: "general", label: "tag.work", icon: "hammer-outline" },
  { key: "after", label: "tag.after", icon: "checkmark-done-outline" },
  { key: "issue", label: "tag.issue", icon: "warning-outline" },
  { key: "departure", label: "tag.departure", icon: "exit-outline" },
  { key: "pickup", label: "tag.pickup", icon: "cube-outline" },
  { key: "delivery", label: "tag.delivery", icon: "checkmark-circle-outline" },
];

/** Bottom mode strip — Photo sits in the middle and is the default. */
type Mode = "scan" | "video" | "photo" | "clock";

const MODES: { key: Mode; label: TKey }[] = [
  { key: "scan", label: "capture.mode.scan" },
  { key: "video", label: "capture.mode.video" },
  { key: "photo", label: "capture.mode.photo" },
  { key: "clock", label: "capture.mode.clock" },
];

/** Zoom pill steps — CameraView takes a normalized 0..1 zoom. */
const ZOOM_STEPS: { label: string; value: number }[] = [
  { label: "1.0x", value: 0 },
  { label: "2.0x", value: 0.25 },
  { label: "3.0x", value: 0.5 },
];

type Fix = {
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  altitudeM: number | null;
  heading: number | null;
  address: string | null;
};

const EMPTY_FIX: Fix = {
  lat: null,
  lng: null,
  accuracyM: null,
  altitudeM: null,
  heading: null,
  address: null,
};

/** One readable line out of a reverse-geocode hit, best part first. */
function addressLineOf(place: Location.LocationGeocodedAddress): string | null {
  const line = [
    [place.streetNumber, place.street].filter(Boolean).join(" "),
    place.city ?? place.subregion,
    place.region,
    place.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  return line || null;
}

/** Straight-line metres between two fixes — used to decide when the address is stale. */
function metersBetween(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Re-geocode once the device has moved this far from the point the address was read at. */
const ADDRESS_REFRESH_M = 40;

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Capture() {
  const colors = useColors();
  const camera = useRef<CameraView | null>(null);
  const isNative = Platform.OS !== "web";
  const router = useRouter();

  // Delivery-route context. The run screen hands a stop over to this camera instead of
  // duplicating the whole stamp / GPS / queue pipeline in a second capture screen.
  const params = useLocalSearchParams<{
    stopId?: string;
    routeId?: string;
    stopSeq?: string;
    stopTotal?: string;
    stopLabel?: string;
    recipient?: string;
    outcome?: string;
    reason?: string;
    note?: string;
    requireSignature?: string;
  }>();
  const stopId = typeof params.stopId === "string" && params.stopId ? params.stopId : null;
  const stopRouteId = typeof params.routeId === "string" && params.routeId ? params.routeId : null;
  const stopOutcome: "delivered" | "failed" = params.outcome === "failed" ? "failed" : "delivered";

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [fix, setFix] = useState<Fix>(EMPTY_FIX);
  const [locDenied, setLocDenied] = useState(false);
  const [mode, setMode] = useState<Mode>("photo");
  const [tagOpen, setTagOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  // Hover only fires on web (Expo web preview / desktop); on a phone the same darkening is
  // driven by Pressable's `pressed` state, so the bars react to both a mouse and a finger.
  const [projectHover, setProjectHover] = useState(false);
  const [tagHover, setTagHover] = useState(false);
  const [signHover, setSignHover] = useState(false);
  // The third selector bar: a free-text note burned into the stamp of the next capture. It
  // describes one photo, so it is cleared the moment the shot is committed rather than
  // remembered like the project and the tag.
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteHover, setNoteHover] = useState(false);
  const [note, setNote] = useState("");
  // The sheet edits a draft, so backing out of it leaves the committed note untouched.
  const [noteDraft, setNoteDraft] = useState("");
  // Same reason as the signature ref: `commit` reads the note out of a closure that can be a
  // render behind the sheet's save, and a note typed and shot immediately must not be dropped.
  const noteRef = useRef("");
  const [tag, setTag] = useState<QueuedPhoto["tag"]>("general");
  // Last tag used outside CLOCK mode — restored on launch and when returning to photo/video.
  const [photoTag, setPhotoTag] = useState<QueuedPhoto["tag"]>("general");
  const [recipient, setRecipient] = useState("");
  const [signaturePath, setSignaturePath] = useState<string | null>(null);
  const [signatureBox, setSignatureBox] = useState<string | null>(null);
  // Saving on the pad emits the drawing and closes the sheet in the same handler, so the close
  // callback would still read the pre-save `signaturePath` out of its closure and decide nothing
  // was signed. The ref holds what the pad last emitted, current at the moment it closes.
  const signatureRef = useRef<string | null>(null);
  // Off by default: the crew member flips it on for the drops that actually need a
  // signature. A no-contact drop still has to be capturable.
  const [requireSignature, setRequireSignature] = useState(false);
  const [podError, setPodError] = useState(false);
  // Signing happens in a full-screen sheet — a strip of the capture screen is not enough room for
  // a recipient to sign on. Ticking REQUIRE SIGNATURE opens it straight away.
  const [signOpen, setSignOpen] = useState(false);
  // Stamp preview is OFF by default so the viewfinder is clear; it is toggled from the profile
  // menu, top-left, and the choice is remembered. The saved file is stamped either way.
  const [showLocation, setShowLocation] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  // null until the stored value has been read; wrapped so "no saved project" is distinguishable.
  const [savedProject, setSavedProject] = useState<{ id: string | null } | null>(null);
  const projectApplied = useRef(false);
  const [now, setNow] = useState(new Date());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [lastShot, setLastShot] = useState<string | null>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState(false);
  const [zoomStep, setZoomStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  /**
   * SCAN mode session. Pages accumulate here and nothing is filed until SAVE PDF — a
   * two-page work order is one document, not two captures, so the queue only ever sees the
   * finished PDF. The name is minted with the first page so the crew member can read what
   * they are building before it is saved.
   */
  const [scanPages, setScanPages] = useState<ScanPage[]>([]);
  const [scanName, setScanName] = useState<string | null>(null);
  // The page open in the review sheet, and whether keeping it appends to the session (a
  // fresh capture) or replaces the page already in it (a re-edit).
  const [reviewPage, setReviewPage] = useState<ScanPage | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  const projects = useProjects();
  const org = useOrg();
  const templates = useTemplates();
  const invalidate = useInvalidatePhotos();
  const policy = useVideoPolicy();
  const tr = useT();
  const { hasSession, pending: sessionPending } = useHasSession();
  // Photos work signed out; video does not, because the plan that governs clip length lives
  // on the workspace. A signed-out record press opens the register/login prompt.

  /**
   * The one-per-install Teamspace pitch. Armed only once the session answer has settled (the
   * first render of a signed-in launch reads as signed out), and disarmed whenever the screen
   * is busy being a camera: mid-recording, mid-save, or with a picker or the signature pad
   * already over the viewfinder. A sheet that lands on top of another sheet reads as a bug.
   */
  const nudge = useTeamspaceNudge(
    !hasSession && !sessionPending && !recording && !busy && !tagOpen && !projectOpen && !signOpen,
  );

  const template = templates.data?.find((t) => t.isDefault) ?? templates.data?.[0] ?? null;
  const project = projects.data?.find((p) => p.id === projectId) ?? null;

  const maxSeconds = policy.data?.maxSeconds ?? 30;
  const videoLocked = policy.data ? !policy.data.enabled : false;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Read the count once, then follow it. The queue also drains from the root layout the
  // moment someone signs in, and without the subscription the badge kept showing the
  // pre-sign-in count over an already empty queue.
  useEffect(() => {
    void readQueue().then((items) => setPending(items.length));
    return subscribeQueue((items) => setPending(items.length));
  }, []);

  // Restore the remembered evidence type. Validated against TAGS so a value left behind by an
  // older build can never poison state.
  useEffect(() => {
    void AsyncStorage.getItem(TAG_KEY).then((stored) => {
      if (!stored || !TAGS.some((entry) => entry.key === stored)) return;
      const next = stored as QueuedPhoto["tag"];
      setPhotoTag(next);
      setTag((current) => (current === "general" ? next : current));
    });
    void AsyncStorage.getItem(PROJECT_KEY).then((stored) => setSavedProject({ id: stored }));
    void AsyncStorage.getItem(STAMP_KEY).then((stored) => {
      if (stored !== null) setShowLocation(stored === "1");
    });
  }, []);

  // A stop handed over from the run screen is always a DELIVERY, and the recipient is known.
  const handedRecipient = typeof params.recipient === "string" ? params.recipient : "";
  // The office ticks REQUIRE SIGNATURE on the route; the run screen hands it over here.
  const handedSignature = params.requireSignature === "1";
  useEffect(() => {
    if (!stopId) return;
    setTag("delivery");
    setMode("photo");
    setRequireSignature(handedSignature);
    if (handedRecipient) setRecipient(handedRecipient);
  }, [stopId, handedRecipient, handedSignature]);

  // Restore the remembered project once the project list is in hand. If it was deleted, archived,
  // or this member's assignment was pulled, fall back to Unassigned rather than misfile evidence.
  useEffect(() => {
    if (projectApplied.current) return;
    const rows = projects.data;
    if (!savedProject || !rows) return;
    projectApplied.current = true;
    const saved = savedProject.id;
    if (saved && rows.some((p) => p.id === saved)) setProjectId(saved);
  }, [savedProject, projects.data]);

  // Live recording timer; the hard stop is enforced by the recorder itself too.
  useEffect(() => {
    if (!recording) return;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  /**
   * The fix has to be the one true at SHUTTER time, not the one that was true when this screen
   * opened. A single reading on mount is what made a whole day of driving stamp every photo with
   * the coordinate of wherever the app was first opened — the pins landed on top of each other
   * and every address but the first degraded to the city, because they were all reverse-geocoded
   * from the same stale point. So the position is watched for as long as the screen is up, and
   * the shutter reads `fixRef` rather than React state (state is a render behind).
   */
  const fixRef = useRef<Fix>(EMPTY_FIX);
  /** Where the current address string was resolved — the address is only re-read after moving. */
  const geocodedAt = useRef<{ lat: number; lng: number } | null>(null);
  const geocoding = useRef(false);

  const applyPosition = useCallback((position: Location.LocationObject) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const moved =
      geocodedAt.current === null ||
      metersBetween(geocodedAt.current.lat, geocodedAt.current.lng, lat, lng) >
        ADDRESS_REFRESH_M;
    const next: Fix = {
      lat,
      lng,
      accuracyM: position.coords.accuracy ?? null,
      altitudeM: position.coords.altitude ?? null,
      heading: position.coords.heading ?? null,
      // Keep showing the last address until a closer one arrives, but never carry one that
      // belongs to a place we have already left.
      address: moved ? null : fixRef.current.address,
    };
    fixRef.current = next;
    setFix(next);

    if (!moved || geocoding.current) return;
    geocoding.current = true;
    void (async () => {
      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (place) {
          const line = addressLineOf(place);
          geocodedAt.current = { lat, lng };
          // Only stamp it if the device is still near where this address was resolved.
          const now = fixRef.current;
          if (
            now.lat != null &&
            now.lng != null &&
            metersBetween(lat, lng, now.lat, now.lng) <= ADDRESS_REFRESH_M
          ) {
            fixRef.current = { ...now, address: line };
            setFix((prev) => ({ ...prev, address: line }));
          }
        }
      } catch {
        /* reverse geocode is best-effort — the coordinates are the evidence */
      } finally {
        geocoding.current = false;
      }
    })();
  }, []);

  const refreshFix = useCallback(async () => {
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        setLocDenied(true);
        return;
      }
      setLocDenied(false);
      geocodedAt.current = null;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      applyPosition(position);
    } catch {
      setLocDenied(true);
    }
  }, [applyPosition]);

  // Watch the position for as long as the capture screen is open, so the readout on the frame and
  // the fix sealed into the shot are the same live value.
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    void (async () => {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") {
          setLocDenied(true);
          return;
        }
        setLocDenied(false);
        const first = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        applyPosition(first);
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (position) => {
            if (!cancelled) applyPosition(position);
          },
        );
      } catch {
        if (!cancelled) setLocDenied(true);
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [applyPosition]);

  // Re-measure the device clock against the server whenever the capture screen opens.
  // Offline this is a no-op that keeps the last good offset.
  useEffect(() => {
    void ensureClockSync();
  }, []);

  useEffect(() => {
    if (isNative && permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [isNative, permission, requestPermission]);

  const commit = useCallback(
    async (
      uri: string,
      width: number | null,
      height: number | null,
      extra: {
        kind?: "photo" | "video" | "document";
        durationMs?: number | null;
        tag?: QueuedPhoto["tag"];
        pageCount?: number | null;
        posterUri?: string | null;
        fileName?: string | null;
      } = {},
    ) => {
      const capturedAt = Date.now();
      // Stamp the capture with the clock offset that was true at shutter time. Read
      // from storage, so it works with no signal — that is the whole point.
      const clockStamp = await clockStampForCapture();
      // Same rule for place as for time: the fix sealed in is the one live at shutter, read from
      // the ref the watcher keeps current rather than from state, which lags a render behind.
      const shotFix = fixRef.current;
      const finalTag = extra.tag ?? tag;
      const pod = finalTag === "pickup" || finalTag === "delivery";
      const item: QueuedPhoto = {
        id: `q_${capturedAt}_${Math.random().toString(36).slice(2, 8)}`,
        uri,
        capturedAt,
        clockOffsetMs: clockStamp.clockOffsetMs,
        clockSyncedAt: clockStamp.clockSyncedAt,
        projectId,
        projectName: project?.name ?? null,
        tag: finalTag,
        // Read from the ref, not state: a note typed and shot in the same beat would otherwise
        // be a render behind. Trimmed to null so an all-whitespace note is no note at all.
        note: noteRef.current.trim() || null,
        lat: shotFix.lat,
        lng: shotFix.lng,
        accuracyM: shotFix.accuracyM,
        altitudeM: shotFix.altitudeM,
        heading: shotFix.heading,
        address: shotFix.address,
        width,
        height,
        templateId: template?.id ?? null,
        recipient: pod && recipient.trim() ? recipient.trim() : null,
        signaturePath: pod ? signaturePath : null,
        signatureBox: pod ? signatureBox : null,
        kind: extra.kind ?? "photo",
        durationMs: extra.durationMs ?? null,
        pageCount: extra.pageCount ?? null,
        posterUri: extra.posterUri ?? null,
        fileName: extra.fileName ?? null,
        routeStopId: stopId,
        routeId: stopRouteId,
        routeOutcome: stopId ? stopOutcome : null,
        routeFailedReason:
          stopId && stopOutcome === "failed"
            ? ((params.reason as QueuedPhoto["routeFailedReason"]) ?? "other")
            : null,
        routeFailedNote:
          stopId && typeof params.note === "string" && params.note ? params.note : null,
      };
      const items = await enqueue(item);
      setPending(items.length);
      if (pod) {
        setRecipient("");
        signatureRef.current = null;
        setSignaturePath(null);
        setSignatureBox(null);
      }
      // A note describes the shot that was just taken, so it does not carry to the next one.
      noteRef.current = "";
      setNote("");
      setNoteDraft("");
      if ((extra.kind ?? "photo") === "photo") setLastShot(uri);
      // A PDF cannot be drawn into the viewfinder placeholder, so the first page stands in.
      if (extra.kind === "document" && extra.posterUri) setLastShot(extra.posterUri);
      // Signed out the camera still works, but there is no session to presign or seal an
      // upload with. The capture stays in the same offline queue a dead-zone photo uses and
      // drains by itself the moment an account exists — see hooks/use-drain-on-signin.ts.
      if (!hasSession) {
        setStatus(tr("capture.savedLocal"));
        setTimeout(() => setStatus(null), 4000);
        return;
      }
      setStatus(tr("capture.uploadingQueued"));
      const result = await drainQueue();
      const left = await readQueue();
      setPending(left.length);
      invalidate();
      setStatus(
        result.failed > 0
          ? `${tr("capture.queuedCount", { n: left.length })} — ${tr("queue.waiting")}`
          : tr("capture.syncedOk"),
      );
      // Hand the driver straight back to the route. The stop closes server-side when the
      // queue drains, so this works the same in a dead zone as it does on LTE.
      if (stopId && stopRouteId) {
        setStatus(tr("run.photoQueued"));
        router.replace(`/route/${stopRouteId}`);
      }
      setTimeout(() => setStatus(null), 4000);
    },
    [
      // `fix` is deliberately absent: the shutter reads `fixRef`, so rebuilding this on every
      // position update (twice a second while driving) would buy nothing.
      hasSession,
      invalidate,
      params.note,
      params.reason,
      project,
      projectId,
      recipient,
      router,
      signatureBox,
      signaturePath,
      stopId,
      stopOutcome,
      stopRouteId,
      tag,
      template,
      tr,
    ],
  );

  const isPod = tag === "pickup" || tag === "delivery";

  const shoot = async (forcedTag?: QueuedPhoto["tag"]) => {
    if (busy) return;
    // Proof of delivery is only enforced when the crew member asked for it on this drop.
    const nextTag = forcedTag ?? tag;
    if (
      (nextTag === "pickup" || nextTag === "delivery") &&
      requireSignature &&
      (!recipient.trim() || !signaturePath)
    ) {
      setPodError(true);
      setTagOpen(false);
      setStatus(tr("capture.needSign"));
      setTimeout(() => setStatus(null), 4000);
      return;
    }
    setPodError(false);
    setBusy(true);
    try {
      if (isNative && camera.current) {
        const shot = await camera.current.takePictureAsync({ quality: 0.75 });
        if (shot?.uri) {
          await commit(shot.uri, shot.width ?? null, shot.height ?? null, { tag: forcedTag });
        }
      } else {
        // Web preview has no camera pipeline — capture a sample frame so the flow stays testable.
        await commit("/images/samples/fiber-technician.jpg", 1600, 1067, { tag: forcedTag });
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : tr("capture.failed"));
    } finally {
      setBusy(false);
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    camera.current?.stopRecording();
  };

  const record = async () => {
    if (busy) return;
    /*
      Signed out, video records and queues exactly like a photo — no account gate.
      There is no plan to read without a session, so `maxSeconds` falls back to 30,
      which is the Free cap, and `videoLocked` computes false. The clip is sealed on
      sign-in; if that workspace's Free video window has already lapsed the server
      refuses it and drainQueue marks the item with the error rather than dropping it.
    */
    if (videoLocked) {
      setStatus(
        policy.data?.reason === "trial_expired"
          ? tr("capture.videoTrialEnded")
          : tr("capture.videoUnavailable"),
      );
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    if (!isNative) {
      setStatus(tr("capture.sampleClip"));
      setBusy(true);
      try {
        await commit("/media/sample-clip.mp4", 1280, 720, {
          kind: "video",
          durationMs: 8000,
        });
      } finally {
        setBusy(false);
      }
      return;
    }

    if (micPermission && !micPermission.granted) {
      const asked = await requestMicPermission();
      if (!asked.granted) {
        setStatus(tr("capture.micPermission"));
        setTimeout(() => setStatus(null), 4000);
        return;
      }
    }

    setBusy(true);
    setRecording(true);
    try {
      const started = Date.now();
      const clip = await camera.current?.recordAsync({ maxDuration: maxSeconds });
      const durationMs = Date.now() - started;
      if (clip?.uri) {
        await commit(clip.uri, null, null, { kind: "video", durationMs });
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : tr("capture.recordFailed"));
    } finally {
      setRecording(false);
      setBusy(false);
    }
  };

  /**
   * SCAN shutter. The OS scanner is tried first and, when this build has one, it owns the
   * whole capture: live edge tracking, auto-shutter, multi-page, its own crop. Its pages
   * come back already straightened, so they drop straight into the session.
   *
   * Returning null means there is no native scanner in this build (Expo Go, web preview).
   * Then the camera takes a plain frame and the review sheet does the straightening by
   * hand, so a scan is never unavailable — only more manual.
   */
  const scanShoot = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const native = await scanWithNativeScanner();
      if (native !== null) {
        // An empty array is a deliberate back-out, not a failure.
        if (native.length > 0) {
          setScanName((current) => current ?? scanFileName());
          setScanPages((prev) => [...prev, ...native.map((uri) => pageOf(uri))]);
        }
        return;
      }
      const shot =
        isNative && camera.current
          ? await camera.current.takePictureAsync({ quality: 0.9 })
          : // Web preview has no camera pipeline — a sample page keeps the flow testable.
            { uri: "/images/samples/fiber-technician.jpg", width: 1600, height: 1067 };
      if (!shot?.uri) return;
      setReviewIndex(null);
      setReviewPage(pageOf(shot.uri, shot.width ?? null, shot.height ?? null));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : tr("capture.failed"));
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setBusy(false);
    }
  };

  /** Keep the reviewed page: append when it is a fresh capture, replace when it is a re-edit. */
  const keepReviewedPage = (page: ScanPage) => {
    setScanPages((prev) => {
      if (reviewIndex === null) return [...prev, page];
      const next = prev.slice();
      next[reviewIndex] = page;
      return next;
    });
    setScanName((current) => current ?? scanFileName());
    setReviewPage(null);
    setReviewIndex(null);
  };

  const deleteReviewedPage = () => {
    if (reviewIndex !== null) setScanPages((prev) => prev.filter((_, i) => i !== reviewIndex));
    setReviewPage(null);
    setReviewIndex(null);
  };

  /**
   * One PDF per save. The document is composed on the device before anything is queued, so a
   * two-page work order filed in a dead zone is already the finished artefact and drains
   * through the same queue as every photo.
   */
  const saveScan = async () => {
    if (busy || scanPages.length === 0) return;
    const name = scanName ?? scanFileName();
    setBusy(true);
    setStatus(tr("scan.saving"));
    try {
      const built = await buildScanPdf(scanPages, name);
      await commit(built.uri, null, null, {
        kind: "document",
        pageCount: built.pageCount,
        // The first page stands in as the thumbnail — a PDF cannot be drawn as an image.
        posterUri: scanPages[0]?.uri ?? null,
        fileName: name,
      });
      setScanPages([]);
      setScanName(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : tr("scan.failed"));
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setBusy(false);
    }
  };

  const discardScan = () => {
    setScanPages([]);
    setScanName(null);
    setReviewPage(null);
    setReviewIndex(null);
  };

  const rememberTag = (next: QueuedPhoto["tag"]) => {
    setPhotoTag(next);
    void AsyncStorage.setItem(TAG_KEY, next);
  };

  const rememberStamp = (next: boolean) => {
    setShowLocation(next);
    void AsyncStorage.setItem(STAMP_KEY, next ? "1" : "0");
  };

  const rememberProject = (next: string | null) => {
    // A deliberate pick wins over anything still loading from storage.
    projectApplied.current = true;
    if (next === null) void AsyncStorage.removeItem(PROJECT_KEY);
    else void AsyncStorage.setItem(PROJECT_KEY, next);
  };

  const pickMode = (next: Mode) => {
    if (recording) return;
    setMode(next);
    // Clock in/out keeps its own override; photo and video come back to the remembered tag.
    if (next === "clock") setTag("arrival");
    else setTag(photoTag);
    /*
      Real edge detection lives in the OS scanner, which opens as its own full-screen
      activity and cannot be embedded in our preview. So picking SCAN opens it straight
      away: pointing the phone at a work order starts live tracking and auto-shutter with
      no second tap. Backing out of it lands on the preview behind, where the round button
      re-opens it — a back-out must not bounce the crew member straight back in, so this
      only fires on the tab press, never on the return.
    */
    if (next === "scan" && scanPages.length === 0 && hasNativeScanner()) void scanShoot();
  };

  const stampData = {
    at: now,
    lat: fix.lat,
    lng: fix.lng,
    accuracyM: fix.accuracyM,
    address: fix.address,
    project: project?.name ?? null,
    // What the NOTE tab holds, previewed in the same place the server burns it in.
    note: note.trim() || null,
    company: template?.companyLine ?? org.data?.org.name ?? null,
    // A template without its own logo falls back to the workspace's business logo, so the
    // one upload in settings is enough for the stamp to carry the brand.
    logoUrl: template?.showLogo ? (template.logoUrl ?? org.data?.org?.logoUrl ?? null) : null,
    verified: true,
  };

  const isVideo = mode === "video";
  const isScan = mode === "scan";
  // Long-locale headers do not fit a small phone: "NUMERISER" + "SYNCHRONISE" + the language
  // chip overflow a 5" screen and the mode title is the one that gets clipped. On narrow
  // screens the idle sync chip drops to its icon, which already says synced by shape and
  // colour. A pending count keeps its words — that one is actionable.
  const { width: screenW } = useWindowDimensions();
  const tightHeader = screenW < 380;
  const trialLeft = policy.data?.trialDaysLeft ?? 0;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <ProfileMenu showStamp={showLocation} onToggleStamp={rememberStamp} />
        <View style={styles.headerLeft}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}
          >
            {(isVideo
              ? tr("capture.recordTitle")
              : isScan
                ? tr("capture.mode.scan")
                : tr("capture.title")
            ).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View
            accessible
            accessibilityLabel={
              pending > 0
                ? tr("capture.queuedCount", { n: pending })
                : tr("capture.synced")
            }
            style={[styles.chip, { borderColor: pending > 0 ? colors.amber : colors.verified }]}
          >
            <Ionicons
              name={pending > 0 ? "cloud-upload-outline" : "shield-checkmark-outline"}
              size={13}
              color={pending > 0 ? colors.amber : colors.verified}
            />
            {tightHeader && pending === 0 ? null : (
              <Text
                numberOfLines={1}
                style={[
                  styles.chipText,
                  { color: pending > 0 ? colors.amber : colors.verified, fontFamily: Fonts?.mono },
                ]}
              >
                {pending > 0
                  ? tr("capture.queuedCount", { n: pending }).toUpperCase()
                  : tr("capture.synced").toUpperCase()}
              </Text>
            )}
          </View>
          <LanguageMenu />
        </View>
      </View>

      {stopId ? (
        <Pressable
          onPress={() => stopRouteId && router.replace(`/route/${stopRouteId}`)}
          accessibilityLabel={tr("run.stopBannerBack")}
          style={[styles.runBanner, { borderColor: colors.amber, backgroundColor: colors.card }]}
        >
          <Ionicons name="chevron-back" size={16} color={colors.amber} />
          <View style={styles.runBannerBody}>
            <Text numberOfLines={1} style={[styles.runBannerTitle, { color: colors.foreground }]}>
              {tr("run.deliveringTo")}: {params.stopLabel ?? ""}
            </Text>
            <Text style={[styles.runBannerMeta, { color: colors.amber, fontFamily: Fonts?.mono }]}>
              {tr("run.stopOf", {
                n: Number(params.stopSeq ?? 1),
                total: Number(params.stopTotal ?? 1),
              }).toUpperCase()}
              {stopOutcome === "failed" ? ` · ${tr("run.failedLabel").toUpperCase()}` : ""}
            </Text>
          </View>
        </Pressable>
      ) : null}

      <View
        style={[styles.viewfinder, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        {isNative && permission?.granted ? (
          <CameraView
            ref={camera}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            flash={flash ? "on" : "off"}
            enableTorch={flash && isVideo}
            zoom={ZOOM_STEPS[zoomStep].value}
            mode={isVideo ? "video" : "picture"}
          />
        ) : lastShot ? (
          <Image
            source={{ uri: lastShot }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.fallback]}>
            <Ionicons
              name={
                isScan ? "document-text-outline" : isVideo ? "videocam-outline" : "camera-outline"
              }
              size={38}
              color={colors.mutedForeground}
            />
            <Text style={[styles.fallbackText, { color: colors.mutedForeground }]}>
              {isNative
                ? tr("capture.camPermission")
                : isScan
                  ? tr("scan.guideHint")
                  : isVideo
                    ? tr("capture.hintRecording")
                    : tr("capture.hintCamera")}
            </Text>
            {isNative && !permission?.granted ? (
              <Pressable
                onPress={() => void requestPermission()}
                style={[styles.smallBtn, { backgroundColor: colors.amber }]}
              >
                <Text style={[styles.smallBtnText, { color: colors.background }]}>
                  {tr("capture.enableCamera")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {/* SCAN framing guide. Deliberately dumb: the native scanner draws its own live edge
            box once it opens, and faking a second tracking box in JS over the preview would
            only disagree with the real one. Nothing is being detected while this is on screen,
            so the pill promises readiness, not progress — it says where to hold the page and
            that the round button will open the real scanner. */}
        {isScan ? (
          <View style={[StyleSheet.absoluteFillObject, styles.scanGuide]} pointerEvents="none">
            <View style={[styles.scanFrame, { borderColor: colors.amber }]} />
            <View style={[styles.scanGuidePill, { borderColor: colors.amber }]}>
              <Ionicons name="scan-outline" size={13} color={colors.amber} />
              <Text
                style={[styles.scanGuideText, { color: colors.amber, fontFamily: Fonts?.mono }]}
              >
                {tr("scan.guide").toUpperCase()}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.camControls} pointerEvents="box-none">
          <Pressable
            onPress={() => setFlash((v) => !v)}
            accessibilityLabel={tr("capture.flash")}
            style={[
              styles.camBtn,
              { borderColor: flash ? colors.amber : "rgba(255,255,255,0.35)" },
            ]}
          >
            <Ionicons
              name={flash ? "flash" : "flash-off"}
              size={17}
              color={flash ? colors.amber : "#FFFFFF"}
            />
          </Pressable>
          <Pressable
            onPress={() => setFacing((v) => (v === "back" ? "front" : "back"))}
            accessibilityLabel={tr("capture.flipCamera")}
            style={[styles.camBtn, { borderColor: "rgba(255,255,255,0.35)" }]}
          >
            <Ionicons name="camera-reverse-outline" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <Pressable
          onPress={() => setZoomStep((v) => (v + 1) % ZOOM_STEPS.length)}
          accessibilityLabel={tr("capture.zoom")}
          style={[
            styles.zoomPill,
            { borderColor: zoomStep > 0 ? colors.amber : "rgba(255,255,255,0.35)" },
          ]}
        >
          <Text
            style={[
              styles.zoomText,
              { color: zoomStep > 0 ? colors.amber : "#FFFFFF", fontFamily: Fonts?.mono },
            ]}
          >
            {ZOOM_STEPS[zoomStep].label}
          </Text>
        </Pressable>

        {/* Stamp preview is opt-in via the STAMP button — the saved file is stamped either way. */}
        {showLocation ? (
          <View style={styles.stampOverlay} pointerEvents="none">
            <Stamp data={stampData} compact />
          </View>
        ) : null}

        {recording ? (
          <View style={[styles.recBadge, { borderColor: colors.alert }]}>
            <View style={[styles.recDot, { backgroundColor: colors.alert }]} />
            <Text style={[styles.recText, { color: colors.alert, fontFamily: Fonts?.mono }]}>
              REC {clock(elapsed)} / {clock(maxSeconds)}
            </Text>
          </View>
        ) : null}

        {/* NOTE rides in the corner of the viewfinder, not beside the shutter: it annotates
            what is in frame, and a filled pencil shows at a glance that the next shot already
            carries a note. The stamp preview is inset to its left so the two never collide. */}
        <Pressable
          onPress={() => {
            // The sheet always opens on what is committed, so re-opening it after a cancel
            // shows the note that is actually going to be burned in.
            setNoteDraft(note);
            setNoteOpen((v) => !v);
          }}
          onHoverIn={() => setNoteHover(true)}
          onHoverOut={() => setNoteHover(false)}
          accessibilityLabel={tr("capture.note")}
          style={({ pressed }) => [
            styles.noteFab,
            {
              borderColor: colors.amber,
              backgroundColor:
                pressed || noteHover || noteOpen || note.trim()
                  ? colors.amber
                  : "rgba(0,0,0,0.45)",
            },
          ]}
        >
          {({ pressed }) => (
            <Ionicons
              name={note.trim() ? "create" : "create-outline"}
              size={19}
              color={
                pressed || noteHover || noteOpen || note.trim()
                  ? colors.primaryForeground
                  : colors.amber
              }
            />
          )}
        </Pressable>
      </View>

      <View style={styles.shutterRow}>
        <View style={styles.shutterControls}>
          {/* PROJECT and EVIDENCE flank the shutter: they decide where the next shot is filed,
              so they sit within a thumb's reach of the button that takes it. Icon only — the
              sheet each one opens carries the words. */}
          <Pressable
            onPress={() => setProjectOpen((v) => !v)}
            onHoverIn={() => setProjectHover(true)}
            onHoverOut={() => setProjectHover(false)}
            accessibilityLabel={tr("common.project")}
            style={({ pressed }) => [
              styles.shutterSideBtn,
              {
                borderColor: colors.amber,
                backgroundColor:
                  pressed || projectHover || projectOpen ? colors.amber : "rgba(255,176,33,0.12)",
              },
            ]}
          >
            {({ pressed }) => (
              <Ionicons
                // A filled folder says a project is assigned to the next shot; the outline says
                // it is still headed for the unassigned pile.
                name={projectId ? "folder" : "folder-outline"}
                size={20}
                color={
                  pressed || projectHover || projectOpen ? colors.primaryForeground : colors.amber
                }
              />
            )}
          </Pressable>

          <Pressable
            onPress={() =>
              isScan
                ? void scanShoot()
                : isVideo
                  ? recording
                    ? stopRecording()
                    : void record()
                  : void shoot()
            }
            disabled={busy && !recording}
            style={[
              styles.shutter,
              {
                borderColor: isVideo ? colors.alert : colors.amber,
                opacity: busy && !recording ? 0.6 : 1,
              },
            ]}
            accessibilityLabel={
              isScan
                ? tr("scan.addPage")
                : isVideo
                  ? recording
                    ? tr("capture.stopRecording")
                    : tr("capture.startRecording")
                  : tr("capture.takePhoto")
            }
          >
            {busy && !recording ? (
              <ActivityIndicator color={colors.background} />
            ) : recording ? (
              <View style={[styles.stopCore, { backgroundColor: colors.alert }]} />
            ) : isScan ? (
              // The scan shutter opens a scanner rather than freezing a frame, so it carries a
              // document mark instead of the plain photo disc.
              <View
                style={[
                  styles.shutterCore,
                  styles.shutterIconCore,
                  { backgroundColor: colors.amber },
                ]}
              >
                <Ionicons name="document-text" size={22} color={colors.background} />
              </View>
            ) : (
              <View
                style={[
                  styles.shutterCore,
                  { backgroundColor: isVideo ? colors.alert : colors.amber },
                ]}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => setTagOpen((v) => !v)}
            onHoverIn={() => setTagHover(true)}
            onHoverOut={() => setTagHover(false)}
            accessibilityLabel={tr("capture.evidenceType")}
            style={({ pressed }) => [
              styles.shutterSideBtn,
              {
                borderColor: colors.amber,
                backgroundColor:
                  pressed || tagHover || tagOpen ? colors.amber : "rgba(255,176,33,0.12)",
              },
            ]}
          >
            {({ pressed }) => (
              <Ionicons
                // The evidence button wears the mark of the tag that is selected, so the row
                // still answers "what am I filing this as?" without a label.
                name={TAGS.find((t) => t.key === tag)?.icon ?? "pricetag-outline"}
                size={20}
                color={pressed || tagHover || tagOpen ? colors.primaryForeground : colors.amber}
              />
            )}
          </Pressable>
        </View>
        {status ? (
          <Text style={[styles.status, { color: colors.verified, fontFamily: Fonts?.mono }]}>
            {status}
          </Text>
        ) : null}
      </View>

      {/* Capture mode tabs — equal width, side by side */}
      <View style={[styles.modeTabs, { borderColor: colors.border }]}>
        {MODES.map((m) => {
          const active = m.key === mode;
          return (
            <Pressable
              key={m.key}
              onPress={() => pickMode(m.key)}
              accessibilityLabel={tr(m.label)}
              style={[
                styles.modeTab,
                {
                  borderBottomColor: active ? colors.amber : "transparent",
                  backgroundColor: active ? "rgba(255,176,33,0.10)" : "transparent",
                },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[
                  styles.modeText,
                  {
                    color: active ? colors.amber : colors.mutedForeground,
                    // Sora bold rather than the mono face: these are the three words that say
                    // what the shutter is about to do, so they carry the same weight as the
                    // REQUIRE SIGNATURE tab instead of reading as small print.
                    fontFamily: Fonts?.display,
                  },
                ]}
              >
                {tr(m.label).toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.controls}
        contentContainerStyle={styles.controlsInner}
        showsVerticalScrollIndicator={false}
      >
        {/* The scan session. Pages live here until SAVE PDF files them as one document, so a
            multi-page work order is one piece of evidence rather than four loose photos. */}
        {isScan ? (
          <View style={[styles.scanPanel, { borderColor: colors.border }]}>
            <View style={styles.scanPanelHead}>
              <Ionicons name="documents-outline" size={14} color={colors.amber} />
              <Text
                numberOfLines={1}
                style={[styles.scanPanelTitle, { color: colors.amber, fontFamily: Fonts?.mono }]}
              >
                {(scanName ?? tr("scan.sessionTitle")).toUpperCase()}
              </Text>
              {scanPages.length > 0 ? (
                <Text style={[styles.scanPanelCount, { color: colors.mutedForeground }]}>
                  {scanPages.length === 1
                    ? tr("scan.onePage")
                    : tr("scan.pages", { count: scanPages.length })}
                </Text>
              ) : null}
            </View>

            {scanPages.length === 0 ? (
              <Text style={[styles.scanEmpty, { color: colors.mutedForeground }]}>
                {tr("scan.emptySession")}
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scanStrip}
              >
                {scanPages.map((p, index) => (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setReviewIndex(index);
                      setReviewPage(p);
                    }}
                    accessibilityLabel={tr("scan.pageLabel", {
                      index: index + 1,
                      total: scanPages.length,
                    })}
                    style={[styles.scanThumb, { borderColor: colors.border }]}
                  >
                    <Image
                      source={{ uri: p.uri }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                    <View style={styles.scanThumbBadge}>
                      <Text
                        style={[
                          styles.scanThumbBadgeText,
                          { color: colors.background, fontFamily: Fonts?.mono },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <View style={styles.scanActions}>
              <Pressable
                onPress={() => void saveScan()}
                disabled={busy || scanPages.length === 0}
                accessibilityLabel={tr("scan.savePdf")}
                style={[
                  styles.scanSave,
                  {
                    backgroundColor: colors.amber,
                    opacity: busy || scanPages.length === 0 ? 0.45 : 1,
                  },
                ]}
              >
                <Ionicons name="cloud-upload-outline" size={15} color={colors.background} />
                <Text numberOfLines={1} style={[styles.scanSaveText, { color: colors.background }]}>
                  {tr("scan.savePdf").toUpperCase()}
                </Text>
              </Pressable>
              {scanPages.length > 0 ? (
                <Pressable
                  onPress={discardScan}
                  disabled={busy}
                  accessibilityLabel={tr("scan.discard")}
                  style={[styles.scanDiscard, { borderColor: colors.alert }]}
                >
                  <Ionicons name="trash-outline" size={15} color={colors.alert} />
                  <Text numberOfLines={1} style={[styles.scanDiscardText, { color: colors.alert }]}>
                    {tr("scan.discard").toUpperCase()}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {isVideo ? (
          <View
            style={[styles.videoNote, { borderColor: videoLocked ? colors.alert : colors.border }]}
          >
            <Ionicons
              name={videoLocked ? "lock-closed-outline" : "videocam-outline"}
              size={14}
              color={videoLocked ? colors.alert : colors.amber}
            />
            <Text style={[styles.videoNoteText, { color: colors.foreground }]}>
              {videoLocked
                ? tr("capture.videoLocked")
                : `${tr("capture.videoCap", {
                    plan: policy.data?.planName ?? "Plan",
                    cap: clock(maxSeconds),
                  })}${trialLeft > 0 ? ` ${tr("capture.videoTrial", { days: String(trialLeft) })}` : ""} ${
                    policy.data?.burnsStamp ? tr("capture.burned") : tr("capture.overlay")
                  }`}
            </Text>
          </View>
        ) : null}

        {mode === "clock" ? (
          <View style={styles.clockRow}>
            <Pressable
              onPress={() => void shoot("arrival")}
              style={[styles.clockBtn, { borderColor: colors.verified }]}
            >
              <Ionicons name="enter-outline" size={16} color={colors.verified} />
              <Text style={[styles.clockBtnText, { color: colors.verified }]}>
                {tr("capture.clockIn")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void shoot("departure")}
              style={[styles.clockBtn, { borderColor: colors.amber }]}
            >
              <Ionicons name="exit-outline" size={16} color={colors.amber} />
              <Text style={[styles.clockBtnText, { color: colors.amber }]}>
                {tr("capture.clockOut")}
              </Text>
            </Pressable>
          </View>
        ) : null}
        {/*
          The two lists used to render inline under the selector bar, which grew the panel and
          pushed the viewfinder and the shutter up the screen - with a long project list the
          shutter went off-screen entirely. They are half-screen bottom sheets now, so the camera
          never moves, a long list scrolls inside the sheet, and picking an option closes it.
        */}
        <Modal
          visible={projectOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setProjectOpen(false)}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setProjectOpen(false)} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <View style={[styles.sheetHead, { borderColor: colors.border }]}>
              <Text
                style={[styles.sheetTitle, { color: colors.foreground, fontFamily: Fonts?.mono }]}
              >
                {tr("common.project").toUpperCase()}
              </Text>
              <Pressable
                onPress={() => setProjectOpen(false)}
                accessibilityLabel={tr("common.close")}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.sheetBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.tagGrid}>
                <Pressable
                  onPress={() => {
                    setProjectId(null);
                    rememberProject(null);
                    setProjectOpen(false);
                  }}
                  style={[
                    styles.pill,
                    {
                      borderColor: projectId === null ? colors.amber : colors.border,
                      backgroundColor: projectId === null ? "rgba(255,176,33,0.12)" : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: projectId === null ? colors.amber : colors.mutedForeground },
                    ]}
                  >
                    {tr("queue.unassigned")}
                  </Text>
                </Pressable>
                {projects.data?.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setProjectId(p.id);
                      rememberProject(p.id);
                      setProjectOpen(false);
                    }}
                    style={[
                      styles.pill,
                      {
                        borderColor: projectId === p.id ? colors.amber : colors.border,
                        backgroundColor: projectId === p.id ? "rgba(255,176,33,0.12)" : colors.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: projectId === p.id ? colors.amber : colors.foreground },
                      ]}
                    >
                      {p.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/*
          The two lists used to render inline under the selector bar, which grew the panel and
          pushed the viewfinder and the shutter up the screen - with a long project list the
          shutter went off-screen entirely. They are half-screen bottom sheets now, so the camera
          never moves, a long list scrolls inside the sheet, and picking an option closes it.
        */}
        <Modal
          visible={tagOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setTagOpen(false)}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setTagOpen(false)} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <View style={[styles.sheetHead, { borderColor: colors.border }]}>
              <Text
                style={[styles.sheetTitle, { color: colors.foreground, fontFamily: Fonts?.mono }]}
              >
                {tr("capture.evidenceType").toUpperCase()}
              </Text>
              <Pressable
                onPress={() => setTagOpen(false)}
                accessibilityLabel={tr("common.close")}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.sheetBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.tagGrid}>
                {TAGS.map((entry) => {
                  const active = tag === entry.key;
                  return (
                    <Pressable
                      key={entry.key}
                      onPress={() => {
                        setTag(entry.key);
                        if (mode !== "clock") rememberTag(entry.key);
                        setTagOpen(false);
                      }}
                      style={[
                        styles.tag,
                        {
                          borderColor: active ? colors.amber : colors.border,
                          backgroundColor: active ? "rgba(255,176,33,0.12)" : colors.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name={entry.icon}
                        size={14}
                        color={active ? colors.amber : colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.tagText,
                          { color: active ? colors.amber : colors.foreground },
                        ]}
                      >
                        {tr(entry.label)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/*
          The note sheet. Same bottom sheet as the two lists above it, with a text field instead
          of a pill grid. 1000 characters is the server's cap on photos.note, so the field stops
          where the API would have rejected it.
        */}
        <Modal
          visible={noteOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setNoteOpen(false)}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setNoteOpen(false)} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <View style={[styles.sheetHead, { borderColor: colors.border }]}>
              <Text
                style={[styles.sheetTitle, { color: colors.foreground, fontFamily: Fonts?.mono }]}
              >
                {tr("capture.note").toUpperCase()}
              </Text>
              <Pressable
                onPress={() => setNoteOpen(false)}
                accessibilityLabel={tr("common.close")}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.sheetBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                value={noteDraft}
                onChangeText={(v) => setNoteDraft(v.slice(0, 1000))}
                placeholder={tr("capture.notePlaceholder")}
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel={tr("capture.note")}
                multiline
                autoFocus
                style={[
                  styles.noteInput,
                  {
                    borderColor: colors.border,
                    color: colors.foreground,
                    backgroundColor: colors.card,
                  },
                ]}
              />
              <View style={styles.noteActions}>
                <Text
                  style={[
                    styles.noteCount,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {noteDraft.trim().length}/1000
                </Text>
                <Pressable
                  onPress={() => setNoteDraft("")}
                  accessibilityLabel={tr("capture.clearSign")}
                  style={[styles.noteBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.noteBtnText, { color: colors.mutedForeground }]}>
                    {tr("capture.clearSign")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const next = noteDraft.trim();
                    noteRef.current = next;
                    setNote(next);
                    setNoteDraft(next);
                    setNoteOpen(false);
                  }}
                  accessibilityLabel={tr("capture.noteSave")}
                  style={({ pressed }) => [
                    styles.noteBtn,
                    {
                      borderColor: pressed ? colors.amberDeep : colors.amber,
                      backgroundColor: pressed ? colors.amberDeep : colors.amber,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.noteBtnText,
                      { color: colors.primaryForeground, fontFamily: Fonts?.display },
                    ]}
                  >
                    {tr("capture.noteSave")}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {isPod ? (
          <View style={styles.pod}>
            <Text
              style={[
                styles.label,
                { color: colors.mutedForeground, fontFamily: Fonts?.mono, marginTop: 0 },
              ]}
            >
              {tr("capture.recipient").toUpperCase()}
            </Text>
            <TextInput
              value={recipient}
              onChangeText={(v) => {
                setRecipient(v);
                setPodError(false);
              }}
              placeholder={tr("capture.recipient")}
              placeholderTextColor={colors.mutedForeground}
              accessibilityLabel={tr("capture.recipient")}
              style={[
                styles.podInput,
                {
                  borderColor: podError && !recipient.trim() ? colors.alert : colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.card,
                },
              ]}
            />

            <Pressable
              onPress={() => {
                // No tick box to find: pressing the tab is the request for a signature, and the
                // pad opens on the spot. It stays required only if something is actually signed,
                // which the pad reports back through onChange.
                setRequireSignature(true);
                setSignOpen(true);
              }}
              onHoverIn={() => setSignHover(true)}
              onHoverOut={() => setSignHover(false)}
              accessibilityRole="button"
              accessibilityLabel={tr("capture.requireSignature")}
              // The same solid amber tab as the project and evidence-type selectors above, and it
              // stays amber whatever the state — it is the control that opens the pad, so it reads
              // as an action. It only deepens under a pointer or a finger.
              style={({ pressed }) => [
                styles.podToggle,
                {
                  borderColor: pressed || signHover ? colors.amberDeep : colors.amber,
                  backgroundColor: pressed || signHover ? colors.amberDeep : colors.amber,
                },
              ]}
            >
              <Text style={[styles.podToggleText, { color: colors.primaryForeground }]}>
                {tr("capture.requireSignature")}
              </Text>
            </Pressable>

            {/* The pad only exists once a signature is actually being collected. It used to sit
                there open on every delivery, so every crew member scrolled past an empty box they
                had no intention of using. Closing the pad with nothing drawn puts it away again. */}
            {requireSignature ? (
              <SignaturePad
                value={signaturePath}
                valueBox={signatureBox}
                open={signOpen}
                setOpen={(open) => {
                  setSignOpen(open);
                  if (!open && !signatureRef.current) setRequireSignature(false);
                }}
                onChange={(path, box) => {
                  signatureRef.current = path;
                  setSignaturePath(path);
                  setSignatureBox(box);
                  setPodError(false);
                  // Cleared and saved means they changed their mind: drop the requirement so the
                  // capture is not held back waiting on a signature nobody is collecting.
                  if (!path) setRequireSignature(false);
                }}
              />
            ) : null}

            {podError ? (
              <Text style={[styles.podError, { color: colors.alert }]}>
                {tr("capture.needSign")}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* The fix that is about to be sealed into the shot. It is a readout, not a control, so
            it is a quiet line rather than a boxed row competing with the tabs above it — except
            when location is off, where it is the only warning that the proof will carry no
            coordinates and it keeps the amber. */}
        <View style={styles.gpsRow}>
          <Ionicons
            name={fix.lat != null ? "location" : "location-outline"}
            size={12}
            color={fix.lat != null ? colors.verified : colors.amber}
          />
          <Text
            style={[
              styles.gps,
              {
                color: locDenied ? colors.amber : colors.mutedForeground,
                fontFamily: Fonts?.mono,
              },
            ]}
          >
            {locDenied ? tr("capture.locationOff") : formatCoords(fix.lat, fix.lng)}
          </Text>
          <Pressable
            onPress={() => void refreshFix()}
            hitSlop={12}
            accessibilityLabel={tr("capture.refreshFix")}
          >
            <Ionicons name="refresh" size={13} color={colors.mutedForeground} />
          </Pressable>
        </View>

      </ScrollView>
      <ScanReview
        page={reviewPage}
        pageLabel={
          reviewPage
            ? tr("scan.pageLabel", {
                index: reviewIndex === null ? scanPages.length + 1 : reviewIndex + 1,
                total: reviewIndex === null ? scanPages.length + 1 : scanPages.length,
              })
            : null
        }
        onCancel={() => {
          setReviewPage(null);
          setReviewIndex(null);
        }}
        onSave={keepReviewedPage}
        onDelete={deleteReviewedPage}
      />
      <TeamspaceSheet visible={nudge.visible} onClose={nudge.dismiss} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  runBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
  runBannerBody: { flex: 1, gap: 2, minWidth: 0 },
  runBannerTitle: { fontSize: 13, fontWeight: "700" },
  runBannerMeta: { fontSize: 10, letterSpacing: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: { flexShrink: 1, minWidth: 0, marginRight: 8 },
  title: { fontSize: 15, letterSpacing: 0.8 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: { fontSize: 10, letterSpacing: 0.2, flexShrink: 1, minWidth: 0 },
  viewfinder: {
    flex: 1,
    minHeight: 300,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  camControls: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  camBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  zoomPill: {
    position: "absolute",
    right: 12,
    top: "45%",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  zoomText: { fontSize: 11, letterSpacing: 0.8 },
  fallback: { alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  fallbackText: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  smallBtn: { paddingHorizontal: 14, paddingVertical: 8, marginTop: 4, borderRadius: 8 },
  smallBtnText: { fontSize: 12, fontWeight: "700" },
  // Right inset clears the NOTE button in the corner, so a long stamp line never runs
  // underneath it.
  stampOverlay: { position: "absolute", left: 10, right: 62, bottom: 10 },
  noteFab: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  recBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
  },
  recDot: { width: 8, height: 8, borderRadius: 4 },
  recText: { fontSize: 10, letterSpacing: 1 },
  controls: { flexGrow: 0, flexShrink: 1, marginTop: 2 },
  controlsInner: { paddingHorizontal: 16, paddingBottom: 28, gap: 8 },
  label: { fontSize: 10, letterSpacing: 2, marginTop: 6 },
  row: { gap: 8, paddingVertical: 2 },
  pill: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  pillText: { fontSize: 12 },
  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // Fixed half of the screen, not "up to half": the list has to start above the shutter
    // button, so the sheet must always be that tall even when few options are configured.
    height: "50%",
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 12, letterSpacing: 1 },
  sheetBody: { padding: 14, paddingBottom: 26 },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 110,
    textAlignVertical: "top",
  },
  noteActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  noteCount: { fontSize: 10, letterSpacing: 0.5, marginRight: "auto" },
  noteBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  noteBtnText: { fontSize: 12, letterSpacing: 0.5 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  tagText: { fontSize: 12 },
  pod: { marginTop: 14 },
  podInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    marginTop: 6,
  },
  podToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  podToggleText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textAlign: "center" },
  podError: { fontSize: 11.5, marginTop: 8, lineHeight: 16 },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 2,
    marginTop: 10,
  },
  gps: { fontSize: 10.5, flex: 1 },
  status: { fontSize: 11, marginTop: 6, textAlign: "center", paddingHorizontal: 16 },
  shutterRow: { alignItems: "center", marginTop: 12 },
  // PROJECT left, shutter centre, EVIDENCE right. The gap is wide enough that a thumb aiming
  // for the shutter cannot catch a selector by accident.
  shutterControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 26,
  },
  shutterSideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  shutter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterCore: { width: 44, height: 44, borderRadius: 22 },
  shutterIconCore: { alignItems: "center", justifyContent: "center" },
  scanGuide: { alignItems: "center", justifyContent: "center", padding: 22 },
  scanFrame: {
    flex: 1,
    alignSelf: "stretch",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 10,
    opacity: 0.75,
  },
  scanGuidePill: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  scanGuideText: { fontSize: 10, letterSpacing: 1 },
  scanPanel: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  scanPanelHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  scanPanelTitle: { flex: 1, fontSize: 10, letterSpacing: 1, minWidth: 0 },
  scanPanelCount: { fontSize: 11 },
  scanEmpty: { fontSize: 12, lineHeight: 18 },
  scanStrip: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  scanThumb: {
    width: 58,
    height: 78,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  scanThumbBadge: {
    position: "absolute",
    top: 3,
    left: 3,
    minWidth: 16,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(255,176,33,0.92)",
  },
  scanThumbBadgeText: { fontSize: 9 },
  scanActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  scanSave: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  scanSaveText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  scanDiscard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  scanDiscardText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  stopCore: { width: 26, height: 26, borderRadius: 3 },
  modeTabs: {
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  modeTab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 3,
    borderBottomWidth: 2,
  },
  modeText: { fontSize: 10, letterSpacing: 0.2, textAlign: "center" },
  videoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 4,
    borderRadius: 8,
  },
  videoNoteText: { fontSize: 11, lineHeight: 17, flex: 1 },
  clockRow: { gap: 8, marginTop: 6 },
  clockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 8,
  },
  clockBtnText: { fontSize: 13, fontWeight: "600" },
});
