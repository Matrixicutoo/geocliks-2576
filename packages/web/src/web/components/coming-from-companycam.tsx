import { Link } from "wouter";
import { ArrowRightLeft, Archive, Check } from "lucide-react";
import { LandingSection } from "./landing-page";
import { useLocale, type TKey } from "../lib/i18n";

/**
 * "Coming from CompanyCam" band for the trade landing pages (roofing, HVAC).
 *
 * The SEO plan asked for a switcher block on the vertical pages rather than a
 * new page per trade: someone searching "roofing photo app" who already pays
 * for CompanyCam lands on the trade page, and this is the part of it written
 * for them. The full argument lives on `/companycam-alternative` and the sourced
 * table on `/alternatives/companycam`; this band links to both rather than
 * repeating them.
 *
 * Every CompanyCam statement here is one already made on those two pages and
 * sourced there (device date/time stamp, opt-in stamping, per-user pricing),
 * and the note under the band carries the same `cc.verifiedOn` date — when that
 * page is re-checked and the date moves, re-read these strings too. Two limits
 * are stated in every trade's copy on purpose: there is no importer, and an old
 * photo cannot be verified after the fact.
 */

type Trade = "rf" | "hvac";

const COPY: Record<
  Trade,
  {
    h2: TKey;
    intro: TKey;
    keep: TKey[];
    change: TKey[];
    leave: TKey[];
    firstTitle: TKey;
    first: TKey;
  }
> = {
  rf: {
    h2: "ccsw.rf.h2",
    intro: "ccsw.rf.intro",
    keep: ["ccsw.rf.keep1", "ccsw.rf.keep2", "ccsw.rf.keep3"],
    change: ["ccsw.rf.change1", "ccsw.rf.change2", "ccsw.rf.change3"],
    leave: ["ccsw.rf.leave1", "ccsw.rf.leave2"],
    firstTitle: "ccsw.rf.firstTitle",
    first: "ccsw.rf.first",
  },
  hvac: {
    h2: "ccsw.hvac.h2",
    intro: "ccsw.hvac.intro",
    keep: ["ccsw.hvac.keep1", "ccsw.hvac.keep2", "ccsw.hvac.keep3"],
    change: ["ccsw.hvac.change1", "ccsw.hvac.change2", "ccsw.hvac.change3"],
    leave: ["ccsw.hvac.leave1", "ccsw.hvac.leave2"],
    firstTitle: "ccsw.hvac.firstTitle",
    first: "ccsw.hvac.first",
  },
};

const LINK_CLASS =
  "font-semibold text-amber-ink underline decoration-amber/40 underline-offset-4 hover:decoration-amber";

function Column({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Check;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[12px] border border-line bg-ink-2 p-5">
      <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-chalk">
        <Icon className="size-4.5 shrink-0 text-amber-ink" />
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="text-[13.5px] leading-relaxed text-fog">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ComingFromCompanyCam({ trade }: { trade: Trade }) {
  const { t } = useLocale();
  const copy = COPY[trade];

  return (
    <LandingSection
      id="coming-from-companycam"
      label={t("ccsw.label")}
      h2={t(copy.h2)}
      intro={t(copy.intro)}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Column icon={Check} title={t("ccsw.keepTitle")} items={copy.keep.map((k) => t(k))} />
        <Column
          icon={ArrowRightLeft}
          title={t("ccsw.changeTitle")}
          items={copy.change.map((k) => t(k))}
        />
        <Column icon={Archive} title={t("ccsw.leaveTitle")} items={copy.leave.map((k) => t(k))} />
      </div>

      <div className="mt-8 max-w-[760px]">
        <h3 className="font-display text-[17px] font-semibold text-chalk">{t(copy.firstTitle)}</h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-fog">{t(copy.first)}</p>
        <p className="mt-4 text-[13.5px] leading-relaxed text-fog">
          {t("ccsw.linksLead")}{" "}
          <Link to="/companycam-alternative" className={LINK_CLASS}>
            {t("ccsw.linkSwitch")}
          </Link>
          {" · "}
          <Link to="/alternatives/companycam" className={LINK_CLASS}>
            {t("ccsw.linkCompare")}
          </Link>
        </p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-fog">
          {t("ccsw.sourceNote", { date: t("cc.verifiedOn") })}
        </p>
      </div>
    </LandingSection>
  );
}
