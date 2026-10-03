import { useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, X } from "lucide-react";
import { useAddressSuggestions, useUpdateRoute } from "../queries/routes";
import { useT } from "../lib/i18n";

/**
 * A run's start address, correctable in place.
 *
 * The depot was only ever askable once, in the new-run dialog, and after that the page showed it
 * as plain text — so a typo in the address the whole drive is measured from could be fixed by
 * deleting the run and building it again, or not at all. Every stop below it has been editable
 * for a while; this is the same affordance for the line above them.
 *
 * Saving relies on the update mutation re-geocoding a changed address server-side, so there is no
 * second resolve pass here: the text lands, the pin follows, and the map's start marker moves on
 * the refetch. Clearing the field is a real edit too - it drops the depot and starts the drive at
 * the first stop, which is what the create dialog's blank field means.
 */
export function RouteStartAddress({
  routeId,
  address,
  canEdit,
  onError,
}: {
  routeId: string;
  address: string | null;
  canEdit: boolean;
  onError?: (message: string) => void;
}) {
  const t = useT();
  const updateRoute = useUpdateRoute();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(address ?? "");
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // A change made elsewhere - another dispatcher, another tab - must not be overwritten by a
  // draft this tab is not editing.
  useEffect(() => {
    if (!editing) setValue(address ?? "");
  }, [address, editing]);

  useEffect(() => {
    const handle = setTimeout(() => setQuery(value), 300);
    return () => clearTimeout(handle);
  }, [value]);

  const suggestQuery = useAddressSuggestions(editing && listOpen ? query : "");
  const suggestions = editing && listOpen ? (suggestQuery.data ?? []) : [];

  const dirty = value.trim() !== (address ?? "").trim();

  function close() {
    setEditing(false);
    setListOpen(false);
    setValue(address ?? "");
  }

  async function save() {
    if (!dirty) return close();
    setSaving(true);
    try {
      // Sent as text only: the server geocodes it and brings the pin with it.
      await updateRoute.mutateAsync({ id: routeId, startAddress: value.trim() });
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
      <span className="relative inline-block w-full max-w-[22rem] align-middle">
        <span className="flex items-center gap-1.5">
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus -- the edit was just asked for.
            autoFocus
            aria-label={t("routes.fStartAddress")}
            placeholder={t("routes.fStartHint")}
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
        </span>
        {suggestions.length > 0 && (
          <ul className="absolute left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-[8px] border border-line bg-ink-2 shadow-lg">
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
      </span>
    );
  }

  if (!address) {
    // Nothing set: the run starts at its first stop. Only worth a control if it can be changed.
    if (!canEdit) return null;
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 rounded-[6px] text-[13px] text-fog hover:text-amber-ink focus:text-amber-ink focus:outline-none"
      >
        <Plus className="size-3" /> {t("routes.startAddressSet")}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-chalk">{address}</span>
      {canEdit && (
        <button
          type="button"
          aria-label={t("routes.startAddressEdit")}
          title={t("routes.startAddressEdit")}
          onClick={() => setEditing(true)}
          className="shrink-0 rounded-[6px] p-0.5 text-fog hover:text-amber-ink focus:text-amber-ink focus:outline-none"
        >
          <Pencil className="size-3" />
        </button>
      )}
    </span>
  );
}
