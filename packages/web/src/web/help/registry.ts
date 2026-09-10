/**
 * Content-to-UI bridge for the Help Center.
 *
 * Content files name their icon as a string so nothing under `content/` has to
 * import React. This is the only place that turns those names into components,
 * which also means an unknown name degrades to a sensible default instead of
 * crashing the page.
 */
import {
  BookOpen,
  CreditCard,
  type LucideIcon,
  Rocket,
  Route,
  Scale,
  ShieldCheck,
  Smartphone,
  Users,
  Wrench,
} from "lucide-react";

import { assertHelpIntegrity as checkHelp } from "./resolve";

/**
 * Fail loudly in development on a broken cross-reference or a duplicate slug.
 * A bad `see()` ref would otherwise ship as a silently missing link, so the
 * check runs once when the Help Center is first loaded — never in production,
 * where a content typo must not take the page down.
 */
if (import.meta.env.DEV) checkHelp();

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  Smartphone,
  Users,
  Route,
  ShieldCheck,
  CreditCard,
  Wrench,
  Scale,
  BookOpen,
};

export const iconFor = (name: string): LucideIcon => ICONS[name] ?? BookOpen;

export {
  allArticles,
  articleHref,
  assertHelpIntegrity,
  coverageOf,
  findArticle,
  findCategory,
  helpCategories,
  isUntranslated,
  resolveRef,
  type HelpCoverage,
  type Located,
} from "./resolve";
