import { cn } from "../lib/utils";

/** One chip per role, so permissions are readable without opening the role dropdown. */
const ROLE_STYLES: Record<string, string> = {
  owner: "border-amber/60 bg-amber/10 text-amber",
  admin: "border-sky/60 bg-sky/10 text-sky",
  manager: "border-verified/60 bg-verified/10 text-verified",
  field: "border-line bg-ink text-fog",
};

/**
 * Deliberately English and uppercase, matching the existing `BUSINESS / FIELD` plan chip in the
 * account menu — role names are workspace vocabulary, not prose, so they stay untranslated.
 */
export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-[6px] mono inline-block shrink-0 border px-1.5 py-1 text-[10px] uppercase tracking-widest",
        ROLE_STYLES[role] ?? ROLE_STYLES.field,
        className,
      )}
    >
      {role}
    </span>
  );
}
