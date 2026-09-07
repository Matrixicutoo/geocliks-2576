import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] flex flex-col items-center justify-center gap-3 border border-dashed border-line bg-ink-2/40 px-6 py-16 text-center">
 <span className="grid size-11 place-items-center rounded-[12px] border border-line bg-ink-3 text-fog">
        <Icon className="size-5" />
      </span>
      <p className="font-display text-base font-semibold text-chalk">{title}</p>
      {hint && <p className="max-w-sm text-sm text-fog">{hint}</p>}
      {action}
    </div>
  );
}
