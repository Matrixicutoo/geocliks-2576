/**
 * Quebec French catalog. Composition only — mirrors the English running order.
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

export const frCategories: Category[] = [
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
