import { Link } from "wouter";
import { Camera, ImageOff, Loader2, MapPin, ShieldCheck, Users } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { StatTile } from "../components/stat-tile";
import { EmptyState } from "../components/empty-state";
import { PageTitle } from "../components/page-title";
import { PhotoStrip } from "../components/photo-strip";
import { NotesPanel } from "../components/notes-panel";
import { ProjectsPanel } from "../components/projects-panel";
import { SetupChecklist } from "../components/setup-checklist";
import { usePhotoStats } from "../queries/photos";
import { useProjects } from "../queries/projects";
import { useOrg } from "../queries/orgs";
import { useSeedDemo } from "../queries/demo";
import { canUseNotes } from "../lib/roles";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

/**
 * Teamspace — the field dashboard.
 *
 * Three bands, top to bottom: the numbers, the live photo feed, then the day's two lists side
 * by side. The feed used to be a page-filling grid that you scrolled past to reach anything
 * else; it is a single sideways-scrolling strip now (`PhotoStrip`, which also carries the tag
 * filters, search and the select-and-delete that grid had), so the lists that actually get
 * worked — projects on the left, office notes on the right — sit above the fold.
 *
 * The notes column draws nothing at all for a field member: notes hold customer phone numbers
 * and addresses, and both the panel and the server stop below dispatcher.
 */
export default function TeamspacePage() {
  const t = useT();
  const org = useOrg();
  const stats = usePhotoStats();
  const projects = useProjects();
  const seed = useSeedDemo();
  // Field members get no notes column at all, so the row must not hold half a page of air.
  const showNotes = canUseNotes(org.data?.role);

  // A brand-new workspace stays empty until the owner asks for sample data — real evidence only.
  const workspaceEmpty =
    !stats.isLoading &&
    (stats.data?.photos ?? 0) === 0 &&
    !projects.isLoading &&
    (projects.data?.length ?? 0) === 0;

  const verifiedPct = stats.data?.photos
    ? Math.round((stats.data.verified / stats.data.photos) * 100)
    : 0;

  return (
    <DashboardShell
      title={t("teamspace.title")}
      subtitle={t("teamspace.pageSubtitle")}
      actions={
        <Link
          to="/app/reports"
          className="rounded-[8px] mono bg-amber px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep"
        >
          {t("teamspace.buildReport")}
        </Link>
      }
    >
      <PageTitle name={org.data?.org.name} section={t("teamspace.title")} />

      {/* Above the stats on purpose: a workspace with nothing in it has nothing to count yet. */}
      <SetupChecklist />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Camera}
          label={t("teamspace.statPhotos")}
          value={stats.data?.photos ?? 0}
          sub={t("teamspace.statPhotosSub", { n: stats.data?.photosThisMonth ?? 0 })}
          loading={stats.isLoading}
        />
        <StatTile
          icon={ShieldCheck}
          label={t("teamspace.statSeal")}
          value={`${verifiedPct}%`}
          accent="verified"
          sub={t("teamspace.statSealSub", {
            n: stats.data?.verified ?? 0,
            total: stats.data?.photos ?? 0,
          })}
          loading={stats.isLoading}
        />
        <StatTile
          icon={MapPin}
          label={t("teamspace.statGeotagged")}
          value={stats.data?.located ?? 0}
          accent="sky"
          sub={t("teamspace.statGeoSub")}
          loading={stats.isLoading}
        />
        <StatTile
          icon={Users}
          label={t("teamspace.statContributors")}
          value={stats.data?.contributors ?? 0}
          accent="amber"
          sub={t("teamspace.statContributorsSub", { n: projects.data?.length ?? 0 })}
          loading={stats.isLoading}
        />
      </div>

      {/* Capture activity */}
      <div className="mt-4 rounded-[12px] border border-line bg-ink-2 p-4">
        <p className="label">{t("teamspace.activity")}</p>
        {stats.isLoading ? (
          <div className="mt-3 h-16 animate-pulse bg-ink-3" />
        ) : (
          <div className="mt-3 flex h-16 items-end gap-1.5">
            {(stats.data?.byDay ?? []).map((day) => {
              const max = Math.max(...(stats.data?.byDay ?? []).map((d) => d.value), 1);
              return (
                <div key={day.day} className="group relative flex-1">
                  <div
                    className="w-full bg-amber/70 transition-colors group-hover:bg-amber"
                    style={{ height: `${Math.max((day.value / max) * 64, 3)}px` }}
                  />
                  <span className="mono pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-line bg-ink px-1 text-[9px] text-fog opacity-0 group-hover:opacity-100">
                    {day.day} · {day.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* The live feed, one strip deep. */}
      <div className="mt-4">
        {workspaceEmpty ? (
          <EmptyState
            icon={ImageOff}
            title={t("teamspace.noMatch.title")}
            hint={t("teamspace.noMatch.body")}
            action={
              seed.isPending ? (
                <span className="mono flex items-center gap-2 text-[11px] text-fog">
                  <Loader2 className="size-3.5 animate-spin" /> {t("teamspace.loadingField")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => seed.mutate({})}
                  className="mono rounded-full border border-line px-3 py-1.5 text-[11px] uppercase tracking-widest text-fog transition hover:border-amber hover:text-amber"
                >
                  {t("teamspace.loadSample")}
                </button>
              )
            }
          />
        ) : (
          <PhotoStrip board="field" />
        )}
      </div>

      {/* The day's work: the jobs on the left, the office's notes on the right. */}
      <div className={cn("mt-4 grid gap-4", showNotes && "xl:grid-cols-2")}>
        <ProjectsPanel />
        <NotesPanel board="field" />
      </div>
    </DashboardShell>
  );
}
