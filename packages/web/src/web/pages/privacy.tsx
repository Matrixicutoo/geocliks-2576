import { LegalList, LegalPage, LegalSection } from "../components/legal-page";
import { COMPANY_ADDRESS, JURISDICTION, LEGAL_ENTITY } from "../lib/company";
import { SUPPORT_EMAIL } from "../lib/support";

/**
 * Privacy Policy. English only on purpose — machine-translated legal text can
 * change what it means. Describes what GeoCliks actually collects: account data,
 * captures with EXIF/GPS, device push tokens, and the processors we rely on.
 */
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-[14.5px] leading-relaxed text-fog">
        This policy explains what {LEGAL_ENTITY} ("we", "us"), {COMPANY_ADDRESS}, collects when you
        use the GeoCliks app, website and desktop app (the "Service"), why we collect it, who we
        share it with, and the choices you have. We are the controller of the personal data
        described here, except where we act as a processor for a workspace (see section 3).
      </p>

      <LegalSection title="1. What we collect">
        <LegalList
          items={[
            "Account data: your name, email address, password hash (we never store your password itself), profile photo, language, chosen theme, and, if you enable it, your two-factor secret.",
            "Workspace data: workspace name, your role, project names, client and location details, project assignments, invitations, watermark templates and reports you generate.",
            "Captures: the photos and videos you take, plus the timestamp, GPS coordinates, resolved street address, device-reported capture time, unique photo code, content hash and signature attached to each one.",
            "Messages: the direct messages and broadcasts you send inside a workspace, including any image you attach.",
            "Device and technical data: app version, platform, IP address, coarse device information, push notification tokens, error logs and basic usage events used to keep the app working.",
            "Billing data: your plan, subscription status and the identifiers our payment processor gives us. We never see or store your full card number.",
          ]}
        />
        <p>
          We do not ask for and do not want government identifiers, health information or other
          sensitive categories of personal data. Please do not put them into project names, messages
          or photo notes.
        </p>
      </LegalSection>

      <LegalSection title="2. Why we use it">
        <LegalList
          items={[
            "To provide the Service: authenticate you, sync captures, apply stamps, generate reports and exports, and deliver messages and notifications.",
            "To secure the Service: detect abuse, enforce rate limits, investigate incidents and protect accounts.",
            "To bill you and manage your subscription.",
            "To support you when you contact us.",
            "To improve the Service by understanding which features are used, in aggregate.",
            "To meet legal obligations.",
          ]}
        />
        <p>
          Where the GDPR or similar law applies, our legal bases are the performance of our contract
          with you, our legitimate interests in operating and securing the Service, your consent
          (for example for push notifications and precise location), and compliance with legal
          obligations.
        </p>
      </LegalSection>

      <LegalSection title="3. Workspaces: who controls your data">
        <p>
          GeoCliks is built for teams. When you join a workspace, its owner and administrators
          control that workspace's content: they can see the projects and captures in it, add and
          remove members, create share links and export data. For that workspace content we act as a
          processor on the workspace's behalf. If you are a member of a workspace you do not own,
          direct requests about that content to the workspace owner first.
        </p>
      </LegalSection>

      <LegalSection title="4. Location and camera">
        <p>
          The app asks for camera and location permission because a GeoCliks capture is a photo plus
          where and when it was taken. You can refuse or revoke either permission in your device
          settings; the app will still run, but captures made without location cannot carry
          coordinates or an address, which removes much of their evidentiary value. We use location
          only at the moment of capture and to place captures on your map — we do not track your
          device in the background.
        </p>
      </LegalSection>

      <LegalSection title="5. Share links and verification pages">
        <p>
          Share links and per-photo verification pages are accessible to anyone who has the link,
          with no sign-in. A person opening one can see the shared captures and their stamp details.
          Only share a link with people you intend to give access to. Links can be revoked at any
          time from the Share links page, but revocation does not retrieve copies already
          downloaded.
        </p>
      </LegalSection>

      <LegalSection title="6. Who we share data with">
        <p>
          We do not sell personal data and we do not share it for advertising. We use a small set of
          service providers who process data on our instructions:
        </p>
        <LegalList
          items={[
            "Cloud hosting and database providers that run the Service and store your captures.",
            "A payment processor for subscriptions, and Apple for purchases made inside the iOS app.",
            "An email provider for invitations, password resets and transactional mail.",
            "A push notification service (Expo and, on Android, Firebase Cloud Messaging) to deliver alerts to your device.",
            "A mapping provider to resolve addresses and render maps.",
          ]}
        />
        <p>
          We may also disclose data where legally required, to enforce our Terms, or as part of a
          merger or acquisition — in which case we will tell you before your data becomes subject to
          a different policy.
        </p>
      </LegalSection>

      <LegalSection title="7. International transfers">
        <p>
          We are based in Canada and our providers may process data in Canada, the United States and
          the European Union. Where personal data leaves your region we rely on recognised transfer
          mechanisms, such as standard contractual clauses, and on contractual commitments from our
          providers.
        </p>
      </LegalSection>

      <LegalSection title="8. How long we keep it">
        <p>
          We keep workspace content for as long as the workspace exists. Deleting a project does not
          delete its captures, and removing a member does not delete captures they made — that is by
          design, because the workspace owns its evidence record. When you delete your account we
          remove your profile and credentials; captures you made in a workspace you do not own
          remain with that workspace. Backups and security logs are kept for a limited period and
          then rotated out.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          Data is encrypted in transit. Each capture carries a SHA-256 content hash and an
          HMAC-SHA256 signature, and every event affecting it is written to an append-only chain, so
          alterations are detectable. Access to production systems is restricted, passwords are
          stored hashed, and two-factor authentication is available for workspace owners and
          administrators. No system is perfectly secure; if a breach affects you we will notify you
          and the relevant regulator as required by law.
        </p>
      </LegalSection>

      <LegalSection title="10. Your rights">
        <p>
          Subject to local law, you can ask us to access, correct, export or delete your personal
          data, to restrict or object to certain processing, and to withdraw consent where we rely
          on it. You can change most of this yourself in your profile and billing settings. To make
          a request, email {SUPPORT_EMAIL} from the address on your account; we respond within the
          time limits set by applicable law.
        </p>
        <p>
          If you are in Canada you may complain to the Office of the Privacy Commissioner of Canada.
          If you are in the EEA or the UK you may complain to your local supervisory authority.
        </p>
      </LegalSection>

      <LegalSection title="11. Cookies and local storage">
        <p>
          We use cookies and browser or device storage only for things the Service needs: keeping
          you signed in, remembering your language and theme, and holding captures queued while you
          are offline. We do not run third-party advertising or cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="12. Children">
        <p>
          The Service is a workplace tool and is not directed at children under 16. We do not
          knowingly collect their personal data. If you believe a child has created an account,
          contact us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to this policy">
        <p>
          We may update this policy. When a change is material we will give notice in the app or by
          email before it takes effect, and we will update the effective date at the top of this
          page.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          Questions, requests or complaints about privacy go to {SUPPORT_EMAIL}. This policy is
          governed by the laws of {JURISDICTION}.
        </p>
        <p>
          {LEGAL_ENTITY}
          <br />
          {COMPANY_ADDRESS}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
