import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput } from "@/components/app-text";
import { AddressInput } from "@/components/address-input";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { useOrg } from "@/queries/orgs";
import { useCreateRoute } from "@/queries/routes";
import { canRunDeliveries } from "../../lib/roles";

/**
 * Today as YYYY-MM-DD in the phone's OWN timezone.
 *
 * Deliberately not `toISOString().slice(0, 10)`: that is UTC, so a driver in Moncton opening this
 * after 8pm would be handed tomorrow's date.
 */
function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Move a YYYY-MM-DD date by whole days, staying in local time. */
function shiftDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Minutes past midnight -> "HH:MM". The server stores minutes so ETAs never touch a timezone. */
function toClock(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

const STEP_MINUTES = 15;

/**
 * Build a delivery run from the phone.
 *
 * Dispatcher and above. The Routes tab hides the button for everyone else and the server enforces
 * the real rule, so a field member who deep-links here is simply sent back to the list.
 *
 * Date and time are stepper controls rather than native pickers on purpose: a native date picker
 * is a separate native module, which would not run in the currently installed app or in the web
 * preview. Steppers are plain JavaScript, work everywhere, and need no rebuild.
 */
export default function RouteNew() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const org = useOrg();
  const create = useCreateRoute();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [startMinutes, setStartMinutes] = useState(480);
  const [startAddress, setStartAddress] = useState("");
  const [serviceMinutes, setServiceMinutes] = useState("5");
  const [mode, setMode] = useState<"planned" | "dispatch">("planned");
  const [returnToStart, setReturnToStart] = useState(false);
  const [requireSignature, setRequireSignature] = useState(false);

  // Wait for the role before deciding — org.data is undefined on the first render, and bouncing
  // on that would throw a legitimate dispatcher straight back out.
  const role = org.data?.role;
  if (role && !canRunDeliveries(role)) {
    router.replace("/routes");
    return null;
  }

  const submit = async () => {
    setError(null);
    if (!name.trim()) return;
    try {
      const created = await create.mutateAsync({
        name: name.trim(),
        date,
        mode,
        startAddress: startAddress.trim() || null,
        startMinutes,
        serviceMinutes: Number(serviceMinutes) || 5,
        returnToStart,
        requireSignature,
      });
      router.replace(`/route/${created.id}`);
    } catch (e) {
      // Includes the plan message when dispatch mode is not on this plan — never swallowed.
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("routes.back")}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color={colors.amber} />
          <Text style={[styles.backText, { color: colors.amber }]}>{t("routes.back")}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {t("routes.newTitle").toUpperCase()}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {t("routes.newSubtitle")}
        </Text>

        <Field label={t("routes.fName")}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Monday — West End"
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={t("routes.fName")}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          />
        </Field>

        {/*
          Who is dispatching. Never typed in: the server stamps `routes.createdBy` with the
          signed-in user, so showing that same person keeps the form and the record in step and
          makes the value impossible to leave blank.
        */}
        <Field label={t("routes.fDispatcher")} hint={t("routes.fDispatcherHint")}>
          <View
            style={[styles.readonly, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Text style={[styles.readonlyText, { color: colors.mutedForeground }]}>
              {org.data?.user.name ?? ""}
            </Text>
          </View>
        </Field>

        <Field label={t("routes.fDate")}>
          <View style={styles.stepper}>
            <StepButton
              icon="chevron-back"
              label={t("routes.fDate")}
              onPress={() => setDate((d) => shiftDays(d, -1))}
            />
            <View style={[styles.stepValue, { borderColor: colors.border }]}>
              <Text
                style={[styles.stepText, { color: colors.foreground, fontFamily: Fonts?.mono }]}
              >
                {date}
              </Text>
            </View>
            <StepButton
              icon="chevron-forward"
              label={t("routes.fDate")}
              onPress={() => setDate((d) => shiftDays(d, 1))}
            />
            <Pressable
              onPress={() => setDate(todayLocal())}
              accessibilityLabel={t("common.today")}
              style={[styles.todayBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.todayText, { color: colors.amber }]}>{t("common.today")}</Text>
            </Pressable>
          </View>
        </Field>

        <Field label={t("routes.fStartTime")}>
          <View style={styles.stepper}>
            <StepButton
              icon="chevron-back"
              label={t("routes.fStartTime")}
              onPress={() => setStartMinutes((m) => (m - STEP_MINUTES + 1440) % 1440)}
            />
            <View style={[styles.stepValue, { borderColor: colors.border }]}>
              <Text
                style={[styles.stepText, { color: colors.foreground, fontFamily: Fonts?.mono }]}
              >
                {toClock(startMinutes)}
              </Text>
            </View>
            <StepButton
              icon="chevron-forward"
              label={t("routes.fStartTime")}
              onPress={() => setStartMinutes((m) => (m + STEP_MINUTES) % 1440)}
            />
          </View>
        </Field>

        <AddressInput
          label={t("routes.fStartAddress")}
          value={startAddress}
          onChangeText={setStartAddress}
          placeholder="34-18 Clearview Street, Moncton, NB"
          hint={t("routes.fStartHint")}
        />

        <Field label={t("routes.fServiceMinutes")}>
          <TextInput
            value={serviceMinutes}
            onChangeText={setServiceMinutes}
            keyboardType="number-pad"
            accessibilityLabel={t("routes.fServiceMinutes")}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          />
        </Field>

        <Field
          label={t("routes.fMode")}
          hint={mode === "dispatch" ? t("routes.modeDispatchHint") : t("routes.modePlannedHint")}
        >
          <View style={styles.modes}>
            {(["planned", "dispatch"] as const).map((option) => {
              const on = mode === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setMode(option)}
                  accessibilityLabel={t(
                    option === "planned" ? "routes.modePlanned" : "routes.modeDispatch",
                  )}
                  style={[
                    styles.mode,
                    {
                      borderColor: on ? colors.amber : colors.border,
                      backgroundColor: on ? colors.amber : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeText,
                      { color: on ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {t(option === "planned" ? "routes.modePlanned" : "routes.modeDispatch")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Toggle
          label={t("routes.fReturnToStart")}
          value={returnToStart}
          onToggle={() => setReturnToStart((v) => !v)}
        />
        <Toggle
          label={t("routes.fRequireSignature")}
          value={requireSignature}
          onToggle={() => setRequireSignature((v) => !v)}
        />

        {error ? <Text style={[styles.error, { color: colors.alert }]}>{error}</Text> : null}

        <Pressable
          onPress={submit}
          disabled={create.isPending || !name.trim()}
          accessibilityLabel={t("routes.create")}
          style={[
            styles.primary,
            { backgroundColor: colors.amber, opacity: create.isPending || !name.trim() ? 0.45 : 1 },
          ]}
        >
          {create.isPending ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
              {t("routes.create").toUpperCase()}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/** One labelled row, so every field on the form lines up the same way. */
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
      {children}
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  );
}

function StepButton({
  icon,
  label,
  onPress,
}: {
  icon: "chevron-back" | "chevron-forward";
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${label} ${icon === "chevron-back" ? "-" : "+"}`}
      hitSlop={6}
      style={({ pressed }) => [
        styles.step,
        {
          borderColor: colors.border,
          backgroundColor: pressed ? colors.amber : "transparent",
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.foreground} />
    </Pressable>
  );
}

function Toggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityLabel={label}
      style={[styles.toggle, { borderColor: colors.border }]}
    >
      <Ionicons
        name={value ? "checkbox" : "square-outline"}
        size={20}
        color={value ? colors.amber : colors.mutedForeground}
      />
      <Text style={[styles.toggleText, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  backText: { fontSize: 13, fontWeight: "600" },
  body: { padding: 16, gap: 14, paddingBottom: 40 },
  title: { fontSize: 15, letterSpacing: 1.5 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: -8 },
  field: { gap: 6 },
  label: { fontSize: 11, letterSpacing: 1 },
  hint: { fontSize: 11, lineHeight: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  readonly: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  readonlyText: { fontSize: 14 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  step: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  stepText: { fontSize: 14, letterSpacing: 0.5 },
  todayBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 11 },
  todayText: { fontSize: 12, fontWeight: "700" },
  modes: { gap: 8 },
  mode: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  modeText: { fontSize: 13, fontWeight: "600" },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  toggleText: { fontSize: 13, fontWeight: "600" },
  error: { fontSize: 12, lineHeight: 18 },
  primary: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  primaryText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
});
