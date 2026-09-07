import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";

/** The one and only row id — site settings are company-wide, not per-workspace. */
export const SITE_SETTINGS_ID = "site";

export type SocialLinks = {
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  xUrl: string;
};

const BLANK: SocialLinks = {
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  xUrl: "",
};

/** Reads the single settings row, falling back to all-blank when it does not exist yet. */
export async function loadSocialLinks(): Promise<SocialLinks> {
  const [row] = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);
  if (!row) return BLANK;
  return {
    facebookUrl: row.facebookUrl,
    instagramUrl: row.instagramUrl,
    linkedinUrl: row.linkedinUrl,
    youtubeUrl: row.youtubeUrl,
    xUrl: row.xUrl,
  };
}

/**
 * Public, unauthenticated: the marketing footer renders these icons for visitors
 * who have no session. Contains nothing but public profile URLs the operator
 * typed in themselves.
 */
export const site = {
  socials: base.handler(async () => loadSocialLinks()),
};
