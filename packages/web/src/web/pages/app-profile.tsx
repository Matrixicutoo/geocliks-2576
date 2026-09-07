import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpCircle,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Mail,
  LogOut,
  Trash2,
  TriangleAlert,
  User,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { TwoFactorCard } from "../components/two-factor-card";
import { useOrg, useUpdateOrg } from "../queries/orgs";
import { useDeleteAccount, useSendPasswordResetLink, useUpdateProfile } from "../queries/account";
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
 * Account page: avatar, display name, password, plan shortcut and permanent deletion.
 * Workspace-wide settings (members, appearance, watermarks) stay on their own pages.
 */
export default function AppProfile() {
  const t = useT();
  const org = useOrg();
  const updateProfile = useUpdateProfile();
  const updateOrg = useUpdateOrg();
  const deleteAccount = useDeleteAccount();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [armed, setArmed] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = org.data?.user;
  // Only the workspace owner removes a field member — their captures are workspace evidence.
  const canDeleteAccount = org.data?.role !== "field";
  /**
   * Two-step sign-in is offered to owners and admins only. Forcing it on a field crew would mean a
   * phone-in-a-truck losing access to capture, which is worse for the business than the risk it
   * removes; the accounts that can change billing, roles and evidence are the ones worth protecting.
   */
  const canUse2fa = org.data?.role === "owner" || org.data?.role === "admin";
  /** The server enforces admin+ on `orgs.update`; this keeps the page honest about it. */
  const canRenameOrg = org.data?.role === "owner" || org.data?.role === "admin";
  const workspaceName = org.data?.org.name;

  useEffect(() => {
    if (user?.name) setName((prev) => (prev ? prev : user.name));
  }, [user?.name]);

  useEffect(() => {
    if (workspaceName) setOrgName((prev) => (prev ? prev : workspaceName));
  }, [workspaceName]);

  const flash = (message: string) => {
    setError(null);
    setNote(message);
    setTimeout(() => setNote(null), 4000);
  };

  async function saveOrgName() {
    setError(null);
    const next = orgName.trim();
    if (!next || next === workspaceName) return;
    try {
      await updateOrg.mutateAsync({ name: next });
      flash(t("profile.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

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

  const sendResetLink = useSendPasswordResetLink();

  async function emailResetLink() {
    setError(null);
    try {
      await sendResetLink.mutateAsync({});
      flash(t("profile.emailResetSent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function changePassword() {
    setError(null);
    if (currentPassword.length < 1 || newPassword.length < 8) {
      setError(t("signin.passwordHint"));
      return;
    }
    setChangingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) throw new Error(result.error.message ?? "Could not change password");
      setCurrentPassword("");
      setNewPassword("");
      flash(t("profile.passwordUpdated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setChangingPassword(false);
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
                  className="size-20 shrink-0 rounded-[12px] border border-amber object-cover"
                />
              ) : (
                <div className="mono flex size-20 shrink-0 items-center justify-center rounded-[12px] border border-amber text-lg text-amber">
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

          {/* Password */}
          <section className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("profile.password")}</p>
            </div>
            <div className="space-y-3 p-4">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("profile.currentPassword")}
                aria-label={t("profile.currentPassword")}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[14px] text-chalk outline-none focus:border-amber"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("profile.newPassword")}
                aria-label={t("profile.newPassword")}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[14px] text-chalk outline-none focus:border-amber"
              />
              <button
                type="button"
                onClick={() => void changePassword()}
                disabled={changingPassword}
                className="rounded-[8px] flex items-center gap-2 border border-amber px-4 py-2 text-[13px] font-semibold text-amber transition-colors hover:bg-amber hover:text-ink disabled:opacity-60"
              >
                {changingPassword ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                {t("profile.changePassword")}
              </button>
              <p className="text-[12px] text-fog">{t("profile.passwordManaged")}</p>
              <div className="border-t border-line pt-3">
                <p className="mb-2 text-[12px] text-fog">{t("profile.emailResetOr")}</p>
                <button
                  type="button"
                  onClick={() => void emailResetLink()}
                  disabled={sendResetLink.isPending}
                  className="flex items-center gap-2 rounded-[12px] border border-line px-4 py-2 text-[13px] font-semibold text-chalk transition-colors hover:border-amber hover:text-amber disabled:opacity-60"
                >
                  {sendResetLink.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  {t("profile.emailReset")}
                </button>
              </div>
            </div>
          </section>

          {canRenameOrg ? (
            <section className="rounded-[12px] border border-line bg-ink-2">
              <div className="border-b border-line px-4 py-3">
                <p className="label text-fog">{t("profile.workspace")}</p>
              </div>
              <div className="space-y-3 p-4">
                <label className="block">
                  <span className="label">{t("profile.businessName")}</span>
                  <input
                    aria-label={t("profile.businessName")}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="mt-1.5 w-full rounded-[8px] border border-line bg-ink px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
                  />
                </label>
                <p className="text-[12px] leading-relaxed text-fog">
                  {t("profile.workspaceHint")}
                </p>
                <button
                  type="button"
                  disabled={
                    updateOrg.isPending ||
                    orgName.trim().length < 2 ||
                    orgName.trim() === workspaceName
                  }
                  onClick={saveOrgName}
                  className="rounded-[8px] mono bg-amber px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-on-amber disabled:opacity-60"
                >
                  {t("profile.saveChanges")}
                </button>
              </div>
            </section>
          ) : null}

          {canUse2fa ? <TwoFactorCard /> : null}
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
