import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { orpc } from "@/lib/api";
import { useT, type TKey, type Translate } from "@/lib/i18n";
import { useAckSetup, useOrg } from "@/queries/orgs";
import { useRoutes } from "@/queries/routes";
import { AssignDriverSheet } from "@/components/assign-driver-sheet";
import { InviteSheet } from "@/components/invite-sheet";

/**
 * The phone twin of the website's DeliveryChecklist, sitting on top of the runs list the way
 * that one sits on /app/routes.
 *
 * Same contract: every row comes from `org.setup`, which the server derives from work that
 * actually exists rather than from a "you tapped this" flag. So a step ticked on the website
 * shows ticked here, and vice versa, and a workspace that was already delivering before this
 * card existed never sees it.
 *
 * One deliberate difference from the web card: the website's "get the app on their phone" step
 * is not in this list. You cannot scan your own QR from the phone you are holding, and whoever
 * is reading this already has the app — that step ticks itself from the web side or from the
 * first photo taken here.
 */

type StepKey = "run" | "stops" | "crew" | "driver" | "drop";

const STEPS: { key: StepKey; title: TKey; sub: TKey }[] = [
  { key: "run", title: "runhelp.run", sub: "runhelp.runSub" },
  { key: "stops", title: "runhelp.stops", sub: "runhelp.stopsSub" },
  { key: "crew", title: "runhelp.crew", sub: "runhelp.crewSub" },
  { key: "driver", title: "runhelp.driver", sub: "runhelp.driverSub" },
  { key: "drop", title: "runhelp.drop", sub: "runhelp.dropSub" },
];

/** The shell every step's sheet sits in, so they all close the same way. */
function Sheet({
  title,
  onClose,
  children,
  t,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  t: Translate;
}) {
  const colors = useColors();
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.head, { borderColor: colors.border }]}>
            <Text
              style={[
                styles.sheetTitle,
                { color: colors.foreground, fontFamily: Fonts?.displayMedium },
              ]}
            >
              {title}
            </Text>
            <Pressable accessibilityLabel={t("common.close")} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** The numbered how-to body both instruction sheets use. */
function Steps({ keys }: { keys: TKey[] }) {
  const colors = useColors();
  const t = useT();
  return (
    <View style={styles.steps}>
      {keys.map((key, i) => (
        <View key={key} style={styles.step}>
          <View style={[styles.stepNum, { borderColor: colors.border }]}>
            <Text style={[styles.stepNumText, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {i + 1}
            </Text>
          </View>
          <Text style={[styles.stepText, { color: colors.foreground }]}>{t(key)}</Text>
        </View>
      ))}
    </View>
  );
}

/** Amber full-width action, the same one every sheet closes on. */
function Primary({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.primary, { backgroundColor: colors.amber }]}>
      <Text style={[styles.primaryText, { color: colors.background, fontFamily: Fonts?.mono }]}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

export function DeliveryChecklist() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const org = useOrg();
  const routes = useRoutes();
  const ack = useAckSetup();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<StepKey | null>(null);

  const setup = org.data?.setup;
  if (!setup) return null;

  const done = STEPS.filter((s) => setup[s.key]).length;
  // Nothing left to guide: the card retires itself rather than becoming furniture.
  if (done === STEPS.length) return null;

  // The run the "add stops" and "assign a driver" steps act on: the newest one, which on a
  // workspace this young is the one just built.
  const latest = routes.data?.[0] ?? null;

  /** Only the first drop ticks on closing; the rest leave a record behind to read back. */
  const ACK_ON_CLOSE: StepKey[] = ["drop"];

  const close = (step: StepKey) => {
    setOpen(null);
    if (!ACK_ON_CLOSE.includes(step)) {
      void queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
      return;
    }
    if (!setup[step]) ack.mutate({ step });
  };

  // Building a run has a proper full-screen form already, so that step goes there instead of
  // cramming the same fields into a modal.
  const start = (step: StepKey) => {
    if (step === "run") {
      router.push("/route/new");
      return;
    }
    setOpen(step);
  };

  // The first unfinished row gets the amber Start chip; the rest stay quiet so there is exactly
  // one obvious next move.
  const nextKey = STEPS.find((s) => !setup[s.key])?.key;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.cardHead}>
        {/* Amber at 15% rather than a theme token: there is no soft-amber in ThemeColors, and
            this tint reads the same on the light and the dark background. */}
        <View style={[styles.rocket, { backgroundColor: "rgba(240,168,0,0.15)" }]}>
          <Ionicons name="rocket-outline" size={15} color={colors.amber} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.title, { color: colors.foreground, fontFamily: Fonts?.displayMedium }]}
          >
            {t("runhelp.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {t("runhelp.subtitle")}
          </Text>
        </View>
        <Text
          style={[styles.progress, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
        >
          {t("checklist.progress", { n: done, total: STEPS.length })}
        </Text>
      </View>

      {/* Progress rail, so "how much is left" reads without counting rows. */}
      <View style={styles.rail}>
        {STEPS.map((s) => (
          <View
            key={s.key}
            style={[
              styles.railSeg,
              { backgroundColor: setup[s.key] ? colors.amber : colors.border },
            ]}
          />
        ))}
      </View>

      <View style={[styles.rows, { borderColor: colors.border }]}>
        {STEPS.map((step, index) => {
          const complete = setup[step.key];
          return (
            <Pressable
              key={step.key}
              disabled={complete}
              onPress={() => start(step.key)}
              style={({ pressed }) => [
                styles.row,
                {
                  borderColor: colors.border,
                  backgroundColor: pressed && !complete ? colors.background : "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.num,
                  {
                    borderColor: complete ? colors.verified : colors.border,
                    backgroundColor: complete ? "rgba(31,193,107,0.15)" : "transparent",
                  },
                ]}
              >
                {complete ? (
                  <Ionicons name="checkmark" size={11} color={colors.verified} />
                ) : (
                  <Text
                    style={[
                      styles.numText,
                      { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowTitle,
                    complete
                      ? { color: colors.mutedForeground, textDecorationLine: "line-through" }
                      : { color: colors.foreground },
                  ]}
                >
                  {t(step.title)}
                </Text>
                {!complete ? (
                  <Text
                    numberOfLines={1}
                    style={[styles.rowSub, { color: colors.mutedForeground }]}
                  >
                    {t(step.sub)}
                  </Text>
                ) : null}
              </View>

              {complete ? null : step.key === nextKey ? (
                <View style={[styles.startChip, { backgroundColor: colors.amber }]}>
                  <Text
                    style={[
                      styles.startText,
                      { color: colors.background, fontFamily: Fonts?.mono },
                    ]}
                  >
                    {t("checklist.start").toUpperCase()}
                  </Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={15} color={colors.mutedForeground} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Step 2 — the stops themselves. Pasting a list lives on the run screen, so this
          points at it rather than duplicating the box. */}
      {open === "stops" ? (
        <Sheet title={t("runhelp.stopsTitle")} onClose={() => close("stops")} t={t}>
          <View style={styles.body}>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
              {t("runhelp.stopsBody")}
            </Text>
            <Steps keys={["runhelp.stops1", "runhelp.stops2", "runhelp.stops3"]} />
            {latest ? (
              <Primary
                label={t("runhelp.openRun")}
                onPress={() => {
                  close("stops");
                  router.push(`/route/${latest.id}`);
                }}
              />
            ) : (
              <Text
                style={[
                  styles.noRun,
                  { borderColor: colors.border, color: colors.mutedForeground },
                ]}
              >
                {t("runhelp.noRun")}
              </Text>
            )}
          </View>
        </Sheet>
      ) : null}

      <InviteSheet visible={open === "crew"} onClose={() => close("crew")} />

      {open === "driver" ? (
        latest ? (
          <AssignDriverSheet
            routeId={latest.id}
            routeName={latest.name}
            driverId={latest.driverId ?? null}
            onClose={() => close("driver")}
          />
        ) : (
          <Sheet title={t("driver.title")} onClose={() => close("driver")} t={t}>
            <View style={styles.body}>
              <Text
                style={[
                  styles.noRun,
                  { borderColor: colors.border, color: colors.mutedForeground },
                ]}
              >
                {t("runhelp.noRun")}
              </Text>
            </View>
          </Sheet>
        )
      ) : null}

      {/* Step 5 — the first drop closed on the road. Nothing to do in here but know what to
          expect, so it ticks on closing. */}
      {open === "drop" ? (
        <Sheet title={t("runhelp.dropTitle")} onClose={() => close("drop")} t={t}>
          <View style={styles.body}>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
              {t("runhelp.dropBody")}
            </Text>
            <Steps keys={["runhelp.drop1", "runhelp.drop2", "runhelp.drop3"]} />
            <Primary label={t("runhelp.dropDone")} onPress={() => close("drop")} />
          </View>
        </Sheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  cardHead: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rocket: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14 },
  subtitle: { fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  progress: { fontSize: 9, letterSpacing: 1 },
  rail: { flexDirection: "row", gap: 3, marginTop: 10 },
  railSeg: { flex: 1, height: 3, borderRadius: 999 },
  rows: { marginTop: 10, borderTopWidth: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 2,
  },
  num: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: { fontSize: 9 },
  rowTitle: { fontSize: 12.5 },
  rowSub: { fontSize: 11, marginTop: 1 },
  startChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  startText: { fontSize: 9, fontWeight: "700", letterSpacing: 1.2 },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(6,9,13,0.8)",
    justifyContent: "center",
    padding: 16,
  },
  sheet: { borderWidth: 1, borderRadius: 14, paddingBottom: 12 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sheetTitle: { fontSize: 14.5, flex: 1 },
  body: { paddingHorizontal: 14, paddingTop: 12 },
  bodyText: { fontSize: 12, lineHeight: 18 },
  steps: { marginTop: 12, gap: 9 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 9 },
  stepText: { flex: 1, fontSize: 12, lineHeight: 17 },
  primary: { marginTop: 14, borderRadius: 8, alignItems: "center", paddingVertical: 11 },
  primaryText: { fontSize: 10.5, letterSpacing: 1.4 },
  noRun: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    textAlign: "center",
    fontSize: 11.5,
  },
});
