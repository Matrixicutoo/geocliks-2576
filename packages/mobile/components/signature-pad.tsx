import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { useT } from "@/lib/i18n";

/**
 * Hard ceiling on the stored path string.
 *
 * The drawn signature travels to the server as SVG path data, not as an uploaded image — one less
 * upload to fail in a basement or a dead zone, and the website can redraw it as vector at any size.
 * The API caps the column at 20k characters, so stop recording points a little short of that
 * instead of letting a long scrawl get rejected at upload time.
 */
const MAX_PATH_CHARS = 19000;

/** One decimal is plenty at finger resolution and roughly halves the stored string. */
const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A touch that reports a non-finite coordinate would produce path data like `MNaN NaN`, and that
 * string goes straight to react-native-svg's native Android path parser. A parse failure there is
 * an uncaught native exception that kills the whole process rather than showing a JS error, so
 * every coordinate is checked before it is ever written into the path.
 */
const usable = (x: number, y: number) => Number.isFinite(x) && Number.isFinite(y);

/** Strokes carry their own id so React keys never collide — path data is not unique. */
type Stroke = { id: string; d: string };

/** A lone `M` with no line segment draws nothing and is a degenerate path; never render or store it. */
const drawable = (s: Stroke) => s.d.includes("L");

/**
 * Split stored path data back into strokes so re-opening the sheet shows what was already signed
 * instead of a blank pad. Every stroke the pad emits starts with `M`, so splitting on it is exact.
 */
const parse = (value: string | null): Stroke[] =>
  !value
    ? []
    : value
        .split("M")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part, i) => ({ id: `p${i}`, d: `M${part}` }))
        .filter(drawable);

/** Breathing room left around the ink when the signature is cropped to its bounding box. */
const TRIM_PAD = 6;

/**
 * Crop the drawn strokes to a tight box around the ink.
 *
 * The pad is nearly full-screen and therefore very tall, but a signature is a wide, short shape.
 * Storing the pad's own dimensions means the inline preview (and the PDF export, which derives the
 * drawn height from this box) scales the ink down to fit a 358x713 frame — the signature survives
 * but shrinks to an illegible squiggle. Re-basing the points on their own bounding box makes the
 * stored signature the shape of the writing, independent of the pad it was drawn on.
 *
 * The emitted format is unchanged: plain `M`/`L` polyline data, which the exports depend on.
 */
const normalize = (strokes: Stroke[]): { path: string; box: string } | null => {
  const points: { x: number; y: number }[][] = [];
  for (const s of strokes) {
    const pts: { x: number; y: number }[] = [];
    for (const m of s.d.matchAll(/[ML]\s*(-?[\d.]+)\s+(-?[\d.]+)/g)) {
      const x = Number(m[1]);
      const y = Number(m[2]);
      if (usable(x, y)) pts.push({ x, y });
    }
    if (pts.length > 1) points.push(pts);
  }
  if (points.length === 0) return null;

  const flat = points.flat();
  const xs = flat.map((p) => p.x);
  const ys = flat.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  // A perfectly straight stroke collapses one axis; keep at least a pixel so the box is never zero.
  const w = Math.max(Math.max(...xs) - minX, 1);
  const h = Math.max(Math.max(...ys) - minY, 1);

  const path = points
    .map(
      (pts) =>
        `M${pts
          .map(
            (p) => `${round(p.x - minX + TRIM_PAD)} ${round(p.y - minY + TRIM_PAD)}`,
          )
          .join(" L")}`,
    )
    .join(" ")
    .trim();

  return { path, box: `0 0 ${Math.round(w + TRIM_PAD * 2)} ${Math.round(h + TRIM_PAD * 2)}` };
};

type Props = {
  /** Path data currently held by the parent — cleared externally after a capture commits. */
  value: string | null;
  /** viewBox the stored path was drawn in, needed to redraw the inline preview to scale. */
  valueBox: string | null;
  /** Emits SVG path data plus the viewBox it was drawn in, or (null, null) when cleared. */
  onChange: (path: string | null, box: string | null) => void;
  /** Whether the full-screen signing sheet is open. Owned by the parent so ticking the */
  /** REQUIRE SIGNATURE box can open it directly. */
  open: boolean;
  setOpen: (open: boolean) => void;
};

/**
 * Proof-of-delivery signature capture.
 *
 * The capture screen only carries a small preview — signing happens in a full-screen sheet, because
 * a strip of a phone screen is not enough room for a stranger to sign on, and the sheet gives the
 * Done button somewhere to live.
 */
export function SignaturePad({ value, valueBox, onChange, open, setOpen }: Props) {
  const colors = useColors();
  const tr = useT();

  const preview = useMemo(() => parse(value), [value]);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {tr("capture.signHere")}
        </Text>
      </View>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel={tr("capture.signHere")}
        style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        {preview.length > 0 && valueBox ? (
          <Svg pointerEvents="none" width="100%" height="100%" viewBox={valueBox}>
            {preview.map((s) => (
              <Path
                key={s.id}
                d={s.d}
                stroke={colors.foreground}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </Svg>
        ) : (
          <View pointerEvents="none" style={styles.previewEmpty}>
            <Ionicons name="create-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.previewText, { color: colors.mutedForeground }]}>
              {tr("capture.signHere")}
            </Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        {open ? (
          <SignatureSheet
            initial={value}
            onCancel={() => setOpen(false)}
            onDone={(path, box) => {
              onChange(path, box);
              setOpen(false);
            }}
          />
        ) : null}
      </Modal>
    </View>
  );
}

type SheetProps = {
  initial: string | null;
  onCancel: () => void;
  onDone: (path: string | null, box: string | null) => void;
};

/**
 * The full-screen pad. It mounts fresh every time the sheet opens, so the drawing state starts from
 * `initial` once and is never reconciled against the parent mid-stroke — an earlier version drove
 * rendering off the parent's value, which meant nothing drew while the value was still null.
 */
function SignatureSheet({ initial, onCancel, onDone }: SheetProps) {
  const colors = useColors();
  const tr = useT();
  const insets = useSafeAreaInsets();

  const seed = useMemo(() => parse(initial), [initial]);
  const strokesRef = useRef<Stroke[]>(seed);
  const currentRef = useRef<Stroke | null>(null);
  const seqRef = useRef(seed.length);

  const [paths, setPaths] = useState<Stroke[]>(seed);
  const [box, setBox] = useState<string | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // A zero-sized viewBox makes the native renderer scale by 1/0, so wait for a real measurement.
    if (!usable(width, height) || width <= 0 || height <= 0) return;
    const next = `0 0 ${Math.round(width)} ${Math.round(height)}`;
    setBox(next);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          if (!usable(locationX, locationY)) return;
          seqRef.current += 1;
          const started: Stroke = {
            id: `s${seqRef.current}`,
            d: `M${round(locationX)} ${round(locationY)}`,
          };
          currentRef.current = started;
          setPaths([...strokesRef.current, started]);
        },
        onPanResponderMove: (e) => {
          const current = currentRef.current;
          if (!current) return;
          const stored = strokesRef.current.reduce((n, s) => n + s.d.length, 0);
          if (stored + current.d.length > MAX_PATH_CHARS) return;
          const { locationX, locationY } = e.nativeEvent;
          if (!usable(locationX, locationY)) return;
          const next: Stroke = {
            id: current.id,
            d: `${current.d} L${round(locationX)} ${round(locationY)}`,
          };
          currentRef.current = next;
          setPaths([...strokesRef.current, next]);
        },
        onPanResponderRelease: () => {
          const current = currentRef.current;
          if (current && drawable(current)) {
            strokesRef.current = [...strokesRef.current, current];
          }
          currentRef.current = null;
          setPaths(strokesRef.current);
        },
      }),
    [],
  );

  const clear = () => {
    strokesRef.current = [];
    currentRef.current = null;
    setPaths([]);
  };

  const commit = () => {
    const trimmed = normalize(strokesRef.current);
    onDone(trimmed?.path ?? null, trimmed?.box ?? null);
  };

  const drawn = paths.filter(drawable);
  const empty = drawn.length === 0;

  return (
    <View style={[styles.backdrop, { paddingTop: insets.top + 16 }]}>
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        <View style={styles.sheetHead}>
          <Text style={[styles.sheetTitle, { color: colors.amber }]}>
            {tr("capture.signature")}
          </Text>
          <Pressable
            onPress={clear}
            hitSlop={10}
            accessibilityLabel={tr("capture.clearSign")}
            style={styles.clear}
          >
            <Ionicons name="refresh-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.clearText, { color: colors.mutedForeground }]}>
              {tr("capture.clearSign")}
            </Text>
          </Pressable>
        </View>

        <View
          onLayout={onLayout}
          style={[styles.canvas, { borderColor: colors.border, backgroundColor: colors.card }]}
          {...responder.panHandlers}
        >
          {empty ? (
            <View pointerEvents="none" style={styles.placeholder}>
              <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                {tr("capture.signHere")}
              </Text>
              <View style={[styles.baseline, { backgroundColor: colors.border }]} />
            </View>
          ) : null}
          {box && !empty ? (
            <Svg pointerEvents="none" width="100%" height="100%" viewBox={box}>
              {drawn.map((s) => (
                <Path
                  key={s.id}
                  d={s.d}
                  stroke={colors.foreground}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
            </Svg>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onCancel}
            accessibilityLabel={tr("common.cancel")}
            style={[styles.action, { borderColor: colors.border }]}
          >
            <Text style={[styles.actionText, { color: colors.foreground }]}>
              {tr("common.cancel")}
            </Text>
          </Pressable>
          <Pressable
            onPress={commit}
            accessibilityLabel={tr("capture.saveSign")}
            style={[
              styles.action,
              styles.actionPrimary,
              { backgroundColor: colors.amber, borderColor: colors.amber },
            ]}
          >
            <Ionicons name="checkmark" size={16} color={colors.primaryForeground} />
            <Text style={[styles.actionText, { color: colors.primaryForeground }]}>
              {tr("capture.saveSign")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    minHeight: 18,
  },
  hint: { fontSize: 11, letterSpacing: 1 },
  clear: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearText: { fontSize: 11, letterSpacing: 0.5 },
  preview: {
    height: 96,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  previewEmpty: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  previewText: { fontSize: 12.5 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 12, letterSpacing: 1.4 },
  canvas: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 10,
  },
  placeholderText: { fontSize: 12, letterSpacing: 1 },
  baseline: { height: 1, width: "100%" },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  action: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionPrimary: { flex: 1.4 },
  actionText: { fontSize: 13.5, letterSpacing: 0.3 },
});
