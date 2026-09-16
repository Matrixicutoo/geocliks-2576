import { useState } from "react";
import { Archive, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import { useCreateNote, useRemoveNote, useSetNoteStatus, useUpdateNote } from "../queries/notes";
import type { NoteBoard } from "../queries/notes";
import { useOrg } from "../queries/orgs";
import { canManageWorkspace } from "../lib/roles";
import { useT, type TKey } from "../lib/i18n";

/**
 * The note popup — the one form for both writing a note and opening an existing one.
 *
 * Only the title is required. Everything else is the shape a note takes once it turns into real
 * office work: a date to do it on, the address to go to, and who to call when you get there.
 *
 * Archive vs delete is deliberate and both are offered. Archiving is the everyday "done with
 * this" and keeps the record; deleting destroys it and is manager-and-above only, matching the
 * server. A brand-new note has neither, because there is nothing yet to archive.
 */

export type NoteRow = {
  id: string;
  board: string;
  title: string;
  body: string | null;
  dueDate: string | null;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string;
};

const INPUT =
  "mt-1.5 w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber";

export function NoteDialog({
  board,
  note,
  onClose,
}: {
  board: NoteBoard;
  /** The note being opened, or null to write a new one. */
  note: NoteRow | null;
  onClose: () => void;
}) {
  const t = useT();
  const org = useOrg();
  const create = useCreateNote();
  const update = useUpdateNote();
  const setStatus = useSetNoteStatus();
  const remove = useRemoveNote();
  const canDelete = canManageWorkspace(org.data?.role);

  const [form, setForm] = useState({
    title: note?.title ?? "",
    body: note?.body ?? "",
    dueDate: note?.dueDate ?? "",
    address: note?.address ?? "",
    contactName: note?.contactName ?? "",
    contactPhone: note?.contactPhone ?? "",
    contactEmail: note?.contactEmail ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  // A stray click on Delete must never destroy a note, so it takes two.
  const [confirmDelete, setConfirmDelete] = useState(false);

  const busy = create.isPending || update.isPending || setStatus.isPending || remove.isPending;
  const archived = note?.status === "archived";

  const fail = (err: unknown) => setError(err instanceof Error ? err.message : String(err));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const payload = {
      board,
      title: form.title.trim(),
      body: form.body || undefined,
      dueDate: form.dueDate || null,
      address: form.address || undefined,
      contactName: form.contactName || undefined,
      contactPhone: form.contactPhone || undefined,
      contactEmail: form.contactEmail || undefined,
    };
    try {
      if (note) await update.mutateAsync({ id: note.id, ...payload });
      else await create.mutateAsync(payload);
      onClose();
    } catch (err) {
      fail(err);
    }
  };

  const archive = async () => {
    setError(null);
    try {
      await setStatus.mutateAsync({ id: note!.id, status: archived ? "open" : "archived" });
      onClose();
    } catch (err) {
      fail(err);
    }
  };

  const destroy = async () => {
    setError(null);
    try {
      await remove.mutateAsync({ id: note!.id });
      onClose();
    } catch (err) {
      fail(err);
    }
  };

  const contactFields: [keyof typeof form, TKey, string][] = [
    ["contactName", "notes.fContact", "Dana Whitlock"],
    ["contactPhone", "notes.fPhone", "(303) 555-0142"],
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm">
      {/* The backdrop is a real button, so clicking outside closes the popup and so does a
          keyboard Enter on it. */}
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <form
        onSubmit={submit}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-[12px] border border-line bg-ink-2"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <p className="font-display text-[15px] font-semibold">
            {note ? t("notes.dialogEdit") : t("notes.dialogNew")}
          </p>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onClose}
            className="text-fog hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="label">{t("notes.fTitle")}</span>
              <input
                aria-label={t("notes.fTitle")}
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("notes.fTitlePlaceholder")}
                className={INPUT}
              />
            </label>

            <label className="block">
              <span className="label">{t("notes.fDate")}</span>
              {/* A real date picker — the note's date is a day someone chose, stored as
                  YYYY-MM-DD with no timezone maths applied to it. */}
              <input
                type="date"
                aria-label={t("notes.fDate")}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={INPUT}
              />
            </label>

            <label className="block">
              <span className="label">{t("notes.fEmail")}</span>
              <input
                type="email"
                aria-label={t("notes.fEmail")}
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="dana@northline.co"
                className={INPUT}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="label">{t("notes.fAddress")}</span>
              <input
                aria-label={t("notes.fAddress")}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="1420 Ridgeline Dr, Denver, CO 80211"
                className={INPUT}
              />
            </label>

            {contactFields.map(([key, label, placeholder]) => (
              <label key={key} className="block">
                <span className="label">{t(label)}</span>
                <input
                  aria-label={t(label)}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={INPUT}
                />
              </label>
            ))}

            <label className="block sm:col-span-2">
              <span className="label">{t("notes.fBody")}</span>
              <textarea
                aria-label={t("notes.fBody")}
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={t("notes.fBodyPlaceholder")}
                className={`${INPUT} resize-y`}
              />
            </label>
          </div>

          {error && (
            <p className="mx-5 mb-4 rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[13px] text-alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
          {/* Archive and delete only exist once there is something to act on. */}
          {note && (
            <>
              <button
                type="button"
                onClick={archive}
                disabled={busy}
                className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-chalk disabled:opacity-60"
              >
                {archived ? <RotateCcw className="size-3.5" /> : <Archive className="size-3.5" />}
                {archived ? t("notes.restore") : t("notes.archive")}
              </button>

              {canDelete &&
                (confirmDelete ? (
                  <span className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={destroy}
                      disabled={busy}
                      className="mono rounded-[8px] bg-alert px-3 py-2 text-[11px] uppercase tracking-widest text-white disabled:opacity-60"
                    >
                      {t("notes.confirmDelete")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="mono rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog"
                    >
                      {t("common.cancel")}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-alert/50 px-3 py-2 text-[11px] uppercase tracking-widest text-alert transition-colors hover:bg-alert/10"
                  >
                    <Trash2 className="size-3.5" /> {t("common.delete")}
                  </button>
                ))}
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="mono rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog hover:text-chalk"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={busy || !form.title.trim()}
              className="mono inline-flex items-center gap-2 rounded-[8px] bg-amber px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-amber-deep disabled:opacity-60"
            >
              {busy && <Loader2 className="size-3.5 animate-spin" />}
              {note ? t("notes.save") : t("notes.add")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
