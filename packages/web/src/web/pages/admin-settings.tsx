import { useEffect, useState } from "react";
import { Facebook, Instagram, Linkedin, Save, Youtube } from "lucide-react";
import { AdminShell } from "../components/admin-shell";
import { useAdminSocials, useUpdateSocials } from "../queries/admin";
import { useT } from "../lib/i18n";

type Socials = {
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  xUrl: string;
};

const BLANK: Socials = {
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  xUrl: "",
};

/**
 * lucide-react has no X brand mark, so it is drawn inline here exactly as the
 * public footer draws it.
 */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.53 3h3.06l-6.69 7.64L21.75 21h-6.16l-4.82-6.3L5.25 21H2.19l7.15-8.17L2.25 3h6.31l4.36 5.77L17.53 3Zm-1.07 16.13h1.7L7.62 4.78H5.8l10.66 14.35Z" />
    </svg>
  );
}

const FIELDS: {
  key: keyof Socials;
  label: string;
  placeholder: string;
  Icon: React.ElementType;
}[] = [
  {
    key: "facebookUrl",
    label: "Facebook",
    placeholder: "https://www.facebook.com/geocliks",
    Icon: Facebook,
  },
  {
    key: "instagramUrl",
    label: "Instagram",
    placeholder: "https://www.instagram.com/geocliks",
    Icon: Instagram,
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/company/geocliks",
    Icon: Linkedin,
  },
  {
    key: "youtubeUrl",
    label: "YouTube",
    placeholder: "https://www.youtube.com/@geocliks",
    Icon: Youtube,
  },
  { key: "xUrl", label: "X", placeholder: "https://x.com/geocliks", Icon: XIcon },
];

/**
 * Company-wide settings for the public marketing site. This lives in the admin
 * console rather than a workspace dashboard because the landing page footer is
 * the GeoCliks company site, not any one customer's Teamspace.
 */
export default function AdminSettings() {
  const t = useT();
  const socials = useAdminSocials();
  const update = useUpdateSocials();
  const [draft, setDraft] = useState<Socials>(BLANK);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (socials.data) setDraft({ ...BLANK, ...socials.data });
  }, [socials.data]);

  const invalid = FIELDS.filter(
    (f) => draft[f.key] !== "" && !/^https:\/\/\S+$/i.test(draft[f.key].trim()),
  ).map((f) => f.label);

  const save = () => {
    setSaved(false);
    const trimmed = Object.fromEntries(
      Object.entries(draft).map(([k, v]) => [k, v.trim()]),
    ) as Socials;
    update.mutate(trimmed, { onSuccess: () => setSaved(true) });
  };

  return (
    <AdminShell title={t("admin.nav.settings")} subtitle="Public marketing site">
      <div className="max-w-[720px] rounded-[12px] border border-line bg-ink-2">
        <div className="border-b border-line px-4 py-3">
          <p className="font-display text-lg font-bold text-chalk">Social links</p>
          <p className="mt-1 text-[13px] text-fog">
            These icons appear in the footer of the public geocliks.com pages. Paste a full{" "}
            <span className="mono text-chalk">https://</span> profile URL to show a network. Clear a
            field to remove its icon — an empty field renders nothing at all.
          </p>
        </div>

        <div className="space-y-4 p-4">
          {FIELDS.map(({ key, label, placeholder, Icon }) => (
            <label key={key} className="block">
              <span className="label flex items-center gap-2 text-fog">
                <Icon className="size-3.5" />
                {label}
              </span>
              <input
                aria-label={label}
                type="url"
                inputMode="url"
                value={draft[key]}
                placeholder={placeholder}
                onChange={(e) => {
                  setSaved(false);
                  setDraft({ ...draft, [key]: e.target.value });
                }}
                className="mono mt-1 w-full rounded-[8px] border border-line bg-ink px-2 py-2 text-[13px] text-chalk placeholder:text-fog/60 focus:border-amber focus:outline-none"
              />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={save}
            disabled={update.isPending || invalid.length > 0}
            className="rounded-[8px] mono flex items-center gap-2 bg-amber px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-amber-deep disabled:opacity-50"
          >
            <Save className="size-3.5" />
            {update.isPending ? "Saving…" : "Save"}
          </button>
          {invalid.length > 0 && (
            <p className="mono text-[10.5px] uppercase tracking-widest text-alert">
              {invalid.join(", ")} must start with https://
            </p>
          )}
          {update.error && (
            <p className="mono text-[10.5px] uppercase tracking-widest text-alert">
              {update.error.message}
            </p>
          )}
          {saved && !update.isPending && (
            <p className="mono text-[10.5px] uppercase tracking-widest text-verified">
              Saved — the footer updates on the next page load
            </p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
