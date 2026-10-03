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
 * Nothing signs GeoCliks' own name under the company's here. The bar is the customer's
 * letterhead inside their own account, and a product caption below it only competed with the
 * name it was sitting under.
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
             background, and the bar height must not move with them. The box is deliberately
             larger than the identity avatars below it — this is the mark people recognise their
             own account by, and it is the one thing in the column that should read at a
             glance from arm's length.

             Circular, matching the profile avatar. The padding is what makes that safe: a wide
             logo drawn edge to edge in a circle loses its ends to the curve, so it is inset far
             enough that the whole mark stays inside the round frame. */
          className="size-14 shrink-0 rounded-full border border-line bg-white/5 object-contain p-0.5"
        />
      ) : (
        <LogoMark className="size-14 shrink-0" />
      )}
      {/* Amber, not chalk: the company name is the heading of the whole signed-in chrome, and
          the accent is what separates it from the ordinary white body text under it. */}
      <span className="font-display line-clamp-2 min-w-0 text-[15px] font-extrabold leading-[1.15] tracking-tight text-amber-ink">
        {name}
      </span>
    </span>
  );
}
