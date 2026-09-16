import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { FolderKanban, Plus, Loader2, X, Trash2, Archive, Users } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import {
  useCreateProject,
  useDestroyProject,
  useProjects,
  useRemoveProject,
} from "../queries/projects";
import { useOrg } from "../queries/orgs";
import { useMemberProjects } from "../queries/team";
import { AssignCrewDialog } from "../components/assign-crew-dialog";
import { formatStamp } from "../components/evidence-card";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";
import { canManageWorkspace } from "../lib/roles";
import { useInfiniteScroll } from "../lib/use-infinite-scroll";

/** Project cards revealed per scroll batch. */
const PAGE = 12;

const CATEGORIES = [
  "construction",
  "fiber",
  "telecom",
  "hvac",
  "property",
  "cleaning",
  "security",
  "delivery",
  "retail",
  "roofing",
  "insurance",
];

const STATUS_LABEL: Record<string, TKey> = {
  active: "projects.status.active",
  on_hold: "projects.status.on_hold",
  complete: "projects.status.complete",
  archived: "projects.status.archived",
};

const STATUS_STYLE: Record<string, string> = {
  active: "border-verified/40 bg-verified/10 text-verified",
  on_hold: "border-amber/40 bg-amber/10 text-amber",
  complete: "border-sky/40 bg-sky/10 text-sky",
  archived: "border-line bg-ink-3 text-fog",
};

export function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateProject();
  const t = useT();
  const [form, setForm] = useState({
    name: "",
    code: "",
    client: "",
    contactPhone: "",
    address: "",
    locationLabel: "",
    category: "construction",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          try {
            await create.mutateAsync({
              name: form.name,
              code: form.code || null,
              client: form.client || null,
              contactPhone: form.contactPhone || null,
              address: form.address || null,
              locationLabel: form.locationLabel || null,
              category: form.category,
              notes: form.notes || null,
            });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
        className="w-full max-w-lg rounded-[12px] border border-line bg-ink-2"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-display text-[15px] font-semibold">{t("projects.dialogTitle")}</p>
          <button type="button" onClick={onClose} className="text-fog hover:text-chalk">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {/* The phone sits next to the client it belongs to, and goes out as type=tel so a
              phone keyboard opens on a dialpad instead of a qwerty. */}
          {(
            [
              ["name", "projects.fName", "Ridgeline FTTH — Phase 2", true, "text"],
              ["code", "projects.fCode", "FTTH-2214", false, "text"],
              ["client", "projects.fClient", "Northline Communications", false, "text"],
              ["contactPhone", "projects.fPhone", "(303) 555-0142 ext 4", false, "tel"],
              ["locationLabel", "projects.fLocation", "Ridgeline Dr / Elm", false, "text"],
            ] as [keyof typeof form, TKey, string, boolean, "text" | "tel"][]
          ).map(([key, label, placeholder, required, type]) => (
            <label key={key} className="block">
              <span className="label">{t(label)}</span>
              <input
                aria-label={t(label)}
                type={type}
                inputMode={type === "tel" ? "tel" : undefined}
                autoComplete={type === "tel" ? "tel" : undefined}
                required={required}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="mt-1.5 w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber"
              />
            </label>
          ))}

          <label className="block sm:col-span-2">
            <span className="label">{t("projects.fAddress")}</span>
            <input
              aria-label={t("projects.fAddress")}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="1420 Ridgeline Dr, Denver, CO 80211"
              className="mt-1.5 w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber"
            />
          </label>

          <label className="block">
            <span className="label">{t("projects.fTrade")}</span>
            <select
              aria-label={t("projects.fTrade")}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mono mt-1.5 w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[12px] uppercase tracking-widest text-chalk outline-none focus:border-amber"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="label">{t("projects.fNotes")}</span>
            <textarea
              aria-label={t("projects.fNotes")}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="48ct backbone splice, 3 handholes. As-built package due Friday."
              className="mt-1.5 w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber"
            />
          </label>

          {error && (
            <p className="rounded-[8px] sm:col-span-2 border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="mono rounded-[8px] border border-line px-3 py-2 text-[10.5px] uppercase tracking-widest text-fog hover:text-chalk"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-[8px] mono flex items-center gap-2 bg-amber px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-ink hover:bg-amber-deep disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {t("projects.create")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProjectsPage() {
  const projects = useProjects();
  const t = useT();
  const org = useOrg();
  // Field crews work inside projects; only manager and above create or delete them.
  const canManage = canManageWorkspace(org.data?.role);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  // One read of every assignment in the workspace feeds the crew count on each row.
  const memberProjects = useMemberProjects();
  const destroy = useDestroyProject();
  const archive = useRemoveProject();
  /**
   * Cover photos are heavy, so the list reveals a screenful at a time and grows as you scroll
   * rather than painting every project's image at once.
   */
  const [shown, setShown] = useState(PAGE);
  const all = projects.data ?? [];
  const visible = all.slice(0, shown);
  const showMore = useCallback(() => setShown((n) => n + PAGE), []);
  const crewCount = (projectId: string) =>
    (memberProjects.data ?? []).filter((row) => row.projectId === projectId).length;
  const sentinel = useInfiniteScroll({
    hasMore: shown < all.length,
    loading: projects.isLoading,
    onLoadMore: showMore,
  });
  // A filter or a deletion can shrink the list under what is already revealed; start over.
  useEffect(() => setShown(PAGE), [all.length]);

  return (
    <DashboardShell
      title={t("projects.title")}
      subtitle={t("projects.subtitle")}
      actions={
        canManage ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-[8px] mono flex items-center gap-2 bg-amber px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep"
          >
            <Plus className="size-3.5" /> {t("projects.new")}
          </button>
        ) : undefined
      }
    >
      {projects.isLoading ? (
        <div className="space-y-px overflow-hidden rounded-[12px] border border-line bg-ink-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-ink-3/50" />
          ))}
        </div>
      ) : (projects.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t("projects.empty.title")}
          hint={t("projects.empty.hint")}
        />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-ink-2">
          <ul className="divide-y divide-line">
            {visible.map((project) => (
              <li key={project.id} className="transition-colors hover:bg-ink-3/40">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Link
                    to={`/app/projects/${project.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-[8px] border border-line bg-ink-3">
                      {project.coverUrl ? (
                        <img
                          src={project.coverUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover opacity-85"
                        />
                      ) : (
                        <span className="grid h-full place-items-center blueprint-fine">
                          <FolderKanban className="size-4 text-fog" />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-semibold text-chalk">
                          {project.name}
                        </span>
                        {project.code && (
                          <span className="mono shrink-0 text-[10px] tracking-widest text-amber">
                            {project.code}
                          </span>
                        )}
                      </span>
                      <span className="mono flex flex-wrap gap-x-3 text-[10.5px] text-fog">
                        {project.client && <span className="truncate">{project.client}</span>}
                        <span>{t("projects.photosN", { n: project.photoCount })}</span>
                        {project.lastPhotoAt && (
                          <span>
                            {t("projects.last", {
                              stamp: formatStamp(project.lastPhotoAt).slice(0, 16),
                            })}
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>

                  <span
                    className={cn(
                      "rounded-[6px] mono shrink-0 border px-1.5 py-0.5 text-[9.5px] uppercase tracking-widest",
                      STATUS_STYLE[project.status],
                    )}
                  >
                    {t(STATUS_LABEL[project.status] ?? "projects.status.active")}
                  </span>

                  {/* Who works this job. Field crews only see the projects they are on, so this
                      is the control that actually decides their view. */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setAssignFor(project.id)}
                      className="mono inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-fog transition-colors hover:border-amber hover:text-amber"
                    >
                      <Users className="size-3.5" /> {t("assign.crew")}
                      <span className="text-chalk">{crewCount(project.id)}</span>
                    </button>
                  )}

                  {canManage && project.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() => {
                        setRowError(null);
                        archive.mutate({ id: project.id });
                      }}
                      className="mono inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-fog transition-colors hover:border-amber/50 hover:text-chalk"
                    >
                      <Archive className="size-3" /> {t("project.archive")}
                    </button>
                  )}

                  {canManage && (
                    <button
                      type="button"
                      aria-label={t("project.delete")}
                      onClick={() => {
                        setRowError(null);
                        setConfirmId(confirmId === project.id ? null : project.id);
                      }}
                      className="rounded-[12px] shrink-0 border border-line p-1.5 text-fog transition-colors hover:border-alert/50 hover:text-alert"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                {confirmId === project.id && canManage && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-alert/40 bg-alert/10 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="mono text-[11px] uppercase tracking-widest text-alert">
                        {t("project.deleteConfirm")}
                      </p>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-fog">
                        {t("project.deleteHint")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="mono rounded-[8px] border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-fog hover:text-chalk"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="button"
                      disabled={destroy.isPending}
                      onClick={async () => {
                        setRowError(null);
                        try {
                          await destroy.mutateAsync({ id: project.id });
                          setConfirmId(null);
                        } catch (err) {
                          setRowError(err instanceof Error ? err.message : String(err));
                        }
                      }}
                      className="rounded-[6px] mono flex items-center gap-1.5 bg-alert px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-chalk disabled:opacity-60"
                    >
                      {destroy.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      {t("common.confirm")}
                    </button>
                    {rowError && (
                      <p className="mono w-full text-[11px] text-alert">{rowError}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Scrolling near this reveals the next batch of projects. */}
      <div ref={sentinel} className="h-px" />
      {shown < all.length && (
        <div className="mono mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-fog">
          <Loader2 className="size-3.5 animate-spin" /> {t("common.loading")}
        </div>
      )}

      {open && canManage && <NewProjectDialog onClose={() => setOpen(false)} />}
      {assignFor && canManage && (
        <AssignCrewDialog
          projectId={assignFor}
          projectName={all.find((p) => p.id === assignFor)?.name}
          onClose={() => setAssignFor(null)}
        />
      )}
    </DashboardShell>
  );
}
