import { useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Plus, Stamp, Star, Trash2 } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { WatermarkPreview, type WatermarkLayout } from "../components/watermark-preview";
import { formatCoords, formatStamp } from "../components/evidence-card";
import {
  useCreateTemplate,
  useOrg,
  useRemoveTemplate,
  useSetDefaultTemplate,
  useTemplates,
  useUpdateTemplate,
} from "../queries/orgs";
import { orpc } from "../lib/api";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";

const SAMPLE = "/images/samples/fiber-splice-closure.jpg";

const LAYOUTS: { id: WatermarkLayout; label: TKey; hint: TKey }[] = [
  { id: "classic", label: "templates.l.classic", hint: "templates.h.classic" },
  { id: "compact", label: "templates.l.compact", hint: "templates.h.compact" },
  { id: "detailed", label: "templates.l.detailed", hint: "templates.h.detailed" },
  { id: "branded", label: "templates.l.branded", hint: "templates.h.branded" },
];

const ACCENTS = ["#FFB021", "#1FC16B", "#48A9FF", "#FF5A47", "#E8EDF4"];

const DEMO = {
  time: formatStamp(Date.now()),
  coords: formatCoords(44.9812, -93.2643),
  address: "1420 Ridgeline Dr, Saint Paul, MN 55108",
  project: "Ridgeline FTTH — Phase 2",
};

export default function AppTemplates() {
  const t = useT();
  const org = useOrg();
  const templates = useTemplates();
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const setDefault = useSetDefaultTemplate();
  const remove = useRemoveTemplate();
  const fileRef = useRef<HTMLInputElement>(null);
  // Field crews capture with the stamps; curating them is manager and above.
  const canManage = org.data?.role !== "field";

  const [layout, setLayout] = useState<WatermarkLayout>("detailed");
  const [name, setName] = useState("");
  const [accentColor, setAccentColor] = useState("#FFB021");
  const [companyLine, setCompanyLine] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadLogo(file: File) {
    setUploading(true);
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
      setLogoUrl(presign.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <DashboardShell
      title={t("templates.title")}
      subtitle={t("templates.subtitle")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-[12px] border border-line bg-ink-2 p-4">
            <p className="label mb-3 text-fog">
              {t("templates.livePreview")} — {layout}
            </p>
            <WatermarkPreview
              layout={layout}
              image={SAMPLE}
              className="aspect-[3/2] w-full"
              data={{
                ...DEMO,
                company: companyLine || org.data?.org.name,
                logoUrl,
                accentColor,
              }}
            />
            <p className="mono mt-3 text-[10.5px] leading-relaxed text-fog">
              {t("templates.sampleNote")}
            </p>
          </div>

          <div className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("templates.saved")}</p>
            </div>
            {templates.isLoading ? (
              <div className="space-y-px">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse bg-ink-3/50" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {(templates.data ?? []).map((tpl) => (
                  <li key={tpl.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span
                      className="rounded-[4px] size-3 shrink-0 border border-white/20"
                      style={{ background: tpl.accentColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-chalk">
                        {tpl.name}
                        {tpl.isDefault && (
                          <span className="rounded-[6px] mono ml-2 border border-amber/40 bg-amber/10 px-1.5 py-0.5 text-[9.5px] uppercase tracking-widest text-amber">
                            {t("templates.defaultBadge")}
                          </span>
                        )}
                      </p>
                      <p className="mono text-[10px] uppercase tracking-widest text-fog">
                        {tpl.layout} ·{" "}
                        {tpl.showLogo ? t("templates.logoOn") : t("templates.noLogo")} ·{" "}
                        {tpl.companyLine || t("templates.noCompany")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLayout(tpl.layout as WatermarkLayout)}
                      className="rounded-[12px] border border-line px-2.5 py-1.5 text-[11.5px] text-chalk transition-colors hover:border-sky/60 hover:text-sky"
                    >
                      {t("templates.preview")}
                    </button>
                    {canManage && (
                    <>
                    <button
                      type="button"
                      disabled={tpl.isDefault || setDefault.isPending}
                      onClick={() => setDefault.mutate({ id: tpl.id })}
                      className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[11.5px] text-chalk transition-colors hover:border-amber/60 hover:text-amber disabled:opacity-30"
                    >
                      <Star className="size-3.5" /> {t("templates.defaultBadge")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        update.mutate({ id: tpl.id, showLogo: !tpl.showLogo, logoUrl })
                      }
                      className="rounded-[12px] border border-line px-2.5 py-1.5 text-[11.5px] text-fog transition-colors hover:text-chalk"
                    >
                      {tpl.showLogo ? t("templates.hideLogo") : t("templates.showLogo")}
                    </button>
                    <button
                      type="button"
                      disabled={tpl.isDefault}
                      onClick={() => remove.mutate({ id: tpl.id })}
                      aria-label={t("common.delete")}
                      className="rounded-[12px] border border-line p-1.5 text-fog transition-colors hover:border-alert/50 hover:text-alert disabled:opacity-30"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {!canManage ? (
          <div className="h-fit rounded-[12px] border border-line bg-ink-2 p-4">
            <p className="font-display text-[15px] font-semibold">{t("perm.managerOnly")}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-fog">{t("perm.templatesNote")}</p>
          </div>
        ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            try {
              await create.mutateAsync({
                name,
                layout,
                accentColor,
                showLogo: Boolean(logoUrl),
                logoUrl,
                companyLine: companyLine || null,
                fields: ["time", "coords", "address", "project"],
              });
              setName("");
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
          className="h-fit rounded-[12px] border border-line bg-ink-2"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-[15px] font-semibold">{t("templates.new")}</p>
          </div>

          <div className="space-y-4 p-4">
            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("templates.name")}</span>
              <input
                aria-label={t("templates.name")}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fiber as-built stamp"
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
            </label>

            <div>
              <span className="label mb-1.5 block text-fog">{t("templates.layout")}</span>
              <div className="space-y-1.5">
                {LAYOUTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLayout(item.id)}
                    className={cn(
                      "rounded-[8px] flex w-full items-start gap-2 border px-3 py-2 text-left transition-colors",
                      layout === item.id
                        ? "border-amber bg-amber/10"
                        : "border-line bg-ink hover:border-fog/50",
                    )}
                  >
                    <Check
                      className={cn(
                        "mt-0.5 size-3.5 shrink-0",
                        layout === item.id ? "text-amber" : "text-transparent",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="mono block text-[11px] uppercase tracking-widest text-chalk">
                        {t(item.label)}
                      </span>
                      <span className="block text-[11.5px] text-fog">{t(item.hint)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label mb-1.5 block text-fog">{t("templates.accent")}</span>
              <div className="flex gap-2">
                {ACCENTS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={t("templates.accentColor", { color })}
                    onClick={() => setAccentColor(color)}
                    style={{ background: color }}
                    className={cn(
                      "rounded-[8px] size-7 border transition-transform",
                      accentColor === color
                        ? "scale-110 border-chalk"
                        : "border-transparent hover:scale-105",
                    )}
                  />
                ))}
              </div>
            </div>

            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("templates.company")}</span>
              <input
                aria-label={t("templates.company")}
                value={companyLine}
                onChange={(e) => setCompanyLine(e.target.value)}
                placeholder={org.data?.org.name ?? "Northline Communications"}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
            </label>

            <div>
              <span className="label mb-1.5 block text-fog">{t("templates.logo")}</span>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={t("templates.logo")}
                    className="size-11 rounded-[12px] border border-line bg-ink object-contain p-1"
                  />
                ) : (
                  <span className="rounded-[8px] grid size-11 place-items-center border border-dashed border-line text-fog">
                    <ImagePlus className="size-4" />
                  </span>
                )}
                <input
                  aria-label={t("templates.upload")}
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadLogo(file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[12px] text-chalk transition-colors hover:border-amber/60 hover:text-amber disabled:opacity-60"
                >
                  {uploading && <Loader2 className="size-3.5 animate-spin" />}
                  {logoUrl ? t("templates.replace") : t("templates.upload")}
                </button>
              </div>
            </div>

            {error && <p className="mono text-[11px] text-alert">{error}</p>}

            <button
              type="submit"
              disabled={create.isPending}
 className="rounded-[8px] inline-flex w-full items-center justify-center gap-2 bg-amber px-4 py-2.5 text-[13px] font-semibold text-ink disabled:opacity-60"
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {t("templates.save")}
            </button>

            <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-fog">
              <Stamp className="mt-0.5 size-3.5 shrink-0 text-amber" />
              {t("templates.hint")}
            </p>
          </div>
        </form>
        )}
      </div>
    </DashboardShell>
  );
}
