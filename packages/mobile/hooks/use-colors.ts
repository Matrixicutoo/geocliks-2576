import type { ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/lib/theme";

/**
 * Returns the color palette for the theme the app is set to (light/dark).
 *
 * The scheme comes from the member's per-device choice, falling back to the
 * workspace default — not from the OS. See `lib/theme.tsx`.
 *
 * ```tsx
 * const colors = useColors();
 * <View style={{ backgroundColor: colors.background }}>
 *   <Text style={{ color: colors.foreground }}>Hello</Text>
 * </View>
 * ```
 */
export function useColors(): ThemeColors {
  return useAppTheme().colors;
}
