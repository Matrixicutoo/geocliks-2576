import { useEffect, useState } from "react";
import { Eye, EyeOff, Info, Plus, Save, Trash2 } from "lucide-react";
import { AdminShell } from "../components/admin-shell";
import {
  useAdminPlans,
  useCreatePlan,
  useDeletePlan,
  useSetPlanVisible,
  useUpdatePlan,
} from "../queries/admin";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

const EXPORTS = ["pdf", "xlsx", "zip", "kmz"] as const;
type ExportFormat = (typeof EXPORTS)[number];

type Limits = {
  photosPerMonth: number;
  projects: number;
  seats: number;
  templates: number;
  videoMaxSeconds: number;
  videoTrialDays: number;
  teamspace: boolean;
  shareLinks: boolean;
  exports: ExportFormat[];
  branding: boolean;
  roles: boolean;
};

type Draft = {
  id: string;
  name: string;
  priceCents: number;
  period: string;
  tagline: string;
  features: string;
  limits: Limits;
  visible: boolean;
  sortOrder: number;
  autumnPlanId: string;
};

const BLANK: Draft = {
  id: "",
  name: "",
  priceCents: 4900,
  period: "per user / month",
  tagline: "",
  features: "",
  limits: {
    photosPerMonth: -1,
    projects: -1,
    seats: 25,
    templates: -1,
    videoMaxSeconds: 180,
    videoTrialDays: 0,
    teamspace: true,
    shareLinks: true,
    exports: ["pdf", "xlsx", "zip", "kmz"],
    branding: true,
    roles: true,
  },
  visible: true,
  sortOrder: 10,
  autumnPlanId: "",
};

function NumField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label text-fog">{label}</span>
      <input
        aria-label={label}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mono mt-1 w-full rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[13px] text-chalk focus:border-amber focus:outline-none"
      />
      {hint && <span className="mono mt-0.5 block text-[9.5px] text-fog">{hint}</span>}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "rounded-[6px] mono border px-2 py-1 text-[10px] uppercase tracking-widest transition-colors",
        value
          ? "border-verified/50 bg-verified/10 text-verified"
          : "border-line bg-ink text-fog hover:text-chalk",
      )}
    >
      {label}
    </button>
  );
}

function PlanEditor({
  draft,
  setDraft,
  onSave,
  saving,
  isNew,
  onDelete,
  canDelete,
  workspaces,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  saving: boolean;
  isNew?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
  workspaces?: number;
}) {
  const t = useT();
  const l = draft.limits;
  const setLimits = (patch: Partial<Limits>) => setDraft({ ...draft, limits: { ...l, ...patch } });

  return (
    <div className="rounded-[12px] border border-line bg-ink-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-baseline gap-2">
          <p className="font-display text-lg font-bold text-chalk">{draft.name || t("admin.pl.newPlan")}</p>
          <span className="mono text-[10px] uppercase tracking-widest text-fog">
            {isNew ? t("admin.pl.draft") : draft.id}
          </span>
          {!draft.visible && (
            <span className="mono rounded-[8px] border border-line px-1.5 text-[9.5px] uppercase tracking-widest text-fog">
              {t("admin.pl.hidden")}
            </span>
          )}
          {typeof workspaces === "number" && (
            <span className="mono text-[10px] text-fog">
              {t("admin.pl.workspacesCount", { n: workspaces })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Toggle
            label={t(draft.visible ? "admin.pl.visible" : "admin.pl.hidden")}
            value={draft.visible}
            onChange={(v) => setDraft({ ...draft, visible: v })}
          />
          {onDelete && (
            <button
              type="button"
              aria-label={t("admin.pl.deletePlan")}
              disabled={!canDelete}
              onClick={onDelete}
              className="rounded-[12px] border border-line px-2 py-1 text-fog hover:border-alert/60 hover:text-alert disabled:opacity-40"
              title={t(canDelete ? "admin.pl.deletePlan" : "admin.pl.deleteBuiltin")}
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="rounded-[8px] mono flex items-center gap-1.5 border border-amber/50 bg-amber/10 px-3 py-1 text-[11px] uppercase tracking-widest text-amber hover:bg-amber/20 disabled:opacity-40"
          >
            {isNew ? <Plus className="size-3.5" /> : <Save className="size-3.5" />}
            {isNew ? t("admin.pl.create") : t("admin.pl.save")}
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block">
            <span className="label text-fog">{t("admin.pl.name")}</span>
            <input
              aria-label={t("admin.pl.nameAria")}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="mt-1 w-full rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[13px] text-chalk focus:border-amber focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label={t("admin.pl.price")}
              value={draft.priceCents}
              onChange={(v) => setDraft({ ...draft, priceCents: v })}
              hint={t("admin.pl.priceHint")}
            />
            <label className="block">
              <span className="label text-fog">{t("admin.pl.period")}</span>
              <input
                aria-label={t("admin.pl.period")}
                value={draft.period}
                onChange={(e) => setDraft({ ...draft, period: e.target.value })}
                className="mt-1 w-full rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[13px] text-chalk focus:border-amber focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="label text-fog">{t("admin.pl.tagline")}</span>
            <input
              aria-label={t("admin.pl.taglineAria")}
              value={draft.tagline}
              onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
              className="mt-1 w-full rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[13px] text-chalk focus:border-amber focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="label text-fog">{t("admin.pl.features")}</span>
            <textarea
              aria-label={t("admin.pl.featuresAria")}
              rows={6}
              value={draft.features}
              onChange={(e) => setDraft({ ...draft, features: e.target.value })}
              className="mt-1 w-full rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[13px] leading-relaxed text-chalk focus:border-amber focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label={t("admin.pl.sortOrder")}
              value={draft.sortOrder}
              onChange={(v) => setDraft({ ...draft, sortOrder: v })}
            />
            <label className="block">
              <span className="label text-fog">{t("admin.pl.autumnId")}</span>
              <input
                aria-label={t("admin.pl.autumnId")}
                value={draft.autumnPlanId}
                onChange={(e) => setDraft({ ...draft, autumnPlanId: e.target.value })}
                placeholder={t("admin.pl.autumnPlaceholder")}
                className="mono mt-1 w-full rounded-[8px] border border-line bg-ink px-2 py-1.5 text-[12px] text-chalk placeholder:text-fog focus:border-amber focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label={t("admin.pl.photosMonth")}
              value={l.photosPerMonth}
              onChange={(v) => setLimits({ photosPerMonth: v })}
              hint={t("admin.pl.unlimitedHint")}
            />
            <NumField
              label={t("admin.pl.projects")}
              value={l.projects}
              onChange={(v) => setLimits({ projects: v })}
              hint={t("admin.pl.unlimitedHint")}
            />
            <NumField
              label={t("admin.pl.seats")}
              value={l.seats}
              onChange={(v) => setLimits({ seats: v })}
            />
            <NumField
              label={t("admin.pl.templates")}
              value={l.templates}
              onChange={(v) => setLimits({ templates: v })}
              hint={t("admin.pl.unlimitedHint")}
            />
            <NumField
              label={t("admin.pl.videoLen")}
              value={l.videoMaxSeconds}
              onChange={(v) => setLimits({ videoMaxSeconds: v })}
              hint={t("admin.pl.videoLenHint")}
            />
            <NumField
              label={t("admin.pl.videoTrial")}
              value={l.videoTrialDays}
              onChange={(v) => setLimits({ videoTrialDays: v })}
              hint={t("admin.pl.videoTrialHint")}
            />
          </div>

          <div>
            <p className="label text-fog">{t("admin.pl.exportFormats")}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EXPORTS.map((f) => (
                <Toggle
                  key={f}
                  label={f}
                  value={l.exports.includes(f)}
                  onChange={(on) =>
                    setLimits({
                      exports: on ? [...l.exports, f] : l.exports.filter((x) => x !== f),
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <p className="label text-fog">{t("admin.pl.capabilities")}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Toggle
                label={t("admin.pl.capTeamspace")}
                value={l.teamspace}
                onChange={(v) => setLimits({ teamspace: v })}
              />
              <Toggle
                label={t("admin.pl.capShare")}
                value={l.shareLinks}
                onChange={(v) => setLimits({ shareLinks: v })}
              />
              <Toggle
                label={t("admin.pl.capBranding")}
                value={l.branding}
                onChange={(v) => setLimits({ branding: v })}
              />
              <Toggle
                label={t("admin.pl.capRoles")}
                value={l.roles}
                onChange={(v) => setLimits({ roles: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlans() {
  const t = useT();
  const plans = useAdminPlans();
  const update = useUpdatePlan();
  const create = useCreatePlan();
  const setVisible = useSetPlanVisible();
  const remove = useDeletePlan();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newPlan, setNewPlan] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plans.data) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const p of plans.data.plans) {
        if (next[p.id]) continue;
        const limits = p.limits as unknown as Limits;
        next[p.id] = {
          id: p.id,
          name: p.name,
          priceCents: p.priceCents,
          period: p.period,
          tagline: p.tagline,
          features: (p.features as string[]).join("\n"),
          limits: { ...limits, exports: limits.exports ?? ["pdf"] },
          visible: p.visible,
          sortOrder: p.sortOrder,
          autumnPlanId: p.autumnPlanId ?? "",
        };
      }
      return next;
    });
  }, [plans.data]);

  const payload = (d: Draft) => ({
    name: d.name,
    priceCents: d.priceCents,
    period: d.period,
    tagline: d.tagline,
    features: d.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    limits: d.limits,
    visible: d.visible,
    sortOrder: d.sortOrder,
    autumnPlanId: d.autumnPlanId.trim() || null,
  });

  const guard = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.actionFailed"));
    }
  };

  return (
    <AdminShell
      title={t("admin.nav.plans")}
      subtitle={t("admin.pl.subtitle")}
      actions={
        <button
          type="button"
          onClick={() => setNewPlan(newPlan ? null : { ...BLANK })}
          className="rounded-[8px] mono flex items-center gap-1.5 border border-amber/50 bg-amber/10 px-3 py-1.5 text-[11px] uppercase tracking-widest text-amber hover:bg-amber/20"
        >
          <Plus className="size-3.5" /> {t("admin.pl.newPlan")}
        </button>
      }
    >
      {error && (
        <p className="rounded-[8px] mb-4 border border-alert/50 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
          {error}
        </p>
      )}

      <p className="mb-4 flex items-start gap-2 rounded-[12px] border border-line bg-ink-2 px-3 py-2.5 text-[12.5px] leading-relaxed text-fog">
        <Info className="mt-0.5 size-4 shrink-0 text-amber" />
        {t("admin.pl.i18nNote")}
      </p>

      {plans.data?.processorNote && (
        <p className="rounded-[8px] mb-4 flex items-start gap-2 border border-sky/40 bg-sky/10 px-3 py-2.5 text-[12.5px] leading-relaxed text-chalk">
          <Info className="mt-0.5 size-4 shrink-0 text-sky" />
          {t("admin.pl.processorNote")}
        </p>
      )}

      <div className="space-y-4">
        {newPlan && (
          <PlanEditor
            draft={newPlan}
            setDraft={setNewPlan}
            saving={create.isPending}
            isNew
            onSave={() =>
              guard(async () => {
                await create.mutateAsync({ ...payload(newPlan), id: newPlan.id || undefined });
                setNewPlan(null);
              })
            }
          />
        )}

        {plans.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-[12px] border border-line bg-ink-2" />
          ))}

        {plans.data?.plans.map((p) => {
          const draft = drafts[p.id];
          if (!draft) return null;
          return (
            <PlanEditor
              key={p.id}
              draft={draft}
              setDraft={(d) => setDrafts((prev) => ({ ...prev, [p.id]: d }))}
              saving={update.isPending || setVisible.isPending}
              workspaces={p.workspaces}
              canDelete={p.isCustom && p.workspaces === 0}
              onDelete={() => {
                if (!window.confirm(t("admin.pl.confirmDelete", { name: p.name }))) return;
                guard(() => remove.mutateAsync({ id: p.id }));
              }}
              onSave={() => guard(() => update.mutateAsync({ id: p.id, ...payload(draft) }))}
            />
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-[12px] text-fog">
        <EyeOff className="size-3.5" /> {t("admin.pl.footnote")} <Eye className="size-3.5" />
      </p>
    </AdminShell>
  );
}
