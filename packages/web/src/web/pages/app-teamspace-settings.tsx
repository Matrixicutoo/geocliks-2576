import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { useOrg, useUpdateOrg } from "../queries/orgs";
import { orpc } from "../lib/api";
import { useLocale, useT } from "../lib/i18n";
import {
  COMPANY_SIZES,
  COUNTRIES,
  INDUSTRIES,
  REFERRAL_SOURCES,
  countryName,
  optionLabel,
  orderedTimezones,
  timezoneLabel,
} from "../lib/company-fields";

/** Every editable text field on the page, in the order the form shows them. */
const TEXT_FIELDS = [
  "name",
  "phone",
  "email",
  "address1",
  "address2",
  "city",
  "state",
  "postalCode",
] as const;

const SELECT_FIELDS = ["country", "timezone", "industry", "companySize", "referralSource"] as const;

type Field = (typeof TEXT_FIELDS)[number] | (typeof SELECT_FIELDS)[number];

type Form = Record<Field, string>;

const EMPTY: Form = {
  name: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  timezone: "",
  industry: "",
  companySize: "",
  referralSource: "",
};

const INPUT_CLASS =
  "mt-1.5 w-full rounded-[8px] border border-line bg-ink px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber disabled:opacity-60";

/**
 * Both field components live at module scope on purpose: declared inside the page they would
 * be a new component type on every render, so React would unmount the input mid-keystroke and
 * the caret would jump out of the box after every letter.
 */
function TextField({
  label,
  value,
  onChange,
  disabled,
  required,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="label text-fog">
        {label}
        {required ? <span className="text-amber-ink"> *</span> : null}
      </span>
      <input
        type={type ?? "text"}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="label text-fog">{label}</span>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Teamspace settings: the company profile behind the workspace card.
 *
 * This is the workspace's own identity — its legal name, where it invoices from, what trade
 * it is in — as opposed to the person using it, which stays on the profile page. The server
 * lets only the owner write it (`requireRole(role, "owner")` on `orgs.update`), so everyone
 * else gets the same page with the inputs locked rather than a 403 on save.
 */
export default function AppTeamspaceSettings() {
  const t = useT();
  const { locale } = useLocale();
  const org = useOrg();
  const updateOrg = useUpdateOrg();
  const logoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Form>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwner = org.data?.role === "owner";
  const record = org.data?.org;
  /** Already a usable link when it arrives: the server mints it from the stored key. */
  const logo = record?.logoUrl ?? null;

  const timezones = useMemo(() => orderedTimezones(), []);
  const countries = useMemo(
    () =>
      COUNTRIES.map((country) => ({ code: country.code, name: countryName(country, locale) })).sort(
        (a, b) => a.name.localeCompare(b.name, locale),
      ),
    [locale],
  );

  // Seeded once, from the first response that carries the row. Re-seeding on every render of
  // fresh org data would fight the person typing, since `orgs.current` refetches on focus.
  useEffect(() => {
    if (!record || loaded) return;
    setForm({
      name: record.name ?? "",
      phone: record.phone ?? "",
      email: record.email ?? "",
      address1: record.address1 ?? "",
      address2: record.address2 ?? "",
      city: record.city ?? "",
      state: record.state ?? "",
      postalCode: record.postalCode ?? "",
      country: record.country ?? "",
      timezone: record.timezone ?? "",
      industry: record.industry ?? "",
      companySize: record.companySize ?? "",
      referralSource: record.referralSource ?? "",
    });
    setLoaded(true);
  }, [record, loaded]);

  const set = (field: Field) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const flash = (message: string) => {
    setError(null);
    setNote(message);
    setTimeout(() => setNote(null), 4000);
  };

  async function save() {
    setError(null);
    const name = form.name.trim();
    if (name.length < 2) return;
    try {
      // Blank means "not set", which is null in the column rather than an empty string, so a
      // cleared field reads the same as one that was never filled in.
      await updateOrg.mutateAsync({
        name,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address1: form.address1.trim() || null,
        address2: form.address2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postalCode: form.postalCode.trim() || null,
        country: form.country || null,
        timezone: form.timezone || null,
        industry: form.industry || null,
        companySize: form.companySize || null,
        referralSource: form.referralSource || null,
      });
      flash(t("org.settings.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * The business logo lives on the workspace: it labels it in the sidebar and in the phone's
   * menu, and any watermark template without its own logo stamps this one. The column keeps
   * the bare storage key, never the presigned link.
   */
  async function uploadLogo(file: File) {
    setLogoUploading(true);
    setError(null);
    try {
      const presign = await orpc.upload.presignLogo.call({
        filename: file.name,
        contentType: file.type || "image/png",
      });
      const res = await fetch(presign.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/png" },
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await updateOrg.mutateAsync({ logoUrl: presign.key });
      flash(t("org.settings.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLogoUploading(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }

  async function removeLogo() {
    setError(null);
    try {
      await updateOrg.mutateAsync({ logoUrl: null });
      flash(t("org.settings.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <DashboardShell title={t("org.settings.title")} subtitle={t("org.settings.subtitle")}>
      <div className="max-w-3xl space-y-6">
        {!isOwner && (
          <p className="rounded-[12px] border border-line bg-ink-2 px-4 py-3 text-[13px] text-fog">
            {t("org.settings.ownerOnly")}
          </p>
        )}

        {/* Company logo */}
        <section className="rounded-[12px] border border-line bg-ink-2">
          <div className="border-b border-line px-4 py-3">
            <p className="label text-fog">{t("org.settings.brand")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 p-4">
            {logo ? (
              <img
                src={logo}
                alt={t("org.settings.brand")}
                className="size-20 shrink-0 rounded-[10px] border border-line bg-ink object-contain p-1.5"
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-line text-fog">
                <Building2 className="size-6" />
              </div>
            )}
            {isOwner ? (
              <div className="min-w-0 space-y-2">
                <p className="text-[12px] text-fog">{t("org.logo.drop")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    aria-label={t("org.logo.upload")}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadLogo(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    disabled={logoUploading}
                    className="rounded-[8px] flex items-center gap-2 border border-amber px-3 py-2 text-[13px] font-medium text-amber-ink transition-colors hover:bg-amber hover:text-on-amber disabled:opacity-60"
                  >
                    {logoUploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImageIcon className="size-4" />
                    )}
                    {t("org.logo.upload")}
                  </button>
                  {logo && (
                    <button
                      type="button"
                      onClick={() => void removeLogo()}
                      className="rounded-[8px] border border-line px-3 py-2 text-[13px] text-fog transition-colors hover:border-alert hover:text-alert"
                    >
                      {t("common.delete")}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Company info */}
        <section className="rounded-[12px] border border-line bg-ink-2">
          <div className="border-b border-line px-4 py-3">
            <p className="label text-fog">{t("org.settings.companyInfo")}</p>
          </div>
          <div className="p-4">
            <TextField
              label={t("org.field.companyName")}
              value={form.name}
              onChange={set("name")}
              disabled={!isOwner}
              required
            />
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-[12px] border border-line bg-ink-2">
          <div className="border-b border-line px-4 py-3">
            <p className="label text-fog">{t("org.settings.contact")}</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <TextField
              label={t("org.field.phone")}
              value={form.phone}
              onChange={set("phone")}
              disabled={!isOwner}
              type="tel"
            />
            <TextField
              label={t("org.field.email")}
              value={form.email}
              onChange={set("email")}
              disabled={!isOwner}
              type="email"
            />
          </div>
        </section>

        {/* Address */}
        <section className="rounded-[12px] border border-line bg-ink-2">
          <div className="border-b border-line px-4 py-3">
            <p className="label text-fog">{t("org.settings.address")}</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label={t("org.field.address1")}
                value={form.address1}
                onChange={set("address1")}
                disabled={!isOwner}
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label={t("org.field.address2")}
                value={form.address2}
                onChange={set("address2")}
                disabled={!isOwner}
              />
            </div>
            <TextField
              label={t("org.field.city")}
              value={form.city}
              onChange={set("city")}
              disabled={!isOwner}
            />
            <TextField
              label={t("org.field.state")}
              value={form.state}
              onChange={set("state")}
              disabled={!isOwner}
            />
            <TextField
              label={t("org.field.postalCode")}
              value={form.postalCode}
              onChange={set("postalCode")}
              disabled={!isOwner}
            />
            <SelectField
              label={t("org.field.country")}
              value={form.country}
              onChange={set("country")}
              disabled={!isOwner}
              placeholder={t("org.settings.select")}
              options={countries.map((country) => ({ value: country.code, label: country.name }))}
            />
          </div>
        </section>

        {/* About the business */}
        <section className="rounded-[12px] border border-line bg-ink-2">
          <div className="border-b border-line px-4 py-3">
            <p className="label text-fog">{t("org.settings.about")}</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <SelectField
              label={t("org.field.timezone")}
              value={form.timezone}
              onChange={set("timezone")}
              disabled={!isOwner}
              placeholder={t("org.settings.select")}
              options={timezones.map((zone) => ({ value: zone.id, label: timezoneLabel(zone) }))}
            />
            <SelectField
              label={t("org.field.industry")}
              value={form.industry}
              onChange={set("industry")}
              disabled={!isOwner}
              placeholder={t("org.settings.select")}
              options={INDUSTRIES.map((key) => ({ value: key, label: optionLabel(key) }))}
            />
            <SelectField
              label={t("org.field.companySize")}
              value={form.companySize}
              onChange={set("companySize")}
              disabled={!isOwner}
              placeholder={t("org.settings.select")}
              options={COMPANY_SIZES.map((size) => ({ value: size, label: size }))}
            />
            <SelectField
              label={t("org.field.referral")}
              value={form.referralSource}
              onChange={set("referralSource")}
              disabled={!isOwner}
              placeholder={t("org.settings.select")}
              options={REFERRAL_SOURCES.map((key) => ({ value: key, label: optionLabel(key) }))}
            />
          </div>
        </section>

        {error ? <p className="text-[13px] text-alert">{error}</p> : null}
        {note ? <p className="text-[13px] text-verified">{note}</p> : null}

        {isOwner ? (
          <button
            type="button"
            onClick={() => void save()}
            disabled={updateOrg.isPending || form.name.trim().length < 2}
            className="rounded-[8px] flex items-center gap-2 bg-amber px-4 py-2.5 text-[13px] font-semibold text-on-amber transition-opacity disabled:opacity-50"
          >
            {updateOrg.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t("profile.saveChanges")}
          </button>
        ) : null}
      </div>
    </DashboardShell>
  );
}
