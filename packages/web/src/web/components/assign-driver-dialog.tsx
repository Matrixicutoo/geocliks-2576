import { useState } from "react";
import { Check, Loader2, Truck, X } from "lucide-react";
import { useTeam } from "../queries/team";
import { useAssignRoute } from "../queries/routes";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

/**
 * The delivery-side twin of AssignCrewDialog: one popup for "who is driving this run", opened
 * from the runs list and from the run page itself.
 *
 * A route carries exactly one driver, so this is a single-select — picking someone replaces
 * whoever held it, and tapping the person who already has it hands the run back to Unassigned
 * (the server drops it to `draft` when it does). The write goes through routes.assign and the
 * list refetches, so the row always shows the server's answer rather than an optimistic guess.
 */
export function AssignDriverDialog({
  routeId,
  routeName,
  driverId,
  onClose,
}: {
  routeId: string;
  routeName?: string | null;
  driverId: string | null;
  onClose: () => void;
}) {
  const t = useT();
  const team = useTeam();
  const assign = useAssignRoute();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const rows = team.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-[12px] border border-line bg-ink-2">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">{t("driver.title")}</p>
            <p className="mono truncate text-[10.5px] uppercase tracking-widest text-fog">
              {routeName ?? ""}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onClose}
            className="text-fog hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="border-b border-line px-5 py-2.5 text-[12.5px] leading-relaxed text-fog">
          {t("driver.body")}
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {team.isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse bg-ink-3/50" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="px-5 py-6 text-center text-[12.5px] text-fog">{t("driver.empty")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {rows.map((member) => {
                const on = driverId === member.userId;
                const label = member.user?.name ?? member.user?.email ?? t("team.unknownUser");
                const pending = busy === member.userId && assign.isPending;
                return (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-3/40"
                  >
                    {member.user?.image ? (
                      <img
                        src={member.user.image}
                        alt=""
                        className="size-9 shrink-0 rounded-[12px] border border-line object-cover"
                      />
                    ) : (
                      <span className="mono grid size-9 shrink-0 place-items-center rounded-[12px] border border-line bg-ink text-[12px] text-amber">
                        {label.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-chalk">{label}</p>
                      <p className="mono truncate text-[10.5px] uppercase tracking-widest text-fog">
                        {member.role}
                        {member.user?.email ? ` · ${member.user.email}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={assign.isPending}
                      onClick={async () => {
                        setError(null);
                        setBusy(member.userId);
                        try {
                          await assign.mutateAsync({
                            routeId,
                            driverId: on ? null : member.userId,
                          });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : String(err));
                        } finally {
                          setBusy(null);
                        }
                      }}
                      className={cn(
                        "mono inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[10px] uppercase tracking-widest transition-colors disabled:opacity-60",
                        on
                          ? "border-verified/50 bg-verified/10 text-verified hover:border-alert/60 hover:text-alert"
                          : "border-line text-fog hover:border-amber hover:text-amber",
                      )}
                    >
                      {pending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : on ? (
                        <Check className="size-3" />
                      ) : (
                        <Truck className="size-3" />
                      )}
                      {on ? t("driver.assigned") : t("driver.add")}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && (
          <p className="mono border-t border-alert/40 bg-alert/10 px-5 py-2 text-[11px] text-alert">
            {error}
          </p>
        )}

        <div className="flex justify-end border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] mono bg-amber px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-ink hover:bg-amber-deep"
          >
            {t("driver.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
