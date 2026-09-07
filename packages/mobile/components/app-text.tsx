import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
} from "react-native";

/**
 * Ceiling on the OS font-size multiplier.
 *
 * React Native multiplies every font size by the phone's system font-size setting with no upper
 * bound, so Android's largest setting (~1.8x on Samsung One UI) stretches bubbles, timestamps and
 * headers until the layout breaks. Expo web ignores the setting entirely, which is why this never
 * showed up in the browser preview.
 *
 * 1.2 keeps a real accessibility gain — text still grows 20% — while guaranteeing the messaging
 * layout holds together. Pass an explicit maxFontSizeMultiplier to override per element.
 */
export const MAX_FONT_SCALE = 1.2;

/** Drop-in replacement for react-native's Text with the font-scale ceiling applied. */
export function Text({ maxFontSizeMultiplier = MAX_FONT_SCALE, ...rest }: TextProps) {
  return <RNText maxFontSizeMultiplier={maxFontSizeMultiplier} {...rest} />;
}

/** Drop-in replacement for react-native's TextInput with the font-scale ceiling applied. */
export function TextInput({ maxFontSizeMultiplier = MAX_FONT_SCALE, ...rest }: TextInputProps) {
  return <RNTextInput maxFontSizeMultiplier={maxFontSizeMultiplier} {...rest} />;
}

/**
 * Text that ignores the OS font-size setting entirely.
 *
 * Only for the burned-in evidence stamp: its rows are fixed geometry that gets composited into the
 * photo itself, so a larger system font would push the coordinates and photo code out of the frame
 * and corrupt the evidence. Accessibility scaling belongs on the surrounding UI, not on the stamp.
 */
export function FixedText({ allowFontScaling = false, ...rest }: TextProps) {
  return <RNText allowFontScaling={allowFontScaling} {...rest} />;
}
