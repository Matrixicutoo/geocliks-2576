import { useState } from "react";
import { MapPinOff } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { PhotoDrawer } from "../components/photo-drawer";
import { EvidenceMap, type MapPin } from "../components/evidence-map";
import { usePhotoMap } from "../queries/photos";
import { useProjects } from "../queries/projects";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

/**
 * The map is the page, so it runs to the foot of the window rather than sitting in a 560px
 * letterbox with dead space under it: window height less the pinned header and the page's own
 * bottom padding. `min-h` keeps it usable on a short laptop screen, where the subtraction would
 * otherwise leave a sliver.
 */
const MAP_H = "h-[calc(100dvh-124px)] min-h-[420px]";

export default function MapPage() {
  const t = useT();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(true);
  const pins = usePhotoMap(projectId);
  const projects = useProjects();

  const rows = (pins.data ?? []) as unknown as MapPin[];
  const hasPins = rows.some((r) => r.lat != null && r.lng != null);

  return (
    <DashboardShell
      title={t("map.title")}
      subtitle={t("map.subtitle")}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRoute((v) => !v)}
            className={cn(
              "rounded-[8px] mono border px-2.5 py-2 text-[10.5px] uppercase tracking-widest transition-colors",
              showRoute
                ? "border-amber/60 bg-amber/10 text-amber"
                : "border-line bg-ink-2 text-fog hover:border-fog/50",
            )}
          >
            {t("map.route")}
          </button>
          <select
            aria-label={t("teamspace.projectFilter")}
            value={projectId ?? ""}
            onChange={(e) => setProjectId(e.target.value || null)}
            className="mono rounded-[8px] border border-line bg-ink-2 px-2.5 py-2 text-[10.5px] uppercase tracking-widest text-chalk outline-none focus:border-amber"
          >
            <option value="">{t("common.allProjects")}</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {pins.isLoading ? (
        <div className={cn(MAP_H, "animate-pulse rounded-[12px] border border-line bg-ink-2")} />
      ) : !hasPins ? (
        <EmptyState
          icon={MapPinOff}
          title={t("map.empty.title")}
          hint={t("map.empty.hint")}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <EvidenceMap
            pins={rows}
            onSelect={setOpenPhoto}
            showRoute={showRoute}
            className={MAP_H}
          />

          <aside
            // Same ceiling as the map, but a short log still draws short rather than as a
            // window-tall empty box.
            className="max-h-[calc(100dvh-124px)] space-y-2 overflow-y-auto rounded-[12px] border border-line bg-ink-2 p-3"
          >
            <p className="label">{t("map.coordLog")}</p>
            {rows.slice(0, 60).map((pin) => (
              <button
                key={pin.id}
                type="button"
                onMouseEnter={() => setHover(pin.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setOpenPhoto(pin.id)}
                className={cn(
                  "rounded-[8px] block w-full border px-2.5 py-2 text-left transition-colors",
                  hover === pin.id ? "border-amber/60 bg-ink-3" : "border-line hover:border-fog/50",
                )}
              >
                <p className="mono text-[10px] tracking-widest text-amber">{pin.photoCode}</p>
                <p className="mono mt-0.5 text-[10px] text-chalk">
                  {(pin.lat as number).toFixed(5)}, {(pin.lng as number).toFixed(5)}
                </p>
                <p className="mono truncate text-[9.5px] text-fog">
                  {pin.userName ?? "—"} · {pin.address ?? "—"}
                </p>
              </button>
            ))}
          </aside>
        </div>
      )}

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
