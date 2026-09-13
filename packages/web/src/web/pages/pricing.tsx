import { useEffect } from "react";
import { SiteFooter } from "../components/site-footer";
import { useT } from "../lib/i18n";
import { Nav, Pricing } from "./index";

/**
 * /pricing — the plans on a page of their own.
 *
 * The home page carries the same section at `/#pricing`, and this reuses that exact component
 * rather than a second copy of the table: a price that only changes in one of two places is
 * worse than no page at all. This exists because `/pricing` is the URL people type, link to and
 * land on from search, and it used to 404.
 */
export default function PricingPage() {
  const t = useT();

  useEffect(() => {
    document.title = `${t("home.nav.pricing")} — GeoCliks`;
  }, [t]);

  // The marketing pages are always light, whatever a signed-in member picked for the app shell
  // on this device. Restore their choice when they leave. Same as the home page.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = "light";
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);

  return (
    <div data-theme="light" className="min-h-screen bg-ink text-chalk">
      <Nav />
      <Pricing numbered={false} />
      <SiteFooter />
    </div>
  );
}
