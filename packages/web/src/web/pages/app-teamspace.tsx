import { useState } from "react";
import { Link } from "wouter";
import {
  Camera,
  ShieldCheck,
  Users,
  MapPin,
  Search,
  ImageOff,
  Loader2,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { StatTile } from "../components/stat-tile";
import { EvidenceCard, EvidenceSkeleton } from "../components/evidence-card";
import { EmptyState } from "../components/empty-state";
import { PageTitle } from "../components/page-title";
import { PhotoDrawer } from "../components/photo-drawer";
import { usePhotos, usePhotoStats, useRemovePhotos } from "../queries/photos";
import { useProjects } from "../queries/projects";
import { useOrg, useUpdateOrg } from "../queries/orgs";
import { useSeedDemo } from "../queries/demo";
import { cn } from "../lib/utils";
import { useT, type TKey } from "../lib/i18n";
import { canManageWorkspace } from "../lib/roles";

const TAGS = [
  "all",
  "arrival",
  "before",
  "general",
  "after",
  "issue",
  "departure",
  "pickup",
  "delivery",
] as const;

const TAG_LABELS: Record<(typeof TAGS)[number], TKey> = {
  all: "tag.all",
  arrival: "tag.arrival",
  before: "tag.before",
  general: "tag.work",
  after: "tag.after",
  issue: "tag.issue",
  departure: "tag.departure",
  pickup: "tag.pickup",
  delivery: "tag.delivery",
};

export default function TeamspacePage() {
  const t = useT();
  const [tag, setTag] = useState<(typeof TAGS)[number]>("all");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const removeMany = useRemovePhotos();
  const org = useOrg();
  const updateOrg = useUpdateOrg();
  const [bizName, setBizName] = useState("");
  const [hideNamePrompt, setHideNamePrompt] = useState(false);
  const canRenameOrg = org.data?.role === "owner" || org.data?.role === "admin";
  /**
   * Google sign-ups never see the sign-up form, and accounts that predate the business-name field
   * still carry the auto-provisioned default. Offer the name once here rather than blocking them.
   */
  const askOrgName = Boolean(org.data?.needsName) && canRenameOrg && !hideNamePrompt;
  /** Field crews capture evidence; only manager and above can remove it. */
  const canDelete = canManageWorkspace(org.data?.role);

  const stats = usePhotoStats();
  const projects = useProjects();
  const photos = usePhotos({
    tag: tag === "all" ? null : tag,
    projectId,
    search: search.trim() ? search.trim() : null,
    limit: 60,
  });
  const seed = useSeedDemo();

  // A brand-new workspace stays empty until the owner asks for sample data — real evidence only.
  const workspaceEmpty =
    !photos.isLoading &&
    photos.data?.total === 0 &&
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

      {askOrgName && (
        <div className="rounded-[12px] mb-4 border border-amber/50 bg-amber/10 p-4">
          <p className="mono text-[12px] uppercase tracking-widest text-amber">
            {t("teamspace.nameOrgTitle")}
          </p>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-chalk">
            {t("teamspace.nameOrgBody")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              aria-label={t("profile.businessName")}
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder={t("profile.businessName")}
              className="w-64 rounded-[8px] border border-line bg-ink-2 px-3 py-2 text-[13px] text-chalk outline-none placeholder:text-fog/60 focus:border-amber"
            />
            <button
              type="button"
              disabled={bizName.trim().length < 2 || updateOrg.isPending}
              onClick={() =>
                updateOrg.mutate(
                  { name: bizName.trim() },
                  { onSuccess: () => setHideNamePrompt(true) },
                )
              }
              className="rounded-[8px] mono bg-amber px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-on-amber disabled:opacity-60"
            >
              {t("teamspace.nameOrgSave")}
            </button>
            <button
              type="button"
              onClick={() => setHideNamePrompt(true)}
              className="mono rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog hover:text-chalk"
            >
              {t("teamspace.nameOrgDismiss")}
            </button>
          </div>
        </div>
      )}

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

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TAGS.map((tag_) => (
          <button
            key={tag_}
            type="button"
            onClick={() => setTag(tag_)}
            className={cn(
              "rounded-[6px] mono border px-2.5 py-1.5 text-[10.5px] uppercase tracking-widest transition-colors",
              tag === tag_
                ? "border-amber/60 bg-amber/10 text-amber"
                : "border-line text-fog hover:text-chalk",
            )}
          >
            {t(TAG_LABELS[tag_])}
          </button>
        ))}

        <select
          aria-label={t("teamspace.projectFilter")}
          value={projectId ?? ""}
          onChange={(e) => setProjectId(e.target.value || null)}
          className="mono rounded-[8px] border border-line bg-ink-2 px-2.5 py-1.5 text-[10.5px] uppercase tracking-widest text-chalk outline-none focus:border-amber"
        >
          <option value="">{t("common.allProjects")}</option>
          {projects.data?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <label className="ml-auto flex items-center gap-2 rounded-[12px] border border-line bg-ink-2 px-2.5 py-1.5">
          <Search className="size-3.5 text-fog" />
          <input
            aria-label={t("teamspace.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("teamspace.searchPlaceholder")}
            className="mono w-52 bg-transparent text-[11px] text-chalk outline-none placeholder:text-fog/60"
          />
        </label>
      </div>

      {/* Grid */}
      <div className="mt-4">
        {photos.isLoading || seed.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <EvidenceSkeleton key={i} />
            ))}
          </div>
        ) : (photos.data?.photos.length ?? 0) === 0 ? (
          <EmptyState
            icon={ImageOff}
            title={t("teamspace.noMatch.title")}
            hint={t("teamspace.noMatch.body")}
            action={
              seed.isPending ? (
                <span className="mono flex items-center gap-2 text-[11px] text-fog">
                  <Loader2 className="size-3.5 animate-spin" /> {t("teamspace.loadingField")}
                </span>
              ) : workspaceEmpty ? (
                <button
                  type="button"
                  onClick={() => seed.mutate({})}
                  className="mono rounded-full border border-line px-3 py-1.5 text-[11px] uppercase tracking-widest text-fog transition hover:border-amber hover:text-amber"
                >
                  {t("teamspace.loadSample")}
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="label">{t("teamspace.newestFirst", { n: photos.data?.total ?? 0 })}</p>
              <div className="flex items-center gap-2">
                {canDelete && selectMode && selected.length > 0 && (
                  <>
                    <span className="mono text-[11px] uppercase tracking-widest text-amber">
                      {t("teamspace.selectedN", { n: selected.length })}
                    </span>
                    <button
                      type="button"
                      disabled={removeMany.isPending}
                      onClick={() => {
                        removeMany.mutate({ ids: selected }, { onSuccess: () => setSelected([]) });
                      }}
                      className="rounded-[8px] mono flex items-center gap-1.5 border border-alert/60 bg-alert/10 px-3 py-1.5 text-[11px] uppercase tracking-widest text-alert hover:bg-alert/20 disabled:opacity-60"
                    >
                      {removeMany.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      {t("teamspace.deleteSelected")}
                    </button>
                  </>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectMode((v) => !v);
                      setSelected([]);
                    }}
                    className="mono rounded-[8px] border border-line px-3 py-1.5 text-[11px] uppercase tracking-widest text-fog hover:text-chalk"
                  >
                    {selectMode ? t("teamspace.clearSelection") : t("teamspace.select")}
                  </button>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {photos.data?.photos.map((photo) => (
                <EvidenceCard
                  key={photo.id}
                  photo={photo}
                  shareable={!selectMode}
                  selectable={selectMode}
                  selected={selected.includes(photo.id)}
                  onClick={() => {
                    if (!selectMode) {
                      setOpenPhoto(photo.id);
                      return;
                    }
                    setSelected((prev) =>
                      prev.includes(photo.id)
                        ? prev.filter((x) => x !== photo.id)
                        : [...prev, photo.id],
                    );
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
