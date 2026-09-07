import { Platform } from "react-native";

/**
 * GeoCliks field palette — mirrors packages/web/src/web/styles.css.
 * Dark graphite base, safety amber for action, green only for verification.
 */
const shared = {
  amber: "#FFB021",
  amberDeep: "#E08A00",
  verified: "#1FC16B",
  alert: "#FF5A47",
  sky: "#48A9FF",
};

export const Colors = {
  light: {
    background: "#FFFFFF",
    foreground: "#0B0E13",
    card: "#F6F8FB",
    cardForeground: "#0B0E13",
    primary: shared.amber,
    primaryForeground: "#0B0E13",
    secondary: "#EDF1F6",
    secondaryForeground: "#0B0E13",
    muted: "#EDF1F6",
    mutedForeground: "#5D6B80",
    accent: "#EDF1F6",
    accentForeground: "#B06C00",
    border: "#DCE3EC",
    destructive: "#D93A28",
    success: "#0F9D58",
    warning: "#B06C00",
    ...shared,
    amberDeep: "#B06C00",
    verified: "#0F9D58",
    alert: "#D93A28",
    sky: "#1B7FD4",
  },
  dark: {
    background: "#0B0E13",
    foreground: "#E8EDF4",
    card: "#11161E",
    cardForeground: "#E8EDF4",
    primary: shared.amber,
    primaryForeground: "#0B0E13",
    secondary: "#1A212C",
    secondaryForeground: "#E8EDF4",
    muted: "#1A212C",
    mutedForeground: "#8C9AAD",
    accent: "#1A212C",
    accentForeground: "#FFB021",
    border: "#242E3C",
    destructive: shared.alert,
    success: shared.verified,
    warning: shared.amberDeep,
    ...shared,
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ColorScheme];

/** Loaded in app/_layout.tsx with useFonts from expo-font. */
export const Fonts = Platform.select({
  default: {
    sans: "Manrope_500Medium",
    semibold: "Manrope_600SemiBold",
    display: "Sora_700Bold",
    displayMedium: "Sora_600SemiBold",
    mono: "JetBrainsMono_500Medium",
    serif: "serif",
    rounded: "Manrope_500Medium",
  },
  web: {
    sans: "Manrope_500Medium, system-ui, sans-serif",
    semibold: "Manrope_600SemiBold, system-ui, sans-serif",
    display: "Sora_700Bold, system-ui, sans-serif",
    displayMedium: "Sora_600SemiBold, system-ui, sans-serif",
    mono: "JetBrainsMono_500Medium, 'SF Mono', monospace",
    serif: "Georgia, serif",
    rounded: "Manrope_500Medium, system-ui, sans-serif",
  },
});
