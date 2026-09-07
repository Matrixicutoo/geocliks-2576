import { z } from "zod";
import { and, count, eq } from "drizzle-orm";
import { orgProc } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id, photoCode, shareToken } from "../lib/ids";
import { sign } from "../lib/verify";

/**
 * Sample field data so a brand-new workspace is never an empty screen.
 * Photos point at public sample assets (`/images/samples/...`) — `lib/media.ts` and
 * `lib/exports.ts` pass those through without an S3 round-trip.
 */

const HOUR = 3600_000;

interface SeedPhoto {
  file: string;
  tag: "general" | "before" | "after" | "issue" | "arrival" | "departure";
  note: string;
  lat: number;
  lng: number;
  address: string;
  asset?: string;
  hoursAgo: number;
  weather?: string;
}

interface SeedProject {
  name: string;
  code: string;
  client: string;
  category: string;
  locationLabel: string;
  address: string;
  lat: number;
  lng: number;
  status: "active" | "on_hold" | "complete";
  notes: string;
  photos: SeedPhoto[];
}

const PROJECTS: SeedProject[] = [
  {
    name: "Ridgeline FTTH — Phase 2",
    code: "FTTH-2214",
    client: "Northline Communications",
    category: "fiber",
    locationLabel: "Ridgeline Dr / Elm",
    address: "1420 Ridgeline Dr, Denver, CO 80211",
    lat: 39.766,
    lng: -105.021,
    status: "active",
    notes: "48ct backbone splice, 3 handholes. As-built package due to Northline on Friday.",
    photos: [
      {
        file: "fiber-trench.jpg",
        tag: "arrival",
        note: "Arrived on site, trench open and traffic control set.",
        lat: 39.7661,
        lng: -105.0212,
        address: "1420 Ridgeline Dr, Denver, CO 80211",
        asset: "trench",
        hoursAgo: 30,
        weather: "Clear 12°C",
      },
      {
        file: "fiber-handhole.jpg",
        tag: "before",
        note: "HH-2 before splice work. Existing slack coil undisturbed.",
        lat: 39.7664,
        lng: -105.0209,
        address: "1418 Ridgeline Dr, Denver, CO 80211",
        asset: "handhole",
        hoursAgo: 29,
      },
      {
        file: "fiber-splice-closure.jpg",
        tag: "general",
        note: "Closure opened, 48ct ribbon prepped and labeled.",
        lat: 39.7664,
        lng: -105.0209,
        address: "1418 Ridgeline Dr, Denver, CO 80211",
        asset: "splice closure",
        hoursAgo: 27,
      },
      {
        file: "fiber-splice-tray.jpg",
        tag: "general",
        note: "Tray 3 complete — 0.04 dB average loss across 12 fusions.",
        lat: 39.7664,
        lng: -105.0209,
        address: "1418 Ridgeline Dr, Denver, CO 80211",
        asset: "splice tray",
        hoursAgo: 26,
      },
      {
        file: "fiber-handhole.jpg",
        tag: "after",
        note: "HH-2 closed and sealed after splice. Slack racked per spec.",
        lat: 39.7664,
        lng: -105.0209,
        address: "1418 Ridgeline Dr, Denver, CO 80211",
        asset: "handhole",
        hoursAgo: 24,
      },
      {
        file: "fiber-technician.jpg",
        tag: "departure",
        note: "Crew off site, restoration scheduled for Thursday.",
        lat: 39.766,
        lng: -105.0215,
        address: "1420 Ridgeline Dr, Denver, CO 80211",
        hoursAgo: 23,
      },
    ],
  },
  {
    name: "Metro Loop Splice Audit",
    code: "AUD-0881",
    client: "City of Aurora",
    category: "telecom",
    locationLabel: "E Colfax segment",
    address: "9400 E Colfax Ave, Aurora, CO 80010",
    lat: 39.7402,
    lng: -104.8887,
    status: "active",
    notes: "Third-party audit of 6 splice points. KMZ deliverable for GIS import.",
    photos: [
      {
        file: "fiber-splice-tray.jpg",
        tag: "issue",
        note: "Unlabeled tray found at SP-4. Flagged for rework.",
        lat: 39.7404,
        lng: -104.8891,
        address: "9412 E Colfax Ave, Aurora, CO 80010",
        asset: "splice tray",
        hoursAgo: 51,
      },
      {
        file: "fiber-splice-closure.jpg",
        tag: "general",
        note: "SP-5 closure intact, gel seal in good condition.",
        lat: 39.7408,
        lng: -104.8902,
        address: "9500 E Colfax Ave, Aurora, CO 80010",
        asset: "splice closure",
        hoursAgo: 50,
      },
      {
        file: "fiber-handhole.jpg",
        tag: "general",
        note: "SP-6 handhole — standing water, drainage noted in report.",
        lat: 39.7411,
        lng: -104.8915,
        address: "9530 E Colfax Ave, Aurora, CO 80010",
        asset: "handhole",
        hoursAgo: 49,
      },
      {
        file: "fiber-technician.jpg",
        tag: "general",
        note: "OTDR trace captured at SP-6 for the audit record.",
        lat: 39.7411,
        lng: -104.8915,
        address: "9530 E Colfax Ave, Aurora, CO 80010",
        hoursAgo: 48,
      },
    ],
  },
  {
    name: "Brookfield RTU Retrofit",
    code: "HVAC-5507",
    client: "Brookfield Property Services",
    category: "hvac",
    locationLabel: "Roof — units 1-4",
    address: "2200 W Loop South, Houston, TX 77027",
    lat: 29.7395,
    lng: -95.4611,
    status: "active",
    notes: "4 rooftop units replaced. Warranty package needs before/after per unit.",
    photos: [
      {
        file: "hvac-rooftop.jpg",
        tag: "before",
        note: "RTU-1 before removal — 19 years in service, failed compressor.",
        lat: 29.7396,
        lng: -95.4612,
        address: "2200 W Loop South, Houston, TX 77027",
        asset: "rooftop unit",
        hoursAgo: 74,
        weather: "Humid 31°C",
      },
      {
        file: "hvac-install.jpg",
        tag: "general",
        note: "Crane set for RTU-1 replacement, curb adapter in place.",
        lat: 29.7396,
        lng: -95.4612,
        address: "2200 W Loop South, Houston, TX 77027",
        asset: "rooftop unit",
        hoursAgo: 72,
      },
      {
        file: "hvac-rtu-bank.jpg",
        tag: "after",
        note: "RTU-1 through RTU-4 set, charged and commissioned.",
        lat: 29.7396,
        lng: -95.4612,
        address: "2200 W Loop South, Houston, TX 77027",
        asset: "rooftop unit",
        hoursAgo: 26,
      },
      {
        file: "hvac-service.jpg",
        tag: "general",
        note: "Startup readings logged: 42 PSI suction, 18°F superheat.",
        lat: 29.7396,
        lng: -95.4612,
        address: "2200 W Loop South, Houston, TX 77027",
        asset: "rooftop unit",
        hoursAgo: 25,
      },
      {
        file: "hvac-service.jpg",
        tag: "departure",
        note: "Roof hatch secured, debris removed, site left clean.",
        lat: 29.7394,
        lng: -95.461,
        address: "2200 W Loop South, Houston, TX 77027",
        hoursAgo: 24,
      },
    ],
  },
  {
    name: "Harbor Point — Unit 4B Turnover",
    code: "PM-1132",
    client: "Harbor Point Residences",
    category: "property",
    locationLabel: "Building A, Unit 4B",
    address: "88 Harbor Point Rd, Stamford, CT 06902",
    lat: 41.0378,
    lng: -73.5401,
    status: "complete",
    notes: "Move-out condition record. Deposit dispute protection.",
    photos: [
      {
        file: "property-empty-unit.jpg",
        tag: "arrival",
        note: "Walkthrough start — keys collected 09:04.",
        lat: 41.0379,
        lng: -73.5402,
        address: "88 Harbor Point Rd, Stamford, CT 06902",
        hoursAgo: 98,
      },
      {
        file: "property-wear.jpg",
        tag: "issue",
        note: "Wall damage behind bedroom door, beyond normal wear.",
        lat: 41.0379,
        lng: -73.5402,
        address: "88 Harbor Point Rd, Stamford, CT 06902",
        asset: "drywall",
        hoursAgo: 97,
      },
      {
        file: "property-walkthrough.jpg",
        tag: "general",
        note: "Kitchen appliances clean and operational.",
        lat: 41.0379,
        lng: -73.5402,
        address: "88 Harbor Point Rd, Stamford, CT 06902",
        hoursAgo: 97,
      },
      {
        file: "property-interior.jpg",
        tag: "departure",
        note: "Unit secured, condition record closed and shared with tenant.",
        lat: 41.0379,
        lng: -73.5402,
        address: "88 Harbor Point Rd, Stamford, CT 06902",
        hoursAgo: 96,
      },
    ],
  },
  {
    name: "Maple Grove Roof Replacement",
    code: "ROOF-2091",
    client: "Delgado Family",
    category: "roofing",
    locationLabel: "South slope",
    address: "417 Maple Grove Ln, Charlotte, NC 28211",
    lat: 35.1727,
    lng: -80.8091,
    status: "complete",
    notes: "Insurance claim documentation — hail damage, full tear-off.",
    photos: [
      {
        file: "roof-damage.jpg",
        tag: "before",
        note: "Hail bruising on south slope, 9 hits per test square.",
        lat: 35.1728,
        lng: -80.8092,
        address: "417 Maple Grove Ln, Charlotte, NC 28211",
        asset: "shingle",
        hoursAgo: 144,
      },
      {
        file: "roof-before-after.jpg",
        tag: "general",
        note: "Tear-off complete, decking inspected — 4 sheets replaced.",
        lat: 35.1728,
        lng: -80.8092,
        address: "417 Maple Grove Ln, Charlotte, NC 28211",
        hoursAgo: 120,
      },
      {
        file: "roof-replaced.jpg",
        tag: "after",
        note: "New architectural shingles, ridge vent installed.",
        lat: 35.1728,
        lng: -80.8092,
        address: "417 Maple Grove Ln, Charlotte, NC 28211",
        asset: "shingle",
        hoursAgo: 98,
      },
      {
        file: "roof-replaced.jpg",
        tag: "departure",
        note: "Final cleanup, magnet sweep of driveway and lawn.",
        lat: 35.1726,
        lng: -80.809,
        address: "417 Maple Grove Ln, Charlotte, NC 28211",
        hoursAgo: 97,
      },
    ],
  },
  {
    name: "Westgate Shell — Progress Set",
    code: "CON-7740",
    client: "Vireo Construction Group",
    category: "construction",
    locationLabel: "Lot 12, Westgate",
    address: "5100 Westgate Blvd, Austin, TX 78745",
    lat: 30.2296,
    lng: -97.7996,
    status: "active",
    notes: "Weekly owner progress set. PDF to lender every Monday.",
    photos: [
      {
        file: "construction-framing.jpg",
        tag: "general",
        note: "Second floor framing topped out, sheathing 60% complete.",
        lat: 30.2297,
        lng: -97.7997,
        address: "5100 Westgate Blvd, Austin, TX 78745",
        asset: "framing",
        hoursAgo: 8,
        weather: "Overcast 24°C",
      },
      {
        file: "construction-site.jpg",
        tag: "general",
        note: "Site overview from the north corner for the weekly set.",
        lat: 30.2299,
        lng: -97.7992,
        address: "5100 Westgate Blvd, Austin, TX 78745",
        hoursAgo: 7,
      },
      {
        file: "construction-framing.jpg",
        tag: "issue",
        note: "Missing hold-down at grid C4 — RFI 022 opened.",
        lat: 30.2297,
        lng: -97.7997,
        address: "5100 Westgate Blvd, Austin, TX 78745",
        asset: "framing",
        hoursAgo: 6,
      },
      {
        file: "construction-site.jpg",
        tag: "departure",
        note: "Gates locked, materials tarped ahead of rain.",
        lat: 30.2299,
        lng: -97.7992,
        address: "5100 Westgate Blvd, Austin, TX 78745",
        hoursAgo: 5,
      },
    ],
  },
];

export const demo = {
  /** Idempotent — running twice does not duplicate anything. */
  seed: orgProc.input(z.object({ force: z.boolean().default(false) }).optional()).handler(
    async ({ input, context }) => {
      const [existing] = await db
        .select({ value: count() })
        .from(schema.projects)
        .where(eq(schema.projects.orgId, context.org.id));

      if ((existing?.value ?? 0) > 0 && !input?.force) {
        return { seeded: false, projects: existing?.value ?? 0 };
      }

      const orgId = context.org.id;
      const userId = context.user.id;
      const now = Date.now();
      const created: Array<{ projectId: string; photoIds: Record<string, string> }> = [];

      for (const seed of PROJECTS) {
        const projectId = id("prj");
        await db.insert(schema.projects).values({
          id: projectId,
          orgId,
          name: seed.name,
          code: seed.code,
          client: seed.client,
          category: seed.category,
          locationLabel: seed.locationLabel,
          address: seed.address,
          lat: seed.lat,
          lng: seed.lng,
          status: seed.status,
          notes: seed.notes,
          createdBy: userId,
        });

        const photoIds: Record<string, string> = {};

        for (const photo of seed.photos) {
          const capturedAt = now - photo.hoursAgo * HOUR;
          const skew = Math.round((Math.random() - 0.5) * 4000);
          const verifiedAt = capturedAt - skew;
          const code = photoCode();
          const storageKey = `/images/samples/${photo.file}`;
          const contentHash = await fakeHash(code);
          const photoId = id("pho");

          await db.insert(schema.photos).values({
            id: photoId,
            orgId,
            projectId,
            userId,
            photoCode: code,
            storageKey,
            capturedAt: new Date(capturedAt),
            verifiedAt: new Date(verifiedAt),
            timeSource: "network",
            clockSkewMs: skew,
            lat: photo.lat,
            lng: photo.lng,
            accuracyM: 3 + Math.random() * 6,
            altitudeM: 120 + Math.random() * 60,
            heading: Math.random() * 360,
            address: photo.address,
            note: photo.note,
            tag: photo.tag,
            assetType: photo.asset ?? null,
            weather: photo.weather ?? null,
            deviceModel: "iPhone 15 Pro",
            platform: "ios",
            contentHash,
            signature: await sign({
              photoCode: code,
              orgId,
              userId,
              storageKey,
              capturedAt,
              verifiedAt,
              lat: photo.lat,
              lng: photo.lng,
              contentHash,
            }),
            integrity: "verified",
            width: 1600,
            height: 1200,
            bytes: 1_800_000,
          });

          await db.insert(schema.photoEvents).values([
            {
              id: id("evt"),
              photoId,
              orgId,
              type: "captured",
              actor: userId,
              detail: `Device capture · ${photo.tag}`,
              at: new Date(capturedAt),
            },
            {
              id: id("evt"),
              photoId,
              orgId,
              type: "verified",
              actor: "system",
              detail: `Network time verified · skew ${Math.round(skew / 1000)}s`,
              at: new Date(verifiedAt),
            },
          ]);

          photoIds[`${photo.tag}:${photo.file}`] = photoId;
        }

        created.push({ projectId, photoIds });
      }

      // Before / after pairings for the comparison layouts.
      const pairs: Array<[number, string, string, string]> = [
        [2, "Brookfield RTU-1 replacement", "before:hvac-rooftop.jpg", "after:hvac-rtu-bank.jpg"],
        [4, "Maple Grove south slope", "before:roof-damage.jpg", "after:roof-replaced.jpg"],
        [0, "Ridgeline HH-2 splice", "before:fiber-handhole.jpg", "after:fiber-handhole.jpg"],
      ];
      for (const [index, title, beforeKey, afterKey] of pairs) {
        const entry = created[index];
        const before = entry?.photoIds[beforeKey];
        const after = entry?.photoIds[afterKey];
        if (!entry || !before || !after) continue;
        await db.insert(schema.comparisons).values({
          id: id("cmp"),
          orgId,
          projectId: entry.projectId,
          title,
          beforePhotoId: before,
          afterPhotoId: after,
          createdBy: userId,
        });
      }

      const [{ value: shareCount }] = await db
        .select({ value: count() })
        .from(schema.shareLinks)
        .where(eq(schema.shareLinks.orgId, orgId));

      if (shareCount === 0 && created[0]) {
        await db.insert(schema.shareLinks).values({
          id: id("shr"),
          orgId,
          projectId: created[0].projectId,
          token: shareToken(),
          label: "Northline — Ridgeline FTTH live view",
          allowDownload: true,
          createdBy: userId,
          views: 14,
        });
      }

      const [{ value: photoTotal }] = await db
        .select({ value: count() })
        .from(schema.photos)
        .where(and(eq(schema.photos.orgId, orgId)));

      return { seeded: true, projects: created.length, photos: photoTotal };
    },
  ),
};

async function fakeHash(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
