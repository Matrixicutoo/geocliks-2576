import { LegalCopy, LegalList, LegalPage, LegalSection, LegalSteps } from "../components/legal-page";
import { useT } from "../lib/i18n";
import { SUPPORT_EMAIL } from "../lib/support";

/**
 * Public account-deletion page. Required by Google Play's Data safety form (the
 * "Delete account URL"), which has to be reachable without signing in and has to
 * spell out the steps in the app itself.
 *
 * Translated into all eleven locales, unlike /terms and /privacy: this is a how-to
 * for the app's own screens, reached from the footer link that is already localized,
 * so the person following the steps should read them in the language the app is in.
 * The confirmation word "DELETE" stays English in every locale, because the app's
 * delete flow only accepts that literal string.
 */
export default function DeleteAccount() {
  const t = useT();
  const email = { email: SUPPORT_EMAIL };

  return (
    <LegalPage
      title={t("del.h1")}
      path="/delete-account"
      seoTitle={t("seo.delete.title")}
      meta={null}
    >
      <p className="text-[14.5px] leading-relaxed text-fog">{t("del.intro")}</p>

      <LegalSection title={t("del.app.h2")}>
        <LegalSteps
          items={[t("del.app.s1"), t("del.app.s2"), t("del.app.s3"), t("del.app.s4")]}
        />
        <p>{t("del.app.after")}</p>
      </LegalSection>

      <LegalSection title={t("del.web.h2")}>
        <LegalSteps items={[t("del.web.s1"), t("del.web.s2"), t("del.web.s3")]} />
      </LegalSection>

      <LegalSection title={t("del.removed.h2")}>
        <LegalList items={[t("del.removed.b1"), t("del.removed.b2"), t("del.removed.b3")]} />
      </LegalSection>

      <LegalSection title={t("del.kept.h2")}>
        <LegalList
          items={[t("del.kept.b1"), t("del.kept.b2"), t("del.kept.b3"), t("del.kept.b4")]}
        />
      </LegalSection>

      <LegalSection title={t("del.partial.h2")}>
        <p>{t("del.partial.intro")}</p>
        <LegalList
          items={[
            t("del.partial.b1"),
            t("del.partial.b2"),
            t("del.partial.b3"),
            t("del.partial.b4"),
            t("del.partial.b5"),
          ]}
        />
        <p>
          <LegalCopy text={t("del.partial.support", email)} />
        </p>
      </LegalSection>

      <LegalSection title={t("del.locked.h2")}>
        <p>
          <LegalCopy text={t("del.locked.body", email)} />
        </p>
      </LegalSection>
    </LegalPage>
  );
}
