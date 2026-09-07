/**
 * Supported UI languages. English is the base catalog; every other locale is a full
 * translation of it. Web, mobile and desktop all read this list so the option sets
 * can never drift apart.
 *
 * Keep `LOCALE_CODES` as a const tuple — it is fed straight into `z.enum()`.
 */
export const LOCALE_CODES = [
  "en",
  "fr-CA",
  "es",
  "pt-BR",
  "de",
  "it",
  "zh",
  "vi",
  "tl",
  "ar",
  "pl",
] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

export type LocaleMeta = {
  code: LocaleCode;
  /** Name in English, for admin-facing lists. */
  label: string;
  /** Name in the language itself, for the member-facing picker. */
  native: string;
  /** Right-to-left script — the clients mirror layout direction on these. */
  rtl: boolean;
};

export const LOCALES: readonly LocaleMeta[] = [
  { code: "en", label: "English", native: "English", rtl: false },
  { code: "fr-CA", label: "French (Canada)", native: "Français (Canada)", rtl: false },
  { code: "es", label: "Spanish", native: "Español", rtl: false },
  { code: "pt-BR", label: "Portuguese (Brazil)", native: "Português (Brasil)", rtl: false },
  { code: "de", label: "German", native: "Deutsch", rtl: false },
  { code: "it", label: "Italian", native: "Italiano", rtl: false },
  { code: "zh", label: "Mandarin Chinese", native: "中文", rtl: false },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt", rtl: false },
  { code: "tl", label: "Tagalog", native: "Tagalog", rtl: false },
  { code: "ar", label: "Arabic", native: "العربية", rtl: true },
  { code: "pl", label: "Polish", native: "Polski", rtl: false },
];

const CODES = new Set<string>(LOCALE_CODES);

/** Narrows any stored/incoming string to a supported locale, falling back to English. */
export function asLocale(value: string | null | undefined): LocaleCode {
  if (value && CODES.has(value)) return value as LocaleCode;
  // Accept a bare language tag for regional variants we do carry (e.g. "fr" → "fr-CA").
  const base = (value ?? "").split("-")[0]?.toLowerCase();
  if (base === "fr") return "fr-CA";
  if (base === "pt") return "pt-BR";
  if (base && CODES.has(base)) return base as LocaleCode;
  return "en";
}

export const isRtl = (code: LocaleCode) => LOCALES.find((l) => l.code === code)?.rtl ?? false;
