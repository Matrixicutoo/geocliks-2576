import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { useAddressSuggestions } from "@/queries/routes";

type Props = {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  hint?: string;
};

/**
 * An address box that suggests real addresses as you type.
 *
 * Shared by the new-route form and the driver's "add a stop" panel, so both behave the same and
 * there is one place to change the cost policy.
 *
 * Two deliberate differences from the website version:
 *
 * 1. The suggestion list is laid out INLINE beneath the field, not absolutely positioned over the
 *    content. An absolute overlay inside a React Native ScrollView gets clipped by the scroll
 *    container on Android regardless of z-index, so the list would simply not appear. Pushing the
 *    content down always works.
 * 2. Closing on blur is delayed by a frame or two. A tap on a suggestion blurs the input first,
 *    and unmounting the list on that blur would cancel the tap before it lands. The parent scroll
 *    view should also carry `keyboardShouldPersistTaps="handled"` so the keyboard does not eat the
 *    first tap.
 *
 * If Google returns nothing — including when Places API (New) is off for the Cloud project — the
 * list stays empty and this is an ordinary text box. It never shows an error.
 */
export function AddressInput({ label, value, onChangeText, placeholder, hint }: Props) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  // Trails the typed value so a lookup is not billed per keystroke.
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => setQuery(value), 300);
    return () => clearTimeout(handle);
  }, [value]);

  const suggestions = useAddressSuggestions(query);
  const items = focused ? (suggestions.data ?? []) : [];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel={label}
        autoCapitalize="words"
        autoCorrect={false}
        style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
      />

      {items.length > 0 ? (
        <View style={[styles.list, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {items.map((item, index) => (
            <Pressable
              key={item.placeId ?? item.description}
              accessibilityLabel={item.description}
              onPress={() => {
                onChangeText(item.description);
                // Keep the trailing query in step, or the list re-opens with the old text.
                setQuery(item.description);
                setFocused(false);
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: pressed ? colors.amber : "transparent",
                  borderTopColor: colors.border,
                  borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                },
              ]}
            >
              <Text numberOfLines={2} style={[styles.optionText, { color: colors.foreground }]}>
                {item.description}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 11, letterSpacing: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  list: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  option: { paddingHorizontal: 12, paddingVertical: 11 },
  optionText: { fontSize: 13, lineHeight: 18 },
  hint: { fontSize: 11, lineHeight: 16 },
});
