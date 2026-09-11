import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  Archive,
  ImageOff,
  Link2,
  FileStack,
  Loader2,
  MapPin,
  Navigation,
  Trash2,
  Users,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { PageTitle } from "../components/page-title";
import { EvidenceCard, EvidenceSkeleton, formatStamp } from "../components/evidence-card";
import { EmptyState } from "../components/empty-state";
import { PhotoDrawer } from "../components/photo-drawer";
import { EvidenceMap, type MapPin as EvidenceMapPin } from "../components/evidence-map";
import { useDestroyProject, useProject, useRemoveProject } from "../queries/projects";
import { usePhotos } from "../queries/photos";
import { useTeam, useAssignments, useAssignMember } from "../queries/team";
import { useOrg } from "../queries/orgs";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";
import { canManageWorkspace } from "../lib/roles";

const STATUS_LABEL: Record<string, TKey> = {
  active: "projects.status.active",
  on_hold: "projects.status.on_hold",
  complete: "projects.status.complete",
  archived: "projects.status.archived",
};

export default function ProjectPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const org = useOrg();
  const project = useProject(id);
  const photos = usePhotos({ projectId: id, limit: 120 });
  const team = useTeam();
  const assignments = useAssignments(id);
  const assign = useAssignMember();
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const archive = useRemoveProject();
  const destroy = useDestroyProject();
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Field crews work inside projects; only manager and above archive or delete them.
  const canManage = canManageWorkspace(org.data?.role);

  const assigned = new Set(assignments.data?.map((a) => a.userId) ?? []);

  /** Coordinates route exactly; a typed address is the fallback Maps can still resolve. */
  const siteDestination =
    project.data?.lat != null && project.data?.lng != null
      ? `${project.data.lat},${project.data.lng}`
      : (project.data?.address ?? null);

  return (
    <DashboardShell
      title={t("nav.projects")}
      actions={
        <>
          <Link
            to="/app/projects"
            className="mono flex items-center gap-1.5 rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog hover:text-chalk"
          >
            <ArrowLeft className="size-3.5" /> {t("common.allProjects")}
          </Link>
          <Link
            to="/app/reports"
            className="rounded-[8px] mono flex items-center gap-1.5 bg-amber px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-ink hover:bg-amber-deep"
          >
            <FileStack className="size-3.5" /> {t("project.report")}
          </Link>
          {canManage && project.data?.status !== "archived" && (
            <button
              type="button"
              disabled={archive.isPending}
              onClick={() => archive.mutate({ id })}
              className="mono flex items-center gap-1.5 rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog hover:text-chalk disabled:opacity-60"
            >
              <Archive className="size-3.5" /> {t("project.archive")}
            </button>
          )}
          {/* Hard delete only removes the folder — the API detaches photos instead of destroying them. */}
          {canManage && (
            <button
              type="button"
              disabled={destroy.isPending}
              onClick={() => setConfirmDelete(true)}
              className="mono flex items-center gap-1.5 rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog hover:border-alert/60 hover:text-alert disabled:opacity-60"
            >
              <Trash2 className="size-3.5" /> {t("project.delete")}
            </button>
          )}
        </>
      }
    >
      <PageTitle name={project.data?.name} section={t("nav.projects")} />

      {confirmDelete && canManage && (
        <div className="rounded-[8px] mb-4 flex flex-wrap items-center gap-3 border border-alert/50 bg-alert/10 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="mono text-[12px] uppercase tracking-widest text-alert">
              {t("project.deleteConfirm")}
            </p>
            <p className="mt-1 text-[12.5px] text-chalk">{t("project.deleteHint")}</p>
          </div>
          <button
            type="button"
            disabled={destroy.isPending}
            onClick={() => destroy.mutate({ id }, { onSuccess: () => navigate("/app/projects") })}
            className="rounded-[8px] mono flex items-center gap-2 border border-alert/60 bg-alert/15 px-3 py-2 text-[11px] uppercase tracking-widest text-alert hover:bg-alert/25 disabled:opacity-60"
          >
            {destroy.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {t("common.confirm")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="mono rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog hover:text-chalk"
          >
            {t("common.cancel")}
          </button>
        </div>
      )}

      {project.isLoading ? (
        <div className="h-28 animate-pulse rounded-[12px] border border-line bg-ink-2" />
      ) : (
        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["projects.fCode", project.data?.code ?? "—"],
              [
                "project.statusLabel",
                project.data?.status
                  ? t(STATUS_LABEL[project.data.status] ?? "projects.status.active")
                  : "—",
              ],
              ["common.photos", String(project.data?.photoCount ?? 0)],
              ["project.contributors", String(project.data?.contributors ?? 0)],
            ] as [TKey, string][]
          ).map(([label, value]) => (
            <div key={label} className="bg-ink-2 px-4 py-3">
              <p className="label">{t(label)}</p>
              <p className="mono mt-1 text-[15px] text-chalk">{value}</p>
            </div>
          ))}
        </div>
      )}

      {project.data?.notes && (
        <p className="mt-4 border-l-2 border-amber/60 bg-ink-2 px-4 py-3 text-[13.5px] leading-relaxed text-chalk">
          {project.data.notes}
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="label mb-3">{t("project.evidenceCount", { n: photos.data?.total ?? 0 })}</p>
          {photos.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <EvidenceSkeleton key={i} />
              ))}
            </div>
          ) : (photos.data?.photos.length ?? 0) === 0 ? (
            <EmptyState
              icon={ImageOff}
              title={t("project.empty.title")}
              hint={t("project.empty.hint")}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {photos.data?.photos.map((photo) => (
                <EvidenceCard
                  key={photo.id}
                  photo={photo}
                  shareable
                  onClick={() => setOpenPhoto(photo.id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[12px] border border-line bg-ink-2 p-4">
            <p className="label flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {t("project.site")}
            </p>
            <p className="mono mt-2 text-[11px] leading-relaxed text-fog">
              {project.data?.locationLabel ?? "—"}
              <br />
              {project.data?.address ?? t("project.noAddress")}
              <br />
              {project.data?.lat != null && project.data?.lng != null
                ? `${project.data.lat.toFixed(5)}, ${project.data.lng.toFixed(5)}`
                : t("project.noCoords")}
            </p>
            <EvidenceMap
              pins={(photos.data?.photos ?? []) as unknown as EvidenceMapPin[]}
              onSelect={setOpenPhoto}
              zoomControl={false}
              className="mt-3 h-[200px]"
            />
            {/* Route to the job site itself, not to a photo. Coordinates win when the site has
                them; otherwise the typed address is good enough for Maps to resolve. No origin,
                so Maps starts from wherever the person actually is. */}
            {siteDestination && (
              <div className="mt-3 flex justify-center">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteDestination)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mono inline-flex items-center gap-2 rounded-[8px] bg-amber px-4 py-2 text-[10.5px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-amber-deep"
                >
                  <Navigation className="size-3.5" />
                  {t("photo.directions")}
                </a>
              </div>
            )}
            {project.data?.firstPhotoAt && (
              <p className="mono mt-3 border-t border-line pt-2 text-[10.5px] text-fog">
                {t("project.first", { stamp: formatStamp(project.data.firstPhotoAt).slice(0, 16) })}
                <br />
                {t("projects.last", {
                  stamp: formatStamp(project.data.lastPhotoAt ?? project.data.firstPhotoAt).slice(
                    0,
                    16,
                  ),
                })}
              </p>
            )}
          </div>

          <div className="rounded-[12px] border border-line bg-ink-2 p-4">
            <p className="label flex items-center gap-1.5">
              <Users className="size-3.5" /> {t("project.crewAccess")}
            </p>
            <div className="mt-3 space-y-1.5">
              {team.isLoading ? (
                <div className="h-20 animate-pulse bg-ink-3" />
              ) : (
                team.data?.map((row) => {
                  const on = assigned.has(row.userId);
                  return (
                    <button
                      key={row.id}
                      type="button"
                      disabled={assign.isPending}
                      onClick={() =>
                        assign.mutate({
                          projectId: id,
                          userId: row.userId,
                          assigned: !on,
                        })
                      }
                      className={cn(
                        "rounded-[6px] flex w-full items-center justify-between border px-2.5 py-1.5 text-left text-[12px] transition-colors disabled:opacity-60",
                        on
                          ? "border-verified/40 bg-verified/10 text-chalk"
                          : "border-line text-fog hover:text-chalk",
                      )}
                    >
                      <span className="truncate">{row.user?.name ?? row.user?.email}</span>
                      <span className="mono text-[9.5px] uppercase tracking-widest">
                        {on ? t("project.on") : t("project.off")}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <Link
              to="/app/share"
              className="mono mt-3 flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-2 text-[10.5px] uppercase tracking-widest text-chalk hover:border-amber/60"
            >
              <Link2 className="size-3.5" /> {t("project.shareClient")}
            </Link>
          </div>
        </aside>
      </div>

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
