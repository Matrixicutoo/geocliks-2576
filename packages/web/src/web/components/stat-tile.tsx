import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

export function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent = "chalk",
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: "chalk" | "amber" | "verified" | "sky";
  loading?: boolean;
}) {
  const accentClass = {
    chalk: "text-chalk",
    amber: "text-amber",
    verified: "text-verified",
    sky: "text-sky",
  }[accent];

  return (
 <div className="relative rounded-[12px] border border-line bg-ink-2 p-4">
      <div className="flex items-start justify-between">
        <span className="label">{label}</span>
        <Icon className={cn("size-4", accentClass)} />
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse bg-ink-3" />
      ) : (
        <p className={cn("mono mt-2 text-3xl font-semibold leading-none", accentClass)}>{value}</p>
      )}
      {sub && <p className="mt-2 text-xs text-fog">{sub}</p>}
    </div>
  );
}
