import { View, StyleSheet, Image } from "react-native";
import { FixedText as Text } from "@/components/app-text";
import { Colors, Fonts } from "@/constants/theme";

export type StampData = {
  at: Date;
  lat: number | null;
  lng: number | null;
  accuracyM?: number | null;
  address: string | null;
  project: string | null;
  code?: string | null;
  company?: string | null;
  /** Presigned link to the workspace logo. Null hides the slot, same as the web overlay. */
  logoUrl?: string | null;
  verified?: boolean;
};

export function formatStamp(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatCoords(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return "GPS acquiring…";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${ns}  ${Math.abs(lng).toFixed(6)}° ${ew}`;
}

/** Device UTC offset at the stamped moment, e.g. UTC-4 or UTC+5:30. */
export function formatTz(date: Date) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const rest = abs % 60;
  return `UTC${sign}${hours}${rest ? `:${String(rest).padStart(2, "0")}` : ""}`;
}

/** The burned-in evidence stamp — mirrors the web WatermarkOverlay. */
export function Stamp({ data, compact = false }: { data: StampData; compact?: boolean }) {
  const c = Colors.dark;
  const tz = formatTz(data.at);

  return (
    <View style={[styles.wrap, { borderColor: "rgba(255,176,33,0.5)" }]}>
      <View style={styles.body}>
        {data.logoUrl ? (
          <Image source={{ uri: data.logoUrl }} style={styles.logo} resizeMode="contain" />
        ) : null}
        <View style={styles.lines}>
          <View style={styles.rowTop}>
            <View
              style={[
                styles.tick,
                {
                  backgroundColor: data.verified === false ? c.alert : c.verified,
                },
              ]}
            />
            <Text style={[styles.time, { color: c.foreground, fontFamily: Fonts?.mono }]}>
              {formatStamp(data.at)}
            </Text>
            <Text style={[styles.tz, { color: c.amber, fontFamily: Fonts?.mono }]}>{tz}</Text>
          </View>

          <Text style={[styles.mono, { color: c.foreground, fontFamily: Fonts?.mono }]}>
            {formatCoords(data.lat, data.lng)}
            {data.accuracyM != null ? `  ±${Math.round(data.accuracyM)}m` : ""}
          </Text>

          <Text
            numberOfLines={compact ? 1 : 2}
            style={[styles.address, { color: c.mutedForeground }]}
          >
            {data.address ?? "Resolving street address…"}
          </Text>

          <View style={styles.rowBottom}>
            <Text numberOfLines={1} style={[styles.project, { color: c.amber }]}>
              {data.project ?? "Unassigned"}
            </Text>
            {data.code ? (
              <Text style={[styles.code, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}>
                {data.code}
              </Text>
            ) : null}
          </View>

          {data.company ? (
            <Text style={[styles.company, { color: c.mutedForeground }]}>{data.company}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 3,
    backgroundColor: "rgba(11,14,19,0.78)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  body: { flexDirection: "row", alignItems: "center", gap: 10 },
  lines: { flex: 1, gap: 3 },
  logo: { width: 34, height: 34, flexShrink: 0 },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  tick: { width: 7, height: 7, borderRadius: 4 },
  time: { fontSize: 13, letterSpacing: 0.4, flexShrink: 1 },
  tz: { fontSize: 10, letterSpacing: 0.6 },
  mono: { fontSize: 11, letterSpacing: 0.3 },
  address: { fontSize: 11 },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 2,
  },
  project: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    flexShrink: 1,
  },
  code: { fontSize: 10, letterSpacing: 0.5 },
  company: { fontSize: 10, letterSpacing: 0.5 },
});
