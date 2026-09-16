import { useState } from "react";
import { Link } from "wouter";
import { FolderKanban, Plus, Search } from "lucide-react";
import { useProjects } from "../queries/projects";
import { useOrg } from "../queries/orgs";
import { NewProjectDialog } from "../pages/app-projects";
import { formatStamp } from "./evidence-card";
import { PanelSearch } from "./panel-search";
import { canManageWorkspace } from "../lib/roles";
import { matchesSearch } from "../lib/search";
import { useT } from "../lib/i18n";

/** How many jobs the dashboard column shows before sending you to the full list. */
const SHOWN = 8;

/**
 * Projects — the left-hand column on the Teamspace dashboard.
 *
 * The jobs with the most recent activity, not all of them: this is a dashboard column, so it
 * stops at eight and hands off to /app/projects, where archiving, crew and deletion live. Rows
 * are deliberately one line of work each — cover, name, code, photo count, last capture — so a
 * manager can see which jobs are moving without opening anything.
 *
 * Search filters the whole list before the eight-row cap, so a job the office is asked about
 * over the phone is reachable even when it is nowhere near the most recent. It runs locally
 * against rows already in hand — no request, no spinner.
 */
export function ProjectsPanel() {
  const t = useT();
  const org = useOrg();
  const projects = useProjects();
  const canManage = canManageWorkspace(org.data?.role);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const all = projects.data ?? [];
  // A job is looked up by whatever the caller on the phone said: the job name, the code off
  // their paperwork, the client, the street, or the kind of work.
  const found = all.filter((project) =>
    matchesSearch(query, {
      text: [
        project.name,
        project.code,
        project.client,
        project.address,
        project.locationLabel,
        project.category,
        project.notes,
      ],
    }),
  );
  const searching = query.trim().length > 0;
  // The eight-row cap applies to the matches, not to the list behind them, so a search can
  // reach a job that sits well below the cut.
  const rows = found.slice(0, SHOWN);

  return (
    /* Capped so the rows scroll inside the card and the header, the search field and the
       view-all footer stay where they were put. */
    <section className="flex max-h-[620px] min-h-[420px] flex-col rounded-[12px] border border-line bg-ink-2">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <p className="font-display text-[15px] font-semibold">{t("projects.title")}</p>
        {canManage && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mono ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber transition-colors hover:text-amber-deep"
          >
            <Plus className="size-3.5" /> {t("projects.new")}
          </button>
        )}
      </header>

      {/* Hidden until there is a list worth narrowing, and held in place while a query is
          active so clearing the last match does not take the field away with it. */}
      {(all.length > 0 || searching) && (
        <PanelSearch value={query} onChange={setQuery} placeholder={t("search.projects")} />
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {projects.isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-ink-3/40" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="grid h-full place-items-center px-6 py-10 text-center">
            <div>
              {searching ? (
                <Search className="mx-auto size-6 text-fog/60" />
              ) : (
                <FolderKanban className="mx-auto size-6 text-fog/60" />
              )}
              <p className="mt-3 text-[13px] text-fog">
                {searching
                  ? t("search.noMatch", { query: query.trim() })
                  : t("projects.empty.hint")}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/app/projects/${project.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-3/40"
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
                      <span className="blueprint-fine grid h-full place-items-center">
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
              </li>
            ))}
          </ul>
        )}
      </div>

      {found.length > SHOWN && (
        <Link
          to="/app/projects"
          className="mono border-t border-line px-4 py-2.5 text-center text-[10.5px] uppercase tracking-widest text-fog transition-colors hover:text-amber"
        >
          {t("projects.viewAll", { n: found.length })}
        </Link>
      )}

      {open && canManage && <NewProjectDialog onClose={() => setOpen(false)} />}
    </section>
  );
}
