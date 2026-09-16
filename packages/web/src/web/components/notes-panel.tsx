import { useState } from "react";
import { CalendarDays, MapPin, Phone, Plus, Search, StickyNote } from "lucide-react";
import { NoteDialog, type NoteRow } from "./note-dialog";
import { PanelSearch } from "./panel-search";
import { useNotes, type NoteBoard } from "../queries/notes";
import { useOrg } from "../queries/orgs";
import { canUseNotes } from "../lib/roles";
import { matchesSearch } from "../lib/search";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

/**
 * The notes panel — the right-hand column on the Teamspace and Routes dashboards.
 *
 * Renders nothing at all for a field member or a driver. That is not styling: notes carry
 * customer addresses and phone numbers, the server refuses to list them below dispatcher, and
 * an empty panel with a locked look would only invite the question. `canUseNotes` and the
 * query's `enabled` flag keep the request from firing too.
 *
 * Every row is the whole note: clicking one opens the same popup that wrote it, where archive
 * and delete live.
 *
 * Search covers the contact block as well as the text — a note is usually looked for by the
 * person or the address it concerns, not by its title. It filters the current tab only, so a
 * query that finds nothing open may still have a hit under archived.
 */
export function NotesPanel({ board }: { board: NoteBoard }) {
  const t = useT();
  const org = useOrg();
  const allowed = canUseNotes(org.data?.role);
  const [tab, setTab] = useState<"open" | "archived">("open");
  const notes = useNotes(board, { status: tab, enabled: allowed });
  // null = closed, "new" = writing one, otherwise the note being opened.
  const [open, setOpen] = useState<NoteRow | "new" | null>(null);
  const [query, setQuery] = useState("");

  if (!allowed) return null;

  const all = notes.data ?? [];
  // Everything the office might have to hand: who it concerns, where, when, and how to reach
  // them. The body is in there too, since that is where the detail of a callback ends up.
  const rows = all.filter((note) =>
    matchesSearch(query, {
      text: [
        note.title,
        note.body,
        note.address,
        note.contactName,
        note.contactEmail,
        note.authorName,
      ],
      dates: [note.dueDate],
      phones: [note.contactPhone],
    }),
  );
  const searching = query.trim().length > 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="flex min-h-[420px] flex-col rounded-[12px] border border-line bg-ink-2">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <p className="font-display text-[15px] font-semibold">{t("notes.title")}</p>

        {/* Archived notes stay reachable without cluttering the working list. */}
        <div className="ml-1 flex items-center gap-1">
          {(["open", "archived"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "mono rounded-[6px] px-2 py-1 text-[10px] uppercase tracking-widest transition-colors",
                tab === value ? "bg-ink-3 text-chalk" : "text-fog hover:text-chalk",
              )}
            >
              {t(value === "open" ? "notes.tabOpen" : "notes.tabArchived")}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen("new")}
          className="mono ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber transition-colors hover:text-amber-deep"
        >
          <Plus className="size-3.5" /> {t("notes.add")}
        </button>
      </header>

      {/* Hidden until there is a list worth narrowing — a search box over an empty panel is
          furniture. It stays put once shown, even when a query filters everything out, or
          clearing the last match would take the field away with it. */}
      {(all.length > 0 || searching) && (
        <PanelSearch value={query} onChange={setQuery} placeholder={t("search.notes")} />
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {notes.isLoading ? (
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
                <StickyNote className="mx-auto size-6 text-fog/60" />
              )}
              <p className="mt-3 text-[13px] text-fog">
                {searching
                  ? t("search.noMatch", { query: query.trim() })
                  : t(tab === "open" ? "notes.empty" : "notes.emptyArchived")}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((note) => {
              // A date that has arrived is the only thing this list shouts about.
              const due = note.dueDate && note.dueDate <= today;
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    aria-label={note.title}
                    onClick={() => setOpen(note as NoteRow)}
                    className="block w-full px-4 py-3 text-left transition-colors hover:bg-ink-3/40"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-1 size-2 shrink-0 rounded-full",
                          due ? "bg-amber" : "bg-line",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-chalk">
                          {note.title}
                        </p>
                        {note.body && (
                          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-fog">
                            {note.body}
                          </p>
                        )}

                        {/* The contact block, only the parts that were filled in. */}
                        <div className="mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] uppercase tracking-widest text-fog">
                          {note.dueDate && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1",
                                due && "text-amber",
                              )}
                            >
                              <CalendarDays className="size-3" /> {note.dueDate}
                            </span>
                          )}
                          {note.contactPhone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3" /> {note.contactPhone}
                            </span>
                          )}
                          {note.address && (
                            <span className="inline-flex min-w-0 items-center gap-1">
                              <MapPin className="size-3 shrink-0" />
                              <span className="truncate">{note.address}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {open && (
        <NoteDialog
          board={board}
          note={open === "new" ? null : open}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
