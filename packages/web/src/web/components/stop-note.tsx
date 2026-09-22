import { useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, StickyNote, X } from "lucide-react";
import { useUpdateStop } from "../queries/routes";
import { useT } from "../lib/i18n";

/**
 * A note for the driver, written on the stop itself.
 *
 * The office knows things the address does not say: buzz 12, ring the loading bell, the parcel
 * goes behind the gate, ask for Nadine. Until now the only way to pass that on was a phone call
 * at the moment the driver was already outside, so this rides along with the stop instead: the
 * driver's phone shows it on the card for the delivery he is on, which is exactly when it is
 * worth reading.
 *
 * Kept editable after the run starts, and after the stop closes. A dispatcher re-reads a note
 * the day after a failed drop and wants to correct it for next time, and the note is not part of
 * the delivery record the way the address and the photo are.
 *
 * Emptying the box removes the note - there is no separate delete to find.
 */
export function StopNote({
  stopId,
  notes,
  canEdit,
  compact,
  onError,
}: {
  stopId: string;
  /** What is on the stop now, or null when nobody has written one. */
  notes: string | null | undefined;
  canEdit: boolean;
  /** Tighter type for the popup's list, which is a denser row than the run page's. */
  compact?: boolean;
  onError?: (message: string) => void;
}) {
  const t = useT();
  const updateStop = useUpdateStop();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);

  // Somebody else's edit, or a reorder of the list, must not be overwritten by a stale draft.
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
      await updateStop.mutateAsync({ stopId, notes: value.trim() || null });
      setEditing(false);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-start gap-1.5">
        <textarea
          // eslint-disable-next-line jsx-a11y/no-autofocus -- the edit was just asked for.
          autoFocus
          aria-label={t("routes.stop.noteLabel")}
          placeholder={t("routes.stop.notePlaceholder")}
          value={value}
          maxLength={500}
          rows={2}
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
          className="w-full resize-y rounded-[6px] border border-amber bg-ink px-2 py-1 text-[12.5px] text-chalk outline-none"
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

  // Written already: the text itself, marked as a note so it is not read as another address
  // line. The pencil is the way back in, as it is on the address above it.
  if (current) {
    return (
      <div className="flex items-start gap-1.5">
        <StickyNote className="mt-0.5 size-3 shrink-0 text-amber" aria-hidden="true" />
        <p className={compact ? "text-[12px] text-fog" : "text-[12.5px] text-fog"}>
          <span className="mono mr-1.5 text-[10px] uppercase tracking-widest text-amber">
            {t("routes.stop.noteLabel")}
          </span>
          {current}
        </p>
        {canEdit && (
          <button
            type="button"
            aria-label={t("routes.stop.noteEdit")}
            title={t("routes.stop.noteEdit")}
            onClick={() => setEditing(true)}
            className="mt-0.5 shrink-0 rounded-[6px] p-0.5 text-fog hover:text-amber focus:text-amber focus:outline-none"
          >
            <Pencil className="size-3" />
          </button>
        )}
      </div>
    );
  }

  // Nothing written, and nobody to write it: a read-only viewer sees no empty row at all.
  if (!canEdit) return null;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 text-[11.5px] text-fog hover:text-amber focus:text-amber focus:outline-none"
    >
      <Plus className="size-3" />
      {t("routes.stop.noteAdd")}
    </button>
  );
}
