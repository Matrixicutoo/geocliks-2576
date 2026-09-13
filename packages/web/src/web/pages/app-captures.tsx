import { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EvidenceCard, EvidenceSkeleton } from "../components/evidence-card";
import { EmptyState } from "../components/empty-state";
import { PageTitle } from "../components/page-title";
import { PhotoDrawer } from "../components/photo-drawer";
import { useInfinitePhotos } from "../queries/photos";
import { useOrg } from "../queries/orgs";
import { cn } from "../lib/utils";
import { useInfiniteScroll } from "../lib/use-infinite-scroll";
import { useT } from "../lib/i18n";

const KINDS = ["photo", "video"] as const;

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
  const sentinel = useInfiniteScroll({
    hasMore: Boolean(photos.hasNextPage),
    loading: photos.isFetchingNextPage,
    onLoadMore: photos.fetchNextPage,
  });

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
            {t(value === "photo" ? "mine.photos" : "mine.videos")}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {photos.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EvidenceSkeleton key={i} />
            ))}
          </div>
        ) : loaded.length === 0 ? (
          <EmptyState icon={ImageOff} title={t("mine.title")} hint={t("mine.emptyBody")} />
        ) : (
          <>
            <p className="label mb-3">{t("teamspace.newestFirst", { n: total })}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {loaded.map((photo) => (
                <EvidenceCard key={photo.id} photo={photo} onClick={() => setOpenPhoto(photo.id)} />
              ))}
            </div>
            {/* Scrolling near this pulls the next page in. */}
            <div ref={sentinel} className="h-px" />
            {photos.isFetchingNextPage && (
              <div className="mono mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-fog">
                <Loader2 className="size-3.5 animate-spin" /> {t("common.loading")}
              </div>
            )}
          </>
        )}
      </div>

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
