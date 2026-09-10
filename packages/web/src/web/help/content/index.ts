/**
 * Locale → help catalog wiring. Composition only; the resolution rules live in
 * `../resolve.ts`.
 *
 * `CATALOGS` holds locales with fully translated article bodies. `LABELS` holds
 * locales that only have translated titles, summaries and section headings — those
 * render the English body under a banner saying so. A locale absent from both falls
 * back to English throughout.
 */
import type { LocaleCode } from "../../../api/lib/locales";
import type { Category, LocaleLabels } from "../types";
import { deCategories } from "./de";
import { enCategories } from "./en";
import { esCategories } from "./es";
import { frCategories } from "./fr-CA";
import { itCategories } from "./it";
import { plCategories } from "./pl";
import { ptBRCategories } from "./pt-BR";
import { viCategories } from "./vi";
import { zhCategories } from "./zh";

export const CATALOGS: Partial<Record<LocaleCode, Category[]>> = {
  en: enCategories,
  "fr-CA": frCategories,
  es: esCategories,
  "pt-BR": ptBRCategories,
  de: deCategories,
  it: itCategories,
  pl: plCategories,
  zh: zhCategories,
  vi: viCategories,
};

export const LABELS: Partial<Record<LocaleCode, LocaleLabels>> = {};

export {
  deCategories,
  enCategories,
  esCategories,
  frCategories,
  itCategories,
  plCategories,
  ptBRCategories,
  viCategories,
  zhCategories,
};
