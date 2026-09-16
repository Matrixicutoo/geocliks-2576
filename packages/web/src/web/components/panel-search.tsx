import { Search, X } from "lucide-react";
import { useT } from "../lib/i18n";

/**
 * The search row on a dashboard panel — Projects and Notes both wear one.
 *
 * It sits under the panel header rather than inside it: those headers already carry a title,
 * the open/archived tabs and an add button, and squeezing a field in beside them left it too
 * narrow to read an address in.
 *
 * The clear button only appears once there is something to clear, so the resting state stays a
 * plain field. Escape clears too, which is what the key does in every other search box.
 */
export function PanelSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const t = useT();

  return (
    <div className="border-b border-line px-3 py-2">
      <label className="flex items-center gap-2 rounded-[8px] border border-line bg-ink px-2.5 py-1.5 focus-within:border-amber">
        <Search className="size-3.5 shrink-0 text-steel" />
        <input
          type="search"
          aria-label={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onChange("");
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[12px] text-chalk outline-none placeholder:text-fog/60 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            aria-label={t("search.clear")}
            onClick={() => onChange("")}
            className="shrink-0 text-steel transition-colors hover:text-amber"
          >
            <X className="size-3.5" />
          </button>
        )}
      </label>
    </div>
  );
}
