import { useEffect, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { useInviteMember } from "../queries/team";
import { useAdminMe } from "../queries/admin";
import { useLocale } from "../lib/i18n";
import { cn } from "../lib/utils";

const ROLES = ["owner", "admin", "manager", "dispatcher", "driver", "field"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Roles a workspace hands out to its own crew. Owner and admin are deliberately absent: admin
 * is a GeoCliks-granted tier and the server refuses it from anyone but a platform superadmin
 * (`assertMayGrant` in `api/routes/team.ts`), so offering it here would only produce a 403.
 */
export const CREW_ROLES = ["manager", "dispatcher", "driver", "field"] as const;

/**
 * What the picker may offer the signed-in operator. A GeoCliks superadmin — and only a
 * superadmin — also gets `admin`, which is how support seats are created. Hiding is
 * presentation; `assertMayGrant` on the server is the guard.
 */
export function useGrantableRoles(): readonly Role[] {
  const me = useAdminMe();
  return me.data?.staffRole === "superadmin"
    ? (["admin", ...CREW_ROLES] as const)
    : CREW_ROLES;
}

const ROLE_HINT: Record<
  Role,
  | "team.hintOwner"
  | "team.hintAdmin"
  | "team.hintManager"
  | "team.hintDispatcher"
  | "team.hintDriver"
  | "team.hintField"
> = {
  owner: "team.hintOwner",
  admin: "team.hintAdmin",
  manager: "team.hintManager",
  dispatcher: "team.hintDispatcher",
  driver: "team.hintDriver",
  field: "team.hintField",
};

/**
 * Email + role + send, with its own result and error lines. One implementation on purpose: the
 * Team page renders it in a card and the sidebar's Invite entry renders it in a dialog, so the
 * two can never drift apart.
 */
export function InviteForm({ onSent }: { onSent?: () => void }) {
  const lang = useLocale();
  const invite = useInviteMember();
  const roles = useGrantableRoles();
  const [email, setEmail] = useState("");
  // No default on purpose: the inviter has to state the role before the invite can go out.
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        if (!role) {
          setError(lang.t("team.pickRole"));
          return;
        }
        try {
          const res = await invite.mutateAsync({ email, role });
          const sentTo = email;
          setEmail("");
          setNotice(
            res.emailSent
              ? lang.t("team.inviteEmailed", { email: sentTo, code: res.code })
              : lang.t("team.inviteCreated", {
                  code: res.code,
                  reason: res.emailReason ? ` (${res.emailReason})` : "",
                }),
          );
          onSent?.();
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="label mb-1.5 block text-fog">{lang.t("team.workEmail")}</span>
        <input
          aria-label={lang.t("team.workEmail")}
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tech@northline.com"
          className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
        />
      </label>
      <div>
        <span className="label mb-1.5 block text-fog">
          {lang.t("team.role")} <span className="text-alert">*</span>
        </span>
        <div className="space-y-1.5">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={cn(
                "rounded-[8px] block w-full border px-3 py-2 text-left transition-colors",
                role === item
                  ? "border-amber bg-amber/10"
                  : "border-line bg-ink hover:border-fog/50",
              )}
            >
              <span className="mono text-[11px] uppercase tracking-widest text-chalk">{item}</span>
              <span className="mt-0.5 block text-[11.5px] text-fog">{lang.t(ROLE_HINT[item])}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-[8px] border border-alert/50 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
          {error}
        </p>
      )}
      {notice && <p className="mono text-[11px] text-verified">{notice}</p>}

      <button
        type="submit"
        disabled={invite.isPending || !role}
        className="rounded-[8px] inline-flex w-full items-center justify-center gap-2 bg-amber px-4 py-2.5 text-[13px] font-semibold text-ink disabled:opacity-60"
      >
        {invite.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        {lang.t("team.sendInvite")}
      </button>
    </form>
  );
}

/**
 * The same form as a centred sheet, opened from the Invite entry in the workspace menu so a
 * crew member can be added from any page without first navigating to Team.
 */
export function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useLocale();

  // Escape closes, matching the menu sheet and the header dropdowns.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
      {/* Backdrop click dismisses; the panel stops the event so a click inside never does. */}
      <button
        type="button"
        aria-label={lang.t("common.close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-[420px] rounded-[12px] border border-line bg-ink-2 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="font-display text-[15px] font-semibold">{lang.t("team.inviteTitle")}</p>
          <button
            type="button"
            aria-label={lang.t("common.close")}
            onClick={onClose}
            className="rounded-[8px] p-1 text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4">
          <InviteForm />
        </div>
      </div>
    </div>
  );
}
