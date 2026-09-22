import { useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, StickyNote, X } from "lucide-react";
import { useSetProjectNote } from "../queries/projects";
import { useT } from "../lib/i18n";

/**
 * A note for the crew, written on the job itself.
 *
 * The field side of this app had the column all along and no way to use it as a message: the
 * text could only be typed into the new-project form, and from then on it showed on the
 * project page in the website and nowhere the crew could see it. So the office wrote the gate
 * code into a job and the man at the gate never read it.
 *
 * This is the same note the delivery side puts on a stop, moved one level up to where the field
 * product keeps a location: a project IS the site. What belongs here is what the address does
 * not say — gate code 4412, park on Elm because the alley is blocked, shoot the riser before it
 * gets boxed in, ask for Nadine at the trailer. The crew's phone shows it on the card for the
 * job and again on the job's photo feed, which is where he is looking when it matters.
 *
 * Deliberately the same component shape as `StopNote`: editable in place, editable after the
 * job is closed (a note corrected the day after a wasted trip is the point), and emptying the
 * box removes it so there is no separate delete to hunt for.
 */
export function ProjectNote({
  projectId,
  notes,
  canEdit,
  onError,
}: {
  projectId: string;
  /** What is on the job now, or null when nobody has written one. */
  notes: string | null | undefined;
  canEdit: boolean;
  onError?: (message: string) => void;
}) {
  const t = useT();
  const setNote = useSetProjectNote();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);

  // Somebody else's edit must not be overwritten by a draft this tab has been sitting on.
  useEffect(() => {
    if (!editing) setValue(notes ?? "");
  }, [notes, editing]);

  const current = (notes ?? "").trim();
  const dirty = value.trim() !== current;

  function close() {
    setEditing(false);
    setValue(notes ?? "");
  }

  async function save() {
    if (!dirty) return close();
    setSaving(true);
    try {
      // An empty box is a removal, and the server's column is nullable for exactly that.
      await setNote.mutateAsync({ id: projectId, notes: value.trim() || null });
      setEditing(false);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="mt-4 flex items-start gap-1.5 border-l-2 border-amber/60 bg-ink-2 px-4 py-3">
        <textarea
          // eslint-disable-next-line jsx-a11y/no-autofocus -- the edit was just asked for.
          autoFocus
          aria-label={t("project.noteLabel")}
          placeholder={t("project.notePlaceholder")}
          value={value}
          maxLength={2000}
          rows={3}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // Enter inside a note is a new line, so saving from the keyboard takes the modifier.
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void save();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
          disabled={saving}
          className="w-full resize-y rounded-[6px] border border-amber bg-ink px-2.5 py-1.5 text-[13.5px] leading-relaxed text-chalk outline-none"
        />
        <button
          type="button"
          aria-label={t("common.save")}
          title={t("common.save")}
          onClick={() => void save()}
          disabled={saving}
          className="mt-0.5 rounded-[6px] border border-line p-1.5 text-fog hover:text-verified disabled:opacity-40"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        </button>
        <button
          type="button"
          aria-label={t("common.cancel")}
          title={t("common.cancel")}
          onClick={close}
          disabled={saving}
          className="mt-0.5 rounded-[6px] border border-line p-1.5 text-fog hover:text-alert disabled:opacity-40"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  // Written already: the note as it will read on the crew's phone, marked as the office's so it
  // is not taken for a description of the work. The pencil is the way back in.
  if (current) {
    return (
      <div className="mt-4 flex items-start gap-2 border-l-2 border-amber/60 bg-ink-2 px-4 py-3">
        <StickyNote className="mt-1 size-3.5 shrink-0 text-amber" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-chalk">
          <span className="mono mr-2 text-[10px] uppercase tracking-widest text-amber">
            {t("project.noteLabel")}
          </span>
          {current}
        </p>
        {canEdit && (
          <button
            type="button"
            aria-label={t("project.noteEdit")}
            title={t("project.noteEdit")}
            onClick={() => setEditing(true)}
            className="mt-0.5 shrink-0 rounded-[6px] p-0.5 text-fog hover:text-amber focus:text-amber focus:outline-none"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Nothing written, and nobody to write it: a crew member sees no empty row at all.
  if (!canEdit) return null;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-fog hover:text-amber focus:text-amber focus:outline-none"
    >
      <Plus className="size-3.5" />
      {t("project.noteAdd")}
    </button>
  );
}
