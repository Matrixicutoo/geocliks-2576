/**
 * Metro cannot pull runtime code out of packages/web, so the locale list is mirrored
 * here. Keep it identical to packages/web/src/api/lib/locales.ts.
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
  label: string;
  native: string;
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

export function asLocale(value: string | null | undefined): LocaleCode {
  if (value && CODES.has(value)) return value as LocaleCode;
  const base = (value ?? "").split("-")[0]?.toLowerCase();
  if (base === "fr") return "fr-CA";
  if (base === "pt") return "pt-BR";
  if (base && CODES.has(base)) return base as LocaleCode;
  return "en";
}

export const isRtl = (code: LocaleCode) => LOCALES.find((l) => l.code === code)?.rtl ?? false;
