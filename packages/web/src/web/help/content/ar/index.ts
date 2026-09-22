/**
 * Arabic catalog. Composition only — the running order of the Help Center index.
 * The page direction is handled globally by `web/lib/i18n.tsx`, not here.
 */
import type { Category } from "../../types";
import { gettingStarted } from "./getting-started";
import { mobileApp } from "./mobile-app";
import { teamspace } from "./teamspace";
import { deliveryRoutes } from "./delivery-routes";
import { verify } from "./verify";
import { plansBilling } from "./plans-billing";
import { troubleshoot } from "./troubleshoot";
import { legal } from "./legal";

export const arCategories: Category[] = [
  gettingStarted,
  mobileApp,
  teamspace,
  deliveryRoutes,
  verify,
  plansBilling,
  troubleshoot,
  legal,
];

export {
  gettingStarted,
  mobileApp,
  teamspace,
  deliveryRoutes,
  verify,
  plansBilling,
  troubleshoot,
  legal,
};
