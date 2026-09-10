import { useState } from "react";
import { useLocation } from "wouter";
import {
  Copy,
  Download,
  Loader2,
  Mail,
  MessageSquare,
  Moon,
  QrCode,
  ShieldCheck,
  Sun,
  FolderOpen,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { formatStamp } from "../components/evidence-card";
import {
  useAssignMember,
  useInviteMember,
  useInviteQr,
  useInvites,
  useMemberProjects,
  useRemoveMember,
  useRevokeInvite,
  useSetRole,
  useTeam,
} from "../queries/team";
import { useOpenConversation } from "../queries/messages";
import { useProjects } from "../queries/projects";
import { useOrg, useSetAppearance } from "../queries/orgs";
import { useTheme } from "../lib/theme";
import { useLocale } from "../lib/i18n";
import { LOCALES, asLocale } from "../../api/lib/locales";
import { RoleBadge } from "../components/role-badge";
import { cn } from "../lib/utils";
import { canManageWorkspace } from "../lib/roles";

const ROLES = ["owner", "admin", "manager", "dispatcher", "driver", "field"] as const;
type Role = (typeof ROLES)[number];

/**
 * Module-level constant, so it cannot call `t()` itself — it holds catalog keys and the
 * component translates at the call site.
 */
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

/** `invites.projectIds` arrives as a JSON array in one text column. */
function parseInviteProjects(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export default function AppTeam() {
  const org = useOrg();
  const team = useTeam();
  const invites = useInvites();
  const [qrFor, setQrFor] = useState<string | null>(null);
  const qr = useInviteQr(qrFor);
  const invite = useInviteMember();
  const projects = useProjects({ status: "active" });
  const memberProjects = useMemberProjects();
  const assign = useAssignMember();
  const setRole = useSetRole();
  const removeMember = useRemoveMember();
  const revokeInvite = useRevokeInvite();
  const setAppearance = useSetAppearance();
  const openChat = useOpenConversation();
  const [, navigate] = useLocation();
  const { theme, override, workspace, setTheme, useWorkspaceDefault } = useTheme();
  const lang = useLocale();

  const [email, setEmail] = useState("");
  // No default on purpose: the owner has to state the role before the invite can go out.
  const [role, setRole_] = useState<Role | null>(null);
  // Projects ticked on the invite form, applied the moment the invite is accepted.
  // Which member's project list is expanded in the members table.
  const [projectsFor, setProjectsFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const role_ = org.data?.role;
  const isAdmin = role_ === "owner" || role_ === "admin";
  // Field crews use this page as a contact sheet, not as workspace settings.
  const isField = !canManageWorkspace(role_);
  const myId = org.data?.user.id;
  const seats = org.data?.org.seats ?? 0;
  // A pending invite holds a seat on the server (team.invite refuses once members + pending fills
  // the plan), so the header has to count them too or it disagrees with the 402 the API throws.
  const members = (team.data ?? []).length;
  const pending = (invites.data ?? []).length;
  const used = members + pending;
  const activeProjects = projects.data ?? [];
  const projectName = (id_: string) => activeProjects.find((p) => p.id === id_)?.name ?? "Project";
  /** projectIds assigned to a given user id. */
  const projectsOf = (userId: string) =>
    (memberProjects.data ?? []).filter((a) => a.userId === userId).map((a) => a.projectId);

  /** Open (or reuse) the 1:1 thread with a teammate and jump straight into it. */
  async function contact(userId: string) {
    setError(null);
    try {
      const conversation = await openChat.mutateAsync({ userId });
      navigate(`/app/messages?c=${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <DashboardShell
      title={lang.t("team.title")}
      subtitle={lang.t(isField ? "team.subtitleField" : "team.subtitle")}
      actions={
        isField ? null : (
          <span className="mono rounded-[8px] border border-line px-2.5 py-1.5 text-[10.5px] uppercase tracking-widest text-fog">
            {lang.t("team.seats", { used: String(used), seats: String(seats) })}
            {pending > 0 ? ` · ${lang.t("team.pending", { count: String(pending) })}` : ""}
          </span>
        )
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{lang.t("team.members")}</p>
            </div>
            {team.isLoading ? (
              <div className="space-y-px">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-ink-3/50" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {(team.data ?? []).map((member) => (
                  <li
                    key={member.id}
                    className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-3/40"
                  >
                    {member.user?.image ? (
                      <img
                        src={member.user.image}
                        alt=""
                        className="size-9 shrink-0 rounded-[12px] border border-line object-cover"
                      />
                    ) : (
                      <span className="mono grid size-9 shrink-0 place-items-center rounded-[12px] border border-line bg-ink text-[12px] text-amber">
                        {(member.user?.name ?? member.user?.email ?? "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-chalk">
                        {member.user?.name ?? member.user?.email ?? lang.t("team.unknownUser")}
                      </p>
                      <p className="mono truncate text-[10.5px] text-fog">
                        {member.user?.email} ·{" "}
                        {lang.t("team.memberMeta", {
                          photos: String(member.photoCount),
                          date: formatStamp(member.createdAt),
                        })}
                      </p>
                    </div>
                    <RoleBadge role={member.role} />
                    {member.userId === myId ? null : (
                      <button
                        type="button"
                        onClick={() => void contact(member.userId)}
                        disabled={openChat.isPending}
                        className="mono inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-line px-2 py-1.5 text-[10px] uppercase tracking-widest text-fog transition-colors hover:border-amber hover:text-amber disabled:opacity-50"
                      >
                        <MessageSquare className="size-3.5" />
                        {lang.t("team.message")}
                      </button>
                    )}
                    {isField ? null : (
                      <>
                        <select
                          aria-label={lang.t("team.roleAria")}
                          value={member.role}
                          disabled={setRole.isPending}
                          onChange={async (event) => {
                            setError(null);
                            try {
                              await setRole.mutateAsync({
                                memberId: member.id,
                                role: event.target.value as Role,
                              });
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
                            }
                          }}
                          className="mono rounded-[8px] border border-line bg-ink px-2 py-1.5 text-[11px] uppercase tracking-widest text-chalk outline-none focus:border-amber"
                        >
                          {ROLES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label={lang.t("team.projectsForAria", {
                            email: member.user?.email ?? "",
                          })}
                          onClick={() =>
                            setProjectsFor(projectsFor === member.id ? null : member.id)
                          }
                          className={cn(
                            "rounded-[6px] mono inline-flex shrink-0 items-center gap-1.5 border px-2 py-1.5 text-[10px] uppercase tracking-widest transition-colors",
                            projectsFor === member.id
                              ? "border-amber text-amber"
                              : "border-line text-fog hover:border-amber hover:text-amber",
                          )}
                        >
                          <FolderOpen className="size-3.5" />
                          {projectsOf(member.userId).length || "0"}
                        </button>
                        <button
                          type="button"
                          disabled={member.role === "owner"}
                          onClick={async () => {
                            setError(null);
                            try {
                              await removeMember.mutateAsync({ memberId: member.id });
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
                            }
                          }}
                          className="rounded-[12px] border border-line p-1.5 text-fog transition-colors hover:border-alert/50 hover:text-alert disabled:opacity-30"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}

                    {projectsFor === member.id && (
                      <div className="w-full rounded-[12px] border border-line bg-ink p-3">
                        <p className="label mb-2 text-fog">
                          {lang.t("team.projectAccess")} · {member.user?.email}
                        </p>
                        {activeProjects.length === 0 ? (
                          <p className="text-[11.5px] text-fog">
                            {lang.t("team.noActiveProjects")}
                          </p>
                        ) : (
                          <div className="grid gap-px sm:grid-cols-2">
                            {activeProjects.map((project) => {
                              const on = projectsOf(member.userId).includes(project.id);
                              return (
                                <button
                                  key={project.id}
                                  type="button"
                                  disabled={assign.isPending}
                                  onClick={async () => {
                                    setError(null);
                                    try {
                                      await assign.mutateAsync({
                                        projectId: project.id,
                                        userId: member.userId,
                                        assigned: !on,
                                      });
                                    } catch (err) {
                                      setError(err instanceof Error ? err.message : String(err));
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-2 px-2.5 py-2 text-left transition-colors disabled:opacity-60",
                                    on ? "bg-amber/10 text-chalk" : "text-fog hover:bg-ink-3/60",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "rounded-[4px] grid size-3.5 shrink-0 place-items-center border text-[9px]",
                                      on ? "border-amber bg-amber text-ink" : "border-fog/50",
                                    )}
                                  >
                                    {on ? "✓" : ""}
                                  </span>
                                  <span className="truncate text-[12px]">{project.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {member.role !== "field" && (
                          <p className="mt-2 text-[11.5px] text-fog">
                            {lang.t(
                              member.role === "owner" ? "team.ownersSeeAll" : "team.roleSeesAll",
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {error && (
              <p className="mono border-t border-line px-4 py-2 text-[11px] text-alert">{error}</p>
            )}
            {isField && (team.data ?? []).length <= 1 ? (
              <p className="border-t border-line px-4 py-3 text-[11.5px] text-fog">
                {lang.t("team.fieldNobodyElse")}
              </p>
            ) : null}
          </div>

          {isField ? null : (
            <div className="rounded-[12px] border border-line bg-ink-2">
              <div className="border-b border-line px-4 py-3">
                <p className="label text-fog">{lang.t("team.pendingInvites")}</p>
              </div>
              {(invites.data ?? []).length === 0 ? (
                <p className="px-4 py-6 text-center text-[12.5px] text-fog">
                  {lang.t("team.noInvites")}
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {(invites.data ?? []).map((row) => (
                    <li key={row.id} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Mail className="size-4 shrink-0 text-fog" />
                        <div className="min-w-0 flex-1">
                          <p className="mono truncate text-[12px] text-chalk">{row.email}</p>
                          <p className="mono text-[10px] uppercase tracking-widest text-fog">
                            {row.role} · {lang.t("team.inviteCode", { code: row.code })}
                          </p>
                          {parseInviteProjects(row.projectIds).length > 0 && (
                            <p className="mt-0.5 truncate text-[11px] text-fog">
                              <FolderOpen className="mr-1 inline size-3" />
                              {parseInviteProjects(row.projectIds).map(projectName).join(", ")}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setQrFor(qrFor === row.id ? null : row.id)}
                          className="mono shrink-0 rounded-[8px] border border-line px-2 py-1.5 text-[10px] uppercase tracking-widest text-fog transition-colors hover:border-amber hover:text-amber"
                        >
                          <QrCode className="mr-1 inline size-3.5" />
                          {qrFor === row.id ? lang.t("team.hide") : "QR"}
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            aria-label={lang.t("team.revokeAria", { email: row.email })}
                            disabled={revokeInvite.isPending}
                            onClick={async () => {
                              setError(null);
                              setNotice(null);
                              try {
                                await revokeInvite.mutateAsync({ id: row.id });
                                if (qrFor === row.id) setQrFor(null);
                                setNotice(lang.t("team.revoked", { email: row.email }));
                              } catch (err) {
                                setError(err instanceof Error ? err.message : String(err));
                              }
                            }}
                            className="mono shrink-0 rounded-[8px] border border-line px-2 py-1.5 text-[10px] uppercase tracking-widest text-fog transition-colors hover:border-alert hover:text-alert disabled:opacity-50"
                          >
                            <Trash2 className="mr-1 inline size-3.5" />
                            Revoke
                          </button>
                        )}
                      </div>
                      {qrFor === row.id && (
                        <div className="mt-3 rounded-[12px] border border-line bg-ink p-4">
                          {qr.isPending ? (
                            <p className="mono flex items-center gap-2 text-[11px] text-fog">
                              <Loader2 className="size-3.5 animate-spin" />{" "}
                              {lang.t("team.buildingQr")}
                            </p>
                          ) : qr.isError ? (
                            <p className="mono text-[11px] text-alert">{qr.error.message}</p>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <img
                                src={qr.data.dataUrl}
                                alt={lang.t("team.qrAlt", { email: row.email })}
                                className="size-40 bg-white p-1"
                              />
                              <p className="mono break-all text-center text-[10.5px] text-fog">
                                {qr.data.url}
                              </p>
                              <div className="flex w-full gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void navigator.clipboard?.writeText(qr.data.url);
                                    setNotice(lang.t("team.linkCopied"));
                                  }}
                                  className="mono flex-1 rounded-[8px] border border-line px-2 py-2 text-[10px] uppercase tracking-widest text-chalk transition-colors hover:border-amber"
                                >
                                  <Copy className="mr-1 inline size-3" /> {lang.t("team.copyLink")}
                                </button>
                                <a
                                  href={qr.data.dataUrl}
                                  download={`geocliks-invite-${row.code}.png`}
                                  className="mono flex-1 rounded-[8px] border border-line px-2 py-2 text-center text-[10px] uppercase tracking-widest text-chalk transition-colors hover:border-amber"
                                >
                                  <Download className="mr-1 inline size-3" /> PNG
                                </a>
                              </div>
                              {/* One key on purpose: splitting out the highlighted role word would
                                wreck word order in 11 languages, so it renders as plain text. */}
                              <p className="text-center text-[11px] leading-relaxed text-fog">
                                {lang.t("team.scanJoins", {
                                  org: org.data?.org.name ?? lang.t("team.thisWorkspace"),
                                  role: row.role,
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isField ? null : (
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
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                }
              }}
              className="rounded-[12px] border border-line bg-ink-2"
            >
              <div className="border-b border-line px-4 py-3">
                <p className="font-display text-[15px] font-semibold">
                  {lang.t("team.inviteTitle")}
                </p>
              </div>
              <div className="space-y-3 p-4">
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
                    {ROLES.filter((r) => r !== "owner").map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRole_(item)}
                        className={cn(
                          "rounded-[8px] block w-full border px-3 py-2 text-left transition-colors",
                          role === item
                            ? "border-amber bg-amber/10"
                            : "border-line bg-ink hover:border-fog/50",
                        )}
                      >
                        <span className="mono text-[11px] uppercase tracking-widest text-chalk">
                          {item}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-fog">
                          {lang.t(ROLE_HINT[item])}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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
              </div>
            </form>
          )}

          <div className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="font-display text-[15px] font-semibold">{lang.t("appearance.title")}</p>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <span className="label mb-1.5 block text-fog">
                  {lang.t("appearance.title")} · {lang.t("appearance.thisDevice")}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "rounded-[8px] mono inline-flex flex-1 items-center justify-center gap-1.5 border px-2 py-2 text-[10.5px] uppercase tracking-widest transition-colors",
                      override === "light"
                        ? "border-amber text-amber-deep"
                        : "border-line text-fog hover:border-fog/50",
                    )}
                  >
                    <Sun className="size-3.5" /> {lang.t("appearance.light")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "rounded-[8px] mono inline-flex flex-1 items-center justify-center gap-1.5 border px-2 py-2 text-[10.5px] uppercase tracking-widest transition-colors",
                      override === "dark"
                        ? "border-amber text-amber-deep"
                        : "border-line text-fog hover:border-fog/50",
                    )}
                  >
                    <Moon className="size-3.5" /> {lang.t("appearance.dark")}
                  </button>
                  <button
                    type="button"
                    onClick={useWorkspaceDefault}
                    className={cn(
                      "rounded-[8px] mono inline-flex flex-1 items-center justify-center border px-2 py-2 text-[10.5px] uppercase tracking-widest transition-colors",
                      override === null
                        ? "border-amber text-amber-deep"
                        : "border-line text-fog hover:border-fog/50",
                    )}
                  >
                    {lang.t("appearance.auto")}
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] text-fog">
                  {override === null
                    ? lang.t("team.followingWorkspace", {
                        theme: lang.t(
                          workspace === "dark" ? "appearance.dark" : "appearance.light",
                        ),
                      })
                    : lang.t("team.browserSet", {
                        theme: lang.t(theme === "dark" ? "appearance.dark" : "appearance.light"),
                      })}
                </p>
              </div>

              <div className="border-t border-line pt-4">
                <span className="label mb-1.5 block text-fog">
                  {lang.t("language.title")} · {lang.t("language.thisDevice")}
                </span>
                <select
                  aria-label={lang.t("language.title")}
                  value={lang.override ?? ""}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (!next) lang.useWorkspaceDefault();
                    else lang.setLocale(asLocale(next));
                  }}
                  className="w-full rounded-[12px] border border-line bg-ink px-2.5 py-2 text-[12.5px] text-chalk outline-none focus:border-amber"
                >
                  <option value="">{lang.t("language.followWorkspace")}</option>
                  {LOCALES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.native}
                    </option>
                  ))}
                </select>
                {isAdmin && (
                  <div className="mt-3">
                    <span className="label mb-1.5 block text-fog">
                      {lang.t("language.workspaceDefault")}
                    </span>
                    <select
                      aria-label={lang.t("language.workspaceDefault")}
                      value={lang.workspace}
                      disabled={setAppearance.isPending}
                      onChange={(event) =>
                        setAppearance.mutate({ locale: asLocale(event.target.value) })
                      }
                      className="w-full rounded-[12px] border border-line bg-ink px-2.5 py-2 text-[12.5px] text-chalk outline-none focus:border-amber disabled:opacity-60"
                    >
                      {LOCALES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.native}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="mt-1.5 text-[11.5px] text-fog">{lang.t("language.note")}</p>
              </div>

              {isAdmin && (
                <div className="border-t border-line pt-4">
                  <span className="label mb-1.5 block text-fog">
                    {lang.t("appearance.workspaceDefault")}
                  </span>
                  <div className="flex gap-1.5">
                    {(["light", "dark"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={setAppearance.isPending}
                        onClick={() => setAppearance.mutate({ theme: item })}
                        className={cn(
                          "rounded-[8px] mono inline-flex flex-1 items-center justify-center gap-1.5 border px-2 py-2 text-[10.5px] uppercase tracking-widest transition-colors disabled:opacity-60",
                          workspace === item
                            ? "border-amber text-amber-deep"
                            : "border-line text-fog hover:border-fog/50",
                        )}
                      >
                        {item === "light" ? (
                          <Sun className="size-3.5" />
                        ) : (
                          <Moon className="size-3.5" />
                        )}
                        {lang.t(item === "light" ? "appearance.light" : "appearance.dark")}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-fog">{lang.t("team.themeNote")}</p>
                </div>
              )}
            </div>
          </div>

          {isField ? null : (
            <div className="rounded-[12px] border border-line bg-ink-2 p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-chalk">
                <ShieldCheck className="size-4 text-verified" /> {lang.t("team.projectLevelAccess")}
              </p>
              {/* One key on purpose: the two highlighted phrases would wreck word order in 11
                languages if split out, so this renders as plain text. */}
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-fog">
                {lang.t("team.projectLevelBody", { crew: lang.t("project.crewAccess") })}
              </p>
            </div>
          )}

          {(team.data ?? []).length === 0 && !team.isLoading && (
            <EmptyState icon={Users} title={lang.t("team.noMembers")} />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
