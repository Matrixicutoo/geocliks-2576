import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { Fonts } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";
import { useT } from "@/lib/i18n";
import { cropPage, rotatePage, type ScanPage } from "@/lib/doc-scan";

type Rect = { x: number; y: number; width: number; height: number };

const FULL: Rect = { x: 0, y: 0, width: 1, height: 1 };
/** Smallest crop, as a fraction of the page — stops a handle drag from collapsing the rect. */
const MIN = 0.12;

/**
 * Review one scanned page: straighten it, crop it, drop it, or keep it.
 *
 * The page is already on disk before this opens, so every edit rewrites the file and hands
 * back a new URI — nothing here mutates the capture in place, and cancelling leaves the
 * page exactly as it was shot.
 */
export function ScanReview({
  page,
  pageLabel,
  onCancel,
  onSave,
  onDelete,
}: {
  page: ScanPage | null;
  /** "Page 2 of 3" — reads as part of a session rather than a lone photo. */
  pageLabel?: string | null;
  onCancel: () => void;
  onSave: (page: ScanPage) => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const tr = useT();
  const [draft, setDraft] = useState<ScanPage | null>(page);
  const [ratio, setRatio] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [rect, setRect] = useState<Rect>(FULL);
  const [box, setBox] = useState({ width: 0, height: 0 });
  // The pan handlers are built once, so they read the live rect and the live image box out
  // of refs instead of capturing the first render's values.
  const rectRef = useRef(FULL);
  const boxRef = useRef(box);
  const startRef = useRef(FULL);

  useEffect(() => {
    setDraft(page);
    setCropping(false);
    setRect(FULL);
    rectRef.current = FULL;
    setRatio(page && page.width && page.height ? page.width / page.height : null);
  }, [page]);

  // A page that came out of the OS scanner arrives as a bare file path with no dimensions,
  // and the crop overlay has to sit exactly on the pixels to mean anything.
  useEffect(() => {
    if (!draft || ratio) return;
    let cancelled = false;
    Image.getSize(
      draft.uri,
      (w, h) => {
        if (!cancelled && h > 0) setRatio(w / h);
      },
      () => {
        if (!cancelled) setRatio(3 / 4);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [draft, ratio]);

  const onStageLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox({ width, height });
  }, []);

  /** The box the image really occupies inside the stage, since it is drawn `contain`. */
  const frame = useMemo(() => {
    const r = ratio ?? 3 / 4;
    if (box.width === 0 || box.height === 0) return { width: 0, height: 0, left: 0, top: 0 };
    const width = Math.min(box.width, box.height * r);
    const height = width / r;
    return { width, height, left: (box.width - width) / 2, top: (box.height - height) / 2 };
  }, [box, ratio]);

  useEffect(() => {
    boxRef.current = { width: frame.width, height: frame.height };
  }, [frame]);

  const commitRect = (next: Rect) => {
    rectRef.current = next;
    setRect(next);
  };

  /** One corner handle: drags two edges of an axis-aligned rect, clamped to the page. */
  const cornerResponder = (corner: "tl" | "tr" | "bl" | "br") =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = rectRef.current;
      },
      onPanResponderMove: (_event, gesture) => {
        const { width, height } = boxRef.current;
        if (width === 0 || height === 0) return;
        const dx = gesture.dx / width;
        const dy = gesture.dy / height;
        const s = startRef.current;
        let left = s.x;
        let top = s.y;
        let right = s.x + s.width;
        let bottom = s.y + s.height;
        if (corner === "tl" || corner === "bl") left = Math.min(Math.max(0, s.x + dx), right - MIN);
        else right = Math.max(Math.min(1, right + dx), left + MIN);
        if (corner === "tl" || corner === "tr") top = Math.min(Math.max(0, s.y + dy), bottom - MIN);
        else bottom = Math.max(Math.min(1, bottom + dy), top + MIN);
        commitRect({ x: left, y: top, width: right - left, height: bottom - top });
      },
    });

  const handles = useMemo(
    () => ({
      tl: cornerResponder("tl"),
      tr: cornerResponder("tr"),
      bl: cornerResponder("bl"),
      br: cornerResponder("br"),
    }),
    // Built once: every value they touch is read from a ref at gesture time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const rotate = async () => {
    if (!draft || busy) return;
    setBusy(true);
    try {
      const next = await rotatePage(draft, 90);
      setDraft(next);
      setRatio(next.width && next.height ? next.width / next.height : null);
      commitRect(FULL);
    } finally {
      setBusy(false);
    }
  };

  const applyCrop = async () => {
    if (!draft || busy) return;
    setBusy(true);
    try {
      const next = await cropPage(draft, rectRef.current);
      setDraft(next);
      setRatio(next.width && next.height ? next.width / next.height : null);
      commitRect(FULL);
      setCropping(false);
    } finally {
      setBusy(false);
    }
  };

  const action = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: () => void,
    tint: string,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityLabel={label}
      disabled={busy}
      style={({ pressed }) => [
        styles.action,
        { borderColor: tint, opacity: busy ? 0.5 : pressed ? 0.75 : 1 },
      ]}
    >
      <Ionicons name={icon} size={18} color={tint} />
      <Text numberOfLines={1} style={[styles.actionText, { color: tint }]}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible={!!page} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
        <View style={[styles.head, { borderColor: colors.border }]}>
          <Pressable onPress={onCancel} accessibilityLabel={tr("common.close")} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.mutedForeground} />
          </Pressable>
          <Text
            numberOfLines={1}
            style={[styles.headTitle, { color: colors.foreground, fontFamily: Fonts?.display }]}
          >
            {(pageLabel ?? tr("scan.reviewTitle")).toUpperCase()}
          </Text>
          <View style={styles.headSpacer} />
        </View>

        <View style={styles.stage} onLayout={onStageLayout}>
          {draft ? (
            <View style={{ width: frame.width, height: frame.height }}>
              <Image
                source={{ uri: draft.uri }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="contain"
              />
              {cropping && frame.width > 0 ? (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                  <View
                    pointerEvents="none"
                    style={[
                      styles.cropRect,
                      {
                        borderColor: colors.amber,
                        left: rect.x * frame.width,
                        top: rect.y * frame.height,
                        width: rect.width * frame.width,
                        height: rect.height * frame.height,
                      },
                    ]}
                  />
                  {(["tl", "tr", "bl", "br"] as const).map((corner) => {
                    const left = corner === "tl" || corner === "bl" ? rect.x : rect.x + rect.width;
                    const top = corner === "tl" || corner === "tr" ? rect.y : rect.y + rect.height;
                    return (
                      <View
                        key={corner}
                        {...handles[corner].panHandlers}
                        style={[
                          styles.handle,
                          {
                            borderColor: colors.amber,
                            backgroundColor: "rgba(11,14,19,0.55)",
                            left: left * frame.width - 18,
                            top: top * frame.height - 18,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
          {busy ? (
            <View style={[StyleSheet.absoluteFillObject, styles.busy]}>
              <ActivityIndicator color={colors.amber} />
            </View>
          ) : null}
        </View>

        <View style={[styles.actions, { borderColor: colors.border }]}>
          {action("refresh-outline", tr("scan.rotate"), () => void rotate(), colors.foreground)}
          {cropping
            ? action("checkmark-outline", tr("scan.applyCrop"), () => void applyCrop(), colors.amber)
            : action("crop-outline", tr("scan.crop"), () => setCropping(true), colors.foreground)}
          {cropping
            ? action(
                "close-outline",
                tr("scan.cancelCrop"),
                () => {
                  commitRect(FULL);
                  setCropping(false);
                },
                colors.mutedForeground,
              )
            : action("trash-outline", tr("scan.delete"), onDelete, colors.alert)}
        </View>

        <Pressable
          onPress={() => draft && onSave(draft)}
          disabled={busy || !draft}
          style={({ pressed }) => [
            styles.save,
            {
              backgroundColor: pressed ? colors.amberDeep : colors.amber,
              opacity: busy ? 0.6 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.saveText,
              { color: colors.primaryForeground, fontFamily: Fonts?.display },
            ]}
          >
            {tr("scan.keepPage").toUpperCase()}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 44 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headTitle: { fontSize: 13, letterSpacing: 0.6 },
  headSpacer: { width: 22 },
  stage: { flex: 1, alignItems: "center", justifyContent: "center", padding: 12 },
  busy: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(11,14,19,0.35)" },
  cropRect: { position: "absolute", borderWidth: 2 },
  handle: { position: "absolute", width: 36, height: 36, borderRadius: 18, borderWidth: 2 },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  actionText: { fontSize: 10, letterSpacing: 0.6 },
  save: {
    margin: 12,
    marginBottom: 28,
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 12,
  },
  saveText: { fontSize: 14, letterSpacing: 0.8 },
});
