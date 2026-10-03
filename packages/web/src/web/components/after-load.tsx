import { type ReactNode, Suspense, useEffect, useState } from "react";

/**
 * Renders its children only once the page has finished loading.
 *
 * For lazily imported extras that nobody needs in the first second — the
 * assistant panel and the crew chat dock. Imported eagerly, they put the AI SDK,
 * zod and the Google Maps bindings (via the photo drawer) into the entry bundle
 * of every page, the marketing site included. Imported lazily but mounted at
 * once, their chunks would still be fetched alongside the hero image and compete
 * with it for a phone's bandwidth. Waiting for `load` puts them behind everything
 * the first paint needs.
 */
export function AfterLoad({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      timer = setTimeout(() => setReady(true), 0);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;
  return <Suspense fallback={null}>{children}</Suspense>;
}
