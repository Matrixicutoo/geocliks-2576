import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { FolderKanban, Plus, Loader2, X, Trash2, Archive } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import {
  useCreateProject,
  useDestroyProject,
  useProjects,
  useRemoveProject,
} from "../queries/projects";
import { useOrg } from "../queries/orgs";
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

function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateProject();
  const t = useT();
  const [form, setForm] = useState({
    name: "",
    code: "",
    client: "",
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
          {(
            [
              ["name", "projects.fName", "Ridgeline FTTH — Phase 2", true],
              ["code", "projects.fCode", "FTTH-2214", false],
              ["client", "projects.fClient", "Northline Communications", false],
              ["locationLabel", "projects.fLocation", "Ridgeline Dr / Elm", false],
            ] as [keyof typeof form, TKey, string, boolean][]
          ).map(([key, label, placeholder, required]) => (
            <label key={key} className="block">
              <span className="label">{t(label)}</span>
              <input
                aria-label={t(label)}
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
  const [rowError, setRowError] = useState<string | null>(null);
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
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(380px,1fr))]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-[12px] border border-line bg-ink-2"
            />
          ))}
        </div>
      ) : (projects.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t("projects.empty.title")}
          hint={t("projects.empty.hint")}
        />
      ) : (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(380px,1fr))]">
          {visible.map((project) => (
            <div
              key={project.id}
              className="group overflow-hidden rounded-[12px] border border-line bg-ink-2 transition-colors hover:border-amber/50"
            >
              <Link to={`/app/projects/${project.id}`} className="block">
                <div className="relative aspect-[16/9] overflow-hidden bg-ink-3">
                  {project.coverUrl ? (
                    <img
                      src={project.coverUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center blueprint-fine">
                      <FolderKanban className="size-6 text-fog" />
                    </div>
                  )}
                  <span
                    className={cn(
                      "rounded-[6px] mono absolute right-2 top-2 border px-1.5 py-0.5 text-[9.5px] uppercase tracking-widest",
                      STATUS_STYLE[project.status],
                    )}
                  >
                    {t(STATUS_LABEL[project.status] ?? "projects.status.active")}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-[15px] font-semibold leading-snug text-chalk">
                      {project.name}
                    </p>
                    {project.code && (
                      <span className="mono shrink-0 text-[10px] tracking-widest text-amber">
                        {project.code}
                      </span>
                    )}
                  </div>
                  {project.client && <p className="text-[12.5px] text-fog">{project.client}</p>}
                  <div className="mono flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2 text-[10.5px] text-fog">
                    <span>{t("projects.photosN", { n: project.photoCount })}</span>
                    {project.lastPhotoAt && (
                      <span>
                        {t("projects.last", {
                          stamp: formatStamp(project.lastPhotoAt).slice(0, 16),
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {canManage && (
                <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-2">
                  {confirmId === project.id ? (
                    <>
                      <span className="mr-auto text-[11px] leading-tight text-alert">
                        {t("project.deleteConfirm")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="mono rounded-[8px] border border-line px-2.5 py-1 text-[10px] uppercase tracking-widest text-fog hover:text-chalk"
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
                        className="rounded-[6px] mono flex items-center gap-1.5 bg-alert px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-chalk disabled:opacity-60"
                      >
                        {destroy.isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                        {t("common.confirm")}
                      </button>
                    </>
                  ) : (
                    <>
                      {project.status !== "archived" && (
                        <button
                          type="button"
                          onClick={() => {
                            setRowError(null);
                            archive.mutate({ id: project.id });
                          }}
                          className="mono flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1 text-[10px] uppercase tracking-widest text-fog hover:border-amber/50 hover:text-chalk"
                        >
                          <Archive className="size-3" /> {t("project.archive")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setRowError(null);
                          setConfirmId(project.id);
                        }}
                        className="mono flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1 text-[10px] uppercase tracking-widest text-fog hover:border-alert/60 hover:text-alert"
                      >
                        <Trash2 className="size-3" /> {t("project.delete")}
                      </button>
                    </>
                  )}
                </div>
              )}
              {confirmId === project.id && (
                <p className="border-t border-line px-4 py-2 text-[11px] leading-snug text-fog">
                  {t("project.deleteHint")}
                </p>
              )}
              {rowError && confirmId === project.id && (
                <p className="rounded-[8px] border-t border-alert/40 bg-alert/10 px-4 py-2 text-[11.5px] text-alert">
                  {rowError}
                </p>
              )}
            </div>
          ))}
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
    </DashboardShell>
  );
}
