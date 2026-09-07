import { LegalList, LegalPage, LegalSection } from "../components/legal-page";
import { COMPANY_ADDRESS, JURISDICTION, LEGAL_ENTITY } from "../lib/company";
import { SUPPORT_EMAIL } from "../lib/support";

/**
 * Terms of Service. English only on purpose — machine-translated legal text can
 * change what it means. Written for GeoCliks specifically (evidence stamping,
 * workspaces, share links, exports) rather than copied from a generic template.
 */
export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p className="text-[14.5px] leading-relaxed text-fog">
        These Terms of Service (the "Terms") are an agreement between you and {LEGAL_ENTITY} ("
        {LEGAL_ENTITY}", "we", "us"), {COMPANY_ADDRESS}. They govern your use of the GeoCliks mobile
        app, website, desktop app and related services (together, the "Service"). By creating an
        account or using the Service, you accept these Terms. If you do not accept them, do not use
        the Service.
      </p>

      <LegalSection title="1. Who may use the Service">
        <p>
          You must be at least 16 years old and able to enter into a binding contract. If you use
          the Service on behalf of a company or organisation, you confirm you are authorised to
          accept these Terms for it, and "you" then means that organisation.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts and workspaces">
        <p>
          You are responsible for your account credentials and for everything done through your
          account. Each account belongs to a workspace. The workspace owner and administrators can
          invite members, assign roles (owner, admin, manager, field), assign projects, remove
          members and change the workspace plan. Roles decide what a member can see and do —
          notably, field members only see the projects assigned to them.
        </p>
        <p>
          Content captured inside a workspace belongs to that workspace. If you are removed from a
          workspace, you lose access to its content, and the photos you captured remain with the
          workspace.
        </p>
      </LegalSection>

      <LegalSection title="3. What the Service does — and what it does not do">
        <p>
          GeoCliks records photos and videos together with a timestamp, GPS coordinates, an address
          where available, a unique photo code, a SHA-256 content hash and a signature, and keeps an
          append-only record of events for each capture. These features are designed to make
          undetected tampering hard and to help you show that a capture has not changed since it was
          uploaded.
        </p>
        <p>
          You accept the following limits, which are important:
        </p>
        <LegalList
          items={[
            "GeoCliks is not a notary, a surveyor, a laboratory or a legal service, and nothing it produces is legal advice or a certified legal instrument.",
            "A \"network-verified\" timestamp means our server recorded the time it received the upload. When a device clock differs from ours by more than a few minutes, the capture is marked as device-timed instead.",
            "Location accuracy depends on the device, its sensors and its surroundings; indoor and obstructed locations can be materially inaccurate.",
            "We cannot guarantee that any court, insurer, client or authority will accept a GeoCliks record as evidence. That decision is theirs.",
            "Captures made while offline are queued on the device and stamped as verified only when they reach our servers.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Your content">
        <p>
          You keep all ownership of the photos, videos, project data and other content you upload
          ("Your Content"). You grant us a limited licence to host, store, transmit, resize, index
          and display Your Content strictly to operate the Service for you and the people you share
          it with. We do not sell Your Content and we do not use it to train machine-learning models
          for third parties.
        </p>
        <p>
          You confirm you have the rights and permissions needed to capture and upload Your Content,
          including any consent required from people, property owners or site operators appearing in
          it.
        </p>
      </LegalSection>

      <LegalSection title="5. Share links and public pages">
        <p>
          The Service can create share links and per-photo verification pages that are viewable by
          anyone holding the link, without a GeoCliks account. That is deliberate. Treat a share
          link as public. Anyone with the appropriate role can revoke a link, but revoking does not
          undo copies already made by whoever had access.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "use the Service unlawfully, or to harass, surveil or intimidate anyone;",
            "upload content you have no right to upload, or content that is unlawful, infringing or malicious;",
            "attempt to alter, forge or strip a GeoCliks stamp, hash, signature or photo code, or to present altered material as a GeoCliks record;",
            "probe, scan, overload or interfere with the Service or its infrastructure, or bypass rate limits, quotas or plan restrictions;",
            "resell or sublicense the Service, or share a single seat between several people;",
            "reverse engineer the Service except where that right cannot be excluded by law.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Plans, billing and taxes">
        <p>
          Plan features, quotas and prices are shown on our pricing page and can change. Paid plans
          renew automatically for the period shown until cancelled. Subscriptions purchased on the
          web are billed by our payment processor; subscriptions purchased inside the iOS app are
          billed by Apple and are governed additionally by Apple's terms, including its refund
          process.
        </p>
        <p>
          Prices exclude taxes unless stated otherwise; you are responsible for applicable taxes.
          Fees already paid are non-refundable except where required by law or where we state
          otherwise in writing. If a payment fails or a subscription is cancelled, the workspace
          moves to the free plan and paid features stop, including quotas above the free limits.
        </p>
      </LegalSection>

      <LegalSection title="8. Cancellation, suspension and termination">
        <p>
          You may cancel at any time from your billing settings, or delete your account from your
          profile. Cancelling stops the next renewal; it does not refund the current period.
        </p>
        <p>
          We may suspend or terminate access if you breach these Terms, if your use puts the Service
          or other customers at risk, or if we are required to do so by law. Where reasonable we
          will warn you first and give you an opportunity to export your data.
        </p>
      </LegalSection>

      <LegalSection title="9. Availability and support">
        <p>
          We work to keep the Service available and to protect your data, but we do not promise
          uninterrupted or error-free operation, and we may change, add or remove features. Planned
          maintenance, third-party outages and force majeure events can interrupt the Service.
          Support is provided by email at {SUPPORT_EMAIL}. We do not offer a contractual uptime
          guarantee unless we have signed a separate written agreement with you.
        </p>
      </LegalSection>

      <LegalSection title="10. Our intellectual property">
        <p>
          The Service, including its software, design, branding and documentation, belongs to{" "}
          {LEGAL_ENTITY} and its licensors. These Terms grant you a limited, non-exclusive,
          non-transferable right to use the Service while your account is active. Nothing here
          transfers ownership of the Service to you.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimers">
        <p>
          To the fullest extent permitted by law, the Service is provided "as is" and "as available",
          without warranties of any kind, express or implied, including merchantability, fitness for
          a particular purpose, non-infringement, and any warranty that a record produced by the
          Service will be accepted by a third party.
        </p>
      </LegalSection>

      <LegalSection title="12. Limitation of liability">
        <p>
          To the fullest extent permitted by law, {LEGAL_ENTITY} is not liable for indirect,
          incidental, special, consequential or punitive damages, nor for lost profits, lost
          business, lost data, or claims by third parties arising from your use of the Service. Our
          total liability for any claim relating to the Service is limited to the amount you paid us
          for the Service in the twelve months before the event giving rise to the claim.
        </p>
        <p>
          Some jurisdictions do not allow certain exclusions; in those places these limits apply only
          as far as the law permits.
        </p>
      </LegalSection>

      <LegalSection title="13. Indemnity">
        <p>
          You will defend and indemnify {LEGAL_ENTITY} against claims, damages and reasonable costs
          arising from Your Content or from your use of the Service in breach of these Terms or of
          applicable law.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to these Terms">
        <p>
          We may update these Terms. When a change is material we will give notice in the app or by
          email before it takes effect. Continuing to use the Service after the effective date means
          you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing law">
        <p>
          These Terms are governed by the laws of {JURISDICTION}, without regard to conflict-of-laws
          rules, and the courts located there have exclusive jurisdiction, except that either party
          may seek injunctive relief in any competent court. If a provision is held unenforceable,
          the rest stays in force.
        </p>
      </LegalSection>

      <LegalSection title="16. Contact">
        <p>
          {LEGAL_ENTITY}
          <br />
          {COMPANY_ADDRESS}
          <br />
          {SUPPORT_EMAIL}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
