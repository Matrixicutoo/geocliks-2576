import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpCircle,
  Building2,
  Image as ImageIcon,
  Loader2,
  Mail,
  LogOut,
  Trash2,
  TriangleAlert,
  User,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { useOrg } from "../queries/orgs";
import { useDeleteAccount, useUpdateProfile } from "../queries/account";
import { orpc } from "../lib/api";
import { authClient } from "../lib/auth";
import { useT } from "../lib/i18n";
import { RoleBadge } from "../components/role-badge";
import { cn } from "../lib/utils";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || source.slice(0, 2).toUpperCase();
}

/**
 * Account page: avatar, display name, sign-in method, plan shortcut and permanent deletion.
 * Workspace-wide settings (members, appearance, watermarks) stay on their own pages.
 */
export default function AppProfile() {
  const t = useT();
  const org = useOrg();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [armed, setArmed] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = org.data?.user;
  // Only the workspace owner removes a field member — their captures are workspace evidence.
  const canDeleteAccount = org.data?.role !== "field";

  useEffect(() => {
    if (user?.name) setName((prev) => (prev ? prev : user.name));
  }, [user?.name]);

  const flash = (message: string) => {
    setError(null);
    setNote(message);
    setTimeout(() => setNote(null), 4000);
  };

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError(null);
    try {
      const presign = await orpc.account.presignAvatar.call({
        filename: file.name,
        contentType: file.type || "image/jpeg",
      });
      const res = await fetch(presign.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await updateProfile.mutateAsync({ image: presign.key });
      flash(t("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeAvatar() {
    setError(null);
    try {
      await updateProfile.mutateAsync({ image: null });
      flash(t("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function saveName() {
    setError(null);
    const next = name.trim();
    if (!next || next === user?.name) return;
    try {
      await updateProfile.mutateAsync({ name: next });
      flash(t("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function destroy() {
    setError(null);
    try {
      await deleteAccount.mutateAsync({ confirm: "DELETE" });
      await authClient.signOut();
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const avatar = user?.image ?? null;

  return (
    <DashboardShell title={t("profile.title")} subtitle={t("profile.account")}>
      <div className="grid max-w-4xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {/* The workspace's own details — company name, address, phone, logo — live on the
              teamspace settings page. This page is otherwise the person, not the business, but
              the company comes first here on purpose: it is the only door into those settings
              now that the menu's workspace card is gone, and it is what people arrive on this
              page looking for far more often than they come to change their own display name.

              Built at the same weight as the photo card below it — big logo, real button —
              rather than as a link row, so it reads as a destination instead of a footnote. */}
          <section className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("org.settings.section")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 p-4">
              {/* The company's own logo when it has one — the same mark that now heads the
                  sidebar, so this card is visibly about *their* business. */}
              {org.data?.org.logoUrl ? (
                <img
                  src={org.data.org.logoUrl}
                  alt=""
                  className="size-20 shrink-0 rounded-full border border-line bg-white/5 object-contain p-1.5"
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-full border border-line">
                  <Building2 className="size-8 text-amber" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-display truncate text-[16px] font-extrabold tracking-tight text-amber">
                  {org.data?.org.name ?? t("org.settings.section")}
                </p>
                <p className="text-[12px] leading-relaxed text-fog">
                  {t("org.settings.openHint")}
                </p>
                <Link
                  to="/app/teamspace-settings"
                  className="rounded-[8px] inline-flex items-center gap-2 border border-amber px-3 py-2 text-[13px] font-medium text-amber transition-colors hover:bg-amber hover:text-ink"
                >
                  <Building2 className="size-4" />
                  {t("org.settings.title")}
                </Link>
              </div>
            </div>
          </section>

          {/* Avatar */}
          <section className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("profile.photo")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 p-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt={t("profile.photo")}
                  className="size-20 shrink-0 rounded-full border border-amber object-cover"
                />
              ) : (
                <div className="mono flex size-20 shrink-0 items-center justify-center rounded-full border border-amber text-lg text-amber">
                  {initials(user?.name, user?.email)}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  aria-label={t("profile.changePhoto")}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadAvatar(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-[8px] flex items-center gap-2 border border-amber px-3 py-2 text-[13px] font-medium text-amber transition-colors hover:bg-amber hover:text-ink disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImageIcon className="size-4" />
                  )}
                  {t("profile.changePhoto")}
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => void removeAvatar()}
                    className="rounded-[12px] border border-line px-3 py-2 text-[13px] text-fog transition-colors hover:border-alert hover:text-alert"
                  >
                    {t("profile.removePhoto")}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Identity */}
          <section className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("profile.account")}</p>
            </div>
            <div className="space-y-3 p-4">
              <label className="block">
                <span className="label text-fog">{t("profile.displayName")}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label={t("profile.displayName")}
                  className="mt-1.5 w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[14px] text-chalk outline-none focus:border-amber"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <p className="mono text-[11px] text-fog">{user?.email}</p>
                {org.data?.role ? <RoleBadge role={org.data.role} /> : null}
              </div>
              <button
                type="button"
                onClick={() => void saveName()}
                disabled={updateProfile.isPending || !name.trim() || name.trim() === user?.name}
                className="rounded-[8px] flex items-center gap-2 bg-amber px-4 py-2 text-[13px] font-semibold text-ink transition-opacity disabled:opacity-50"
              >
                {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                <User className="size-4" />
                {t("profile.saveChanges")}
              </button>
            </div>
          </section>

          {/* How this account signs in. There is nothing to change — hence no form. */}
          <section className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("profile.signInSection")}</p>
            </div>
            <div className="space-y-2 p-4">
              <p className="flex items-center gap-2 text-[13px] text-chalk">
                <Mail className="size-4 shrink-0 text-amber" />
                {t("profile.signInPasswordless")}
              </p>
              <p className="text-[12px] leading-relaxed text-fog">
                {t("profile.signInPasswordlessHint")}
              </p>
            </div>
          </section>

        </div>

        <div className="space-y-6">
          {/* Plan */}
          <section className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("profile.planSection")}</p>
            </div>
            <div className="space-y-3 p-4">
              <p className="mono text-[11px] uppercase tracking-widest text-amber">
                {org.data?.plan.name}
              </p>
              <Link
                to="/app/billing"
                className="rounded-[8px] flex items-center justify-center gap-2 bg-amber px-4 py-2 text-[13px] font-semibold text-ink"
              >
                <ArrowUpCircle className="size-4" />
                {t("profile.upgrade")}
              </Link>
            </div>
          </section>

          <button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              window.location.assign("/");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-line px-4 py-2 text-[13px] text-fog transition-colors hover:border-amber/60 hover:text-chalk"
          >
            <LogOut className="size-4" /> {t("shell.signOut")}
          </button>

          {/* Danger zone */}
          <section className="rounded-[12px] overflow-hidden border border-alert/60 bg-ink-2">
            <div className="flex items-center gap-2 border-b border-alert/40 px-4 py-3">
              <TriangleAlert className="size-4 text-alert" />
              <p className="label text-alert">{t("profile.danger")}</p>
            </div>
            <div className="space-y-3 p-4">
              <p className="text-[12.5px] leading-relaxed text-fog">
                {canDeleteAccount ? t("profile.deleteWarning") : t("perm.selfDeleteNote")}
              </p>
              {!canDeleteAccount ? null : armed ? (
                <>
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="DELETE"
                    aria-label={t("profile.deleteConfirm")}
                    className="rounded-[8px] w-full border border-alert/60 bg-ink px-3 py-2 text-[14px] text-chalk outline-none focus:border-alert"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void destroy()}
                      disabled={confirm !== "DELETE" || deleteAccount.isPending}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 bg-alert px-4 py-2 text-[13px] font-semibold text-ink",
                        (confirm !== "DELETE" || deleteAccount.isPending) && "opacity-50",
                      )}
                    >
                      {deleteAccount.isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> {t("profile.deleting")}
                        </>
                      ) : (
                        <>
                          <Trash2 className="size-4" /> {t("profile.deleteAccount")}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setArmed(false);
                        setConfirm("");
                      }}
                      className="rounded-[12px] border border-line px-4 py-2 text-[13px] text-fog hover:text-chalk"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setArmed(true)}
                  className="rounded-[8px] flex w-full items-center justify-center gap-2 border border-alert px-4 py-2 text-[13px] font-semibold text-alert transition-colors hover:bg-alert hover:text-ink"
                >
                  <Trash2 className="size-4" /> {t("profile.deleteAccount")}
                </button>
              )}
            </div>
          </section>

          {note && <p className="mono text-[11px] text-green-400">{note}</p>}
          {error && <p className="mono text-[11px] text-alert">{error}</p>}
        </div>
      </div>
    </DashboardShell>
  );
}
