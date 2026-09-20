import { useEffect, useState } from "react";
import { Check, Loader2, Lock, Pencil, X } from "lucide-react";
import { useAddressSuggestions, useGeocodeStops, useUpdateStop } from "../queries/routes";
import { useT } from "../lib/i18n";
import { cn } from "../lib/utils";

/**
 * A stop's address, correctable in place.
 *
 * Addresses arrive from a paste or a spreadsheet, which means they arrive wrong: a unit number
 * left off, a street misspelled, "Moncton" where the depot meant Dieppe. Until now the only
 * repair was to delete the stop and add it again at the bottom of the run, losing its position
 * and everything typed beside it — so dispatchers left bad addresses in and phoned the driver
 * instead. Editing here keeps the row, its order, and its contact details.
 *
 * Saving re-opens the question of where the pin goes, so the same suggestion list the add
 * field uses is offered here, and a resolve pass runs straight after the write: the dispatcher
 * corrects the text and the map catches up on its own, with no second button to remember.
 */
export function StopAddress({
  stopId,
  routeId,
  addressRaw,
  display,
  canEdit,
  locked,
  textClass,
  onOpenProof,
  onError,
}: {
  stopId: string;
  routeId: string;
  /** What the dispatcher typed or pasted — the text an edit starts from. */
  addressRaw: string;
  /** What the geocoder made of it, shown when it is there. */
  display: string;
  canEdit: boolean;
  /**
   * The stop is closed, so its address is the record of where its proof photo was taken.
   * The pencil goes away and says why, rather than offering an edit the server will refuse.
   */
  locked?: boolean;
  textClass: string;
  /** Given for a stop with a delivery photo: the address opens it, as it did before. */
  onOpenProof?: () => void;
  onError?: (message: string) => void;
}) {
  const t = useT();
  const updateStop = useUpdateStop();
  const geocode = useGeocodeStops();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(addressRaw);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Someone else's edit, or a reorder, must not be overwritten by a stale draft.
  useEffect(() => {
    if (!editing) setValue(addressRaw);
  }, [addressRaw, editing]);

  useEffect(() => {
    const handle = setTimeout(() => setQuery(value), 300);
    return () => clearTimeout(handle);
  }, [value]);

  const suggestQuery = useAddressSuggestions(editing && listOpen ? query : "");
  const suggestions = editing && listOpen ? (suggestQuery.data ?? []) : [];

  const dirty = value.trim().length > 0 && value.trim() !== addressRaw;

  function close() {
    setEditing(false);
    setListOpen(false);
    setValue(addressRaw);
  }

  async function save() {
    if (!dirty) return close();
    setSaving(true);
    try {
      await updateStop.mutateAsync({ stopId, addressRaw: value.trim() });
      // The old pin belonged to the old text. Ask for the new one right away; the pass only
      // touches stops that need it, so it costs one lookup.
      await geocode.mutateAsync({ routeId, force: false });
      setEditing(false);
      setListOpen(false);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus -- the edit was just asked for.
            autoFocus
            aria-label={t("routes.liveAddress")}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setListOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void save();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                close();
              }
            }}
            // Delayed so a click on a suggestion lands before the list unmounts.
            onBlur={() => setTimeout(() => setListOpen(false), 150)}
            disabled={saving}
            className="w-full rounded-[6px] border border-amber bg-ink px-2 py-1 text-[13px] text-chalk outline-none"
          />
          <button
            type="button"
            aria-label={t("common.save")}
            title={t("common.save")}
            onClick={() => void save()}
            disabled={saving}
            className="rounded-[6px] border border-line p-1.5 text-fog hover:text-verified disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            aria-label={t("common.cancel")}
            title={t("common.cancel")}
            onClick={close}
            disabled={saving}
            className="rounded-[6px] border border-line p-1.5 text-fog hover:text-alert disabled:opacity-40"
          >
            <X className="size-3.5" />
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-[8px] border border-line bg-ink-2 shadow-lg">
            {suggestions.map((s) => (
              <li key={s.placeId ?? s.description}>
                <button
                  type="button"
                  onClick={() => {
                    setValue(s.description);
                    setListOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-[12.5px] text-chalk hover:bg-ink-3"
                >
                  {s.description}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1.5">
      {onOpenProof ? (
        <button
          type="button"
          onClick={onOpenProof}
          className={cn("text-left hover:text-amber focus:text-amber focus:outline-none", textClass)}
        >
          {display}
        </button>
      ) : (
        <p className={textClass}>{display}</p>
      )}
      {canEdit && !locked && (
        <button
          type="button"
          aria-label={t("routes.stop.editAddress")}
          title={t("routes.stop.editAddress")}
          onClick={() => setEditing(true)}
          className="mt-0.5 shrink-0 rounded-[6px] p-0.5 text-fog hover:text-amber focus:text-amber focus:outline-none"
        >
          <Pencil className="size-3" />
        </button>
      )}
      {canEdit && locked && (
        <span
          aria-label={t("routes.stop.addressLocked")}
          title={t("routes.stop.addressLocked")}
          className="mt-0.5 shrink-0 text-fog/50"
        >
          <Lock className="size-3" />
        </span>
      )}
    </div>
  );
}
