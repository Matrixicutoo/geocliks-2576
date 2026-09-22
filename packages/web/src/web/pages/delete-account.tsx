import { LegalList, LegalPage, LegalSection } from "../components/legal-page";
import { SUPPORT_EMAIL } from "../lib/support";

/**
 * Public account-deletion page. Required by Google Play's Data safety form (the
 * "Delete account URL"), which has to be reachable without signing in and has to
 * spell out the steps in the app itself. English only, like /terms and /privacy.
 */
export default function DeleteAccount() {
  return (
    <LegalPage title="Delete your GeoCliks account" path="/delete-account">
      <p className="text-[14.5px] leading-relaxed text-fog">
        You can delete your GeoCliks account and its data yourself, from inside the app or from the
        website. Nothing has to go through us. This page explains exactly how, and what is removed.
      </p>

      <LegalSection title="In the GeoCliks mobile app">
        <ol className="ml-4 list-decimal space-y-2">
          <li>Open the GeoCliks app and sign in.</li>
          <li>Tap your profile photo or initials in the top corner to open Profile.</li>
          <li>Scroll to the bottom, to the section titled "Delete account".</li>
          <li>
            Tap <strong className="text-chalk">Delete account</strong>, type{" "}
            <strong className="text-chalk">DELETE</strong> in the confirmation box, and confirm.
          </li>
        </ol>
        <p>
          The deletion runs immediately and signs you out. It cannot be undone, so export anything
          you want to keep first.
        </p>
      </LegalSection>

      <LegalSection title="On the website">
        <ol className="ml-4 list-decimal space-y-2">
          <li>
            Sign in at <span className="text-chalk">geocliks.com</span>.
          </li>
          <li>
            Open <strong className="text-chalk">Profile</strong> from the sidebar.
          </li>
          <li>
            Scroll to <strong className="text-chalk">Delete account</strong>, type{" "}
            <strong className="text-chalk">DELETE</strong> to confirm, and delete.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="What is deleted">
        <LegalList
          items={[
            "Your identity: name, email address, profile photo, sign-in sessions and push notification tokens.",
            "If you own the workspace: the workspace itself, and every photo, video, document, project, route, time-clock entry, message, report, share link and watermark template in it — including the stored image and video files.",
            "Share links and verification codes issued from that workspace stop resolving.",
          ]}
        />
      </LegalSection>

      <LegalSection title="What is kept, and for how long">
        <LegalList
          items={[
            "If you were invited into someone else's workspace, captures you took stay with that workspace: they are the workspace owner's evidence record, not yours. Your identity is still deleted.",
            "Invited members cannot delete themselves out of a workspace's record; the workspace owner removes the member, and their captures stay.",
            "Billing and tax records we are legally required to keep are retained for as long as the law requires, and are never used for anything else.",
            "Encrypted backups and security logs rotate out within 90 days, so a deletion can take up to 90 days to work through every copy.",
          ]}
        />
      </LegalSection>

      <LegalSection title="If you cannot sign in">
        <p>
          Email <span className="text-chalk">{SUPPORT_EMAIL}</span> from the address on the account
          and ask us to delete it. We confirm it is your address and then delete the account for
          you, normally within 30 days.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
