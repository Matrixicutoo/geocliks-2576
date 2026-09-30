import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  Archive,
  Link2,
  FileStack,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  StickyNote,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { PageTitle } from "../components/page-title";
import { formatStamp } from "../components/evidence-card";
import { PhotoStrip } from "../components/photo-strip";
import { PhotoDrawer } from "../components/photo-drawer";
import { EvidenceMap, type MapPin as EvidenceMapPin } from "../components/evidence-map";
import { AssignCrewDialog } from "../components/assign-crew-dialog";
import { ProjectNote } from "../components/project-note";
import { useDestroyProject, useProject, useRemoveProject } from "../queries/projects";
import { usePhotos } from "../queries/photos";
import { useTeam, useAssignments } from "../queries/team";
import { useOrg } from "../queries/orgs";
import { type TKey, useT } from "../lib/i18n";
import { canManageWorkspace, canWriteJobNote } from "../lib/roles";

/** The job's action buttons, one look for all three. */
const ACTION =
  "mono inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-ink-2 px-3 py-2 text-[10.5px] uppercase tracking-widest text-chalk transition-colors hover:border-amber hover:text-amber";

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
    const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const archive = useRemoveProject();
  const destroy = useDestroyProject();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  // Field crews work inside projects; only manager and above archive or delete them.
  const canManage = canManageWorkspace(org.data?.role);
  // Writing the crew's note is the office tier, one rung wider than archiving the job.
  const canWriteNote = canWriteJobNote(org.data?.role);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteEditing, setNoteEditing] = useState(false);

  const assigned = new Set(assignments.data?.map((a) => a.userId) ?? []);
  const assignedRows = (team.data ?? []).filter((row) => assigned.has(row.userId));

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

      {/* The job's working actions sit first, above its photos: the office opens a job to tell
          the crew something, put people on it or send it to the client, far more often than to
          read its code and counts. */}
      <div className="flex flex-wrap items-center gap-2">
        {canWriteNote && (
          <button
            type="button"
            onClick={() => setNoteEditing(true)}
            className={ACTION}
          >
            <StickyNote className="size-3.5" />
            {project.data?.notes?.trim() ? t("project.noteEdit") : t("project.noteAdd")}
          </button>
        )}
        {canManage && (
          <button type="button" onClick={() => setAssignOpen(true)} className={ACTION}>
            <UserPlus className="size-3.5" /> {t("assign.add")}
            {assignedRows.length > 0 && (
              <span className="rounded-[4px] bg-amber/15 px-1.5 text-amber">
                {assignedRows.length}
              </span>
            )}
          </button>
        )}
        <Link to={`/app/share?project=${encodeURIComponent(id)}`} className={ACTION}>
          <Link2 className="size-3.5" /> {t("project.shareClient")}
        </Link>

        {/* Who is on the job, at a glance. Adding and removing happens in the Assign popup. */}
        {assignedRows.length > 0 && (
          <div
            className="ml-auto flex items-center -space-x-1.5"
            title={assignedRows.map((row) => row.user?.name ?? row.user?.email).join(", ")}
          >
            <Users className="mr-3 size-3.5 text-fog" aria-label={t("project.crewAccess")} />
            {assignedRows.slice(0, 6).map((row) =>
              row.user?.image ? (
                <img
                  key={row.id}
                  src={row.user.image}
                  alt={row.user?.name ?? ""}
                  className="size-7 rounded-full border-2 border-ink object-cover"
                />
              ) : (
                <span
                  key={row.id}
                  className="mono grid size-7 place-items-center rounded-full border-2 border-ink bg-ink-3 text-[9.5px] text-amber"
                >
                  {(row.user?.name ?? row.user?.email ?? "?").slice(0, 2).toUpperCase()}
                </span>
              ),
            )}
            {assignedRows.length > 6 && (
              <span className="mono grid size-7 place-items-center rounded-full border-2 border-ink bg-ink-3 text-[9.5px] text-fog">
                +{assignedRows.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      {/* The note the crew reads on site, shown as it will read on their phone. Its own button
          lives in the action row above, so the inline "add" link is dropped here. */}
      {!project.isLoading && (
        <ProjectNote
          projectId={id}
          notes={project.data?.notes}
          canEdit={canWriteNote}
          onError={setNoteError}
          editing={noteEditing}
          onEditingChange={setNoteEditing}
          hideAdd
        />
      )}
      {noteError && <p className="mono mt-2 text-[11.5px] text-alert">{noteError}</p>}

      {/* This job's photos, in the same sideways strip Teamspace uses — tag chips, search and
          bulk delete included — pinned to this project. */}
      <div className="mt-4">
        <PhotoStrip
          board="field"
          projectId={id}
          title={t("project.evidenceCount", { n: photos.data?.total ?? 0 })}
        />
      </div>

      {/* The site, with the map given the width of the page instead of a 200px sidebar box. */}
      <section className="mt-4 rounded-[12px] border border-line bg-ink-2">
        <header className="flex flex-wrap items-start gap-x-6 gap-y-2 border-b border-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="label flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {t("project.site")}
            </p>
            <p className="mono mt-1.5 text-[11px] leading-relaxed text-fog">
              {[project.data?.locationLabel, project.data?.address ?? t("project.noAddress")]
                .filter(Boolean)
                .join(" · ")}
              <br />
              {project.data?.lat != null && project.data?.lng != null
                ? `${project.data.lat.toFixed(5)}, ${project.data.lng.toFixed(5)}`
                : t("project.noCoords")}
            </p>
          </div>
          {/* Whoever to call about this job. A tel: link, so it dials from a phone and the
              office can still copy it off a desktop. The dial string stops at the first
              letter, so an "ext 4" stays visible but never gets dialled onto the end. */}
          {project.data?.contactPhone && (
            <a
              href={`tel:${project.data.contactPhone.split(/[a-z]/i)[0].replace(/[^\d+]/g, "")}`}
              className="mono inline-flex items-center gap-1.5 self-center text-[11px] text-fog transition-colors hover:text-amber"
            >
              <Phone className="size-3.5 shrink-0" /> {project.data.contactPhone}
            </a>
          )}
          {/* Route to the job site itself, not to a photo. Coordinates win when the site has
              them; otherwise the typed address is good enough for Maps to resolve. */}
          {siteDestination && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteDestination)}`}
              target="_blank"
              rel="noreferrer"
              className="mono inline-flex items-center gap-2 self-center rounded-[8px] bg-amber px-4 py-2 text-[10.5px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-amber-deep"
            >
              <Navigation className="size-3.5" />
              {t("photo.directions")}
            </a>
          )}
        </header>
        <div className="p-4">
          <EvidenceMap
            pins={(photos.data?.photos ?? []) as unknown as EvidenceMapPin[]}
            onSelect={setOpenPhoto}
            className="h-[420px] lg:h-[520px]"
          />
        </div>
      </section>

      {/* The job's numbers close the page: reference, not the first thing anyone needs. */}
      {project.isLoading ? (
        <div className="mt-4 h-20 animate-pulse rounded-[12px] border border-line bg-ink-2" />
      ) : (
        <div className="mt-4 grid gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
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
      {project.data?.firstPhotoAt && (
        <p className="mono mt-2 text-[10.5px] text-fog">
          {t("project.first", { stamp: formatStamp(project.data.firstPhotoAt).slice(0, 16) })}
          {" · "}
          {t("projects.last", {
            stamp: formatStamp(project.data.lastPhotoAt ?? project.data.firstPhotoAt).slice(0, 16),
          })}
        </p>
      )}

      {assignOpen && canManage && (
        <AssignCrewDialog
          projectId={id}
          projectName={project.data?.name}
          onClose={() => setAssignOpen(false)}
        />
      )}

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
