import { useOrg } from "../queries/orgs";
import { cn } from "../lib/utils";
import { Logo, LogoMark } from "./logo";

/**
 * The brand block in the signed-in chrome's top-left corner: the workspace's own logo and
 * company name, standing where the GeoCliks lockup used to.
 *
 * Inside the app the workspace is the brand. People print these reports for their own clients
 * and hand the tablet to their own crew, so the corner that anchors every screen should say
 * whose account this is — GeoCliks is the tool, not the letterhead. The product mark still owns
 * the public site, the auth screens and the admin console, which is why this lives beside
 * `Logo` rather than replacing it.
 *
 * Degrading in two steps keeps the bar from ever looking broken:
 * - logo uploaded -> that image, with the company name beside it
 * - name but no logo -> the GeoCliks globe as a neutral mark, company name beside it
 * - neither (loading, signed out, no org yet) -> the full GeoCliks lockup, unchanged
 *
 * The name is clamped to two lines instead of truncated at one: "Northside Mechanical
 * Contracting" is a normal company name and cutting it to "Northside Mech…" reads as a bug.
 */
export function WorkspaceBrand({ className }: { className?: string }) {
  const org = useOrg();
  const name = org.data?.org.name?.trim();
  const logoUrl = org.data?.org.logoUrl;

  // No workspace to show yet — keep the product lockup rather than flashing an empty bar.
  if (!name) return <Logo className={className} />;

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          /* Fixed box, `contain`, light hairline: logos arrive as any aspect ratio on any
             background, and the bar height must not move with them. */
          className="size-8 shrink-0 rounded-[8px] border border-line bg-white/5 object-contain"
        />
      ) : (
        <LogoMark className="shrink-0" />
      )}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-display line-clamp-2 text-[14px] font-extrabold leading-[1.15] tracking-tight text-chalk">
          {name}
        </span>
        {/* The product still signs its own chrome, just quietly — one mono line under the
            company name, the same slot the "FIELD EVIDENCE" tagline used to hold. */}
        <span className="mono mt-1 shrink-0 text-[8.5px] tracking-[0.28em] text-fog">
          GEOCLIKS
        </span>
      </span>
    </span>
  );
}
