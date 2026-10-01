import { useState } from "react";
import { ImageOff } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EvidenceSkeleton } from "../components/evidence-card";
import { EmptyState } from "../components/empty-state";
import { PageTitle } from "../components/page-title";
import { PhotoDrawer } from "../components/photo-drawer";
import { PhotoRail } from "../components/photo-rail";
import { useInfinitePhotos } from "../queries/photos";
import { useOrg } from "../queries/orgs";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

const KINDS = ["photo", "video", "document"] as const;

/** Slider tile width. 260px keeps one whole tile plus the edge of the next on a phone. */
const TILE = "w-[260px]";
/** Middle of a 260px-wide 4:3 thumbnail (260 × 3/8, plus the card's 1px border). */
const TILE_ARROW_TOP = 98;

/**
 * My captures — the web half of the phone app's personal page.
 *
 * Everything not filed under a project yet: shots taken before signing in, and signed-in
 * captures left on "Unassigned". It is a filter over the photo feed rather than a real
 * auto-created project, so it never eats one of the three projects a free workspace gets.
 *
 * Open to every role, deliberately — a driver has no field access but their own unfiled
 * proof-of-delivery shots are still theirs, and the server already scopes the feed to what
 * each role may see (`visibleProjectIds`): a restricted role gets only their own unfiled work,
 * manager and above get the workspace's. Filing a capture into a project is done in the photo
 * drawer, which simply moves it out of this list.
 */
export default function CapturesPage() {
  const t = useT();
  const org = useOrg();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("photo");
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

  const photos = useInfinitePhotos({ unassigned: true, kind });
  const loaded = photos.data?.pages.flatMap((page) => page.photos) ?? [];
  const total = photos.data?.pages[0]?.total ?? 0;

  return (
    <DashboardShell title={t("mine.title")} subtitle={t("mine.body")}>
      <PageTitle name={org.data?.org.name} section={t("mine.title")} />

      {/* Stills and clips are separate lists here, same split as the phone app. */}
      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            className={cn(
              "rounded-[6px] mono border px-2.5 py-1.5 text-[10.5px] uppercase tracking-widest transition-colors",
              kind === value
                ? "border-amber/60 bg-amber/10 text-amber"
                : "border-line text-fog hover:text-chalk",
            )}
          >
            {t(value === "photo" ? "mine.photos" : value === "video" ? "mine.videos" : "mine.docs")}
          </button>
        ))}
      </div>

      {/* One sideways slider, the same rail Teamspace and project pages use, with bigger tiles
          because the captures are the whole page here rather than a strip above other lists. */}
      <div className="mt-4">
        {photos.isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn(TILE, "shrink-0")}>
                <EvidenceSkeleton />
              </div>
            ))}
          </div>
        ) : loaded.length === 0 ? (
          <EmptyState icon={ImageOff} title={t("mine.title")} hint={t("mine.emptyBody")} />
        ) : (
          <section className="rounded-[12px] border border-line bg-ink-2 p-4">
            <p className="label mb-3">{t("teamspace.newestFirst", { n: total })}</p>
            <PhotoRail
              photos={loaded}
              onOpen={setOpenPhoto}
              hasMore={Boolean(photos.hasNextPage)}
              loadingMore={photos.isFetchingNextPage}
              onLoadMore={() => photos.fetchNextPage()}
              tileClassName={TILE}
              arrowTop={TILE_ARROW_TOP}
            />
          </section>
        )}
      </div>

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
