import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Privacy Policy — StudyZone AI",
  description: "Privacy Policy for StudyZone AI.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-20">
        <PageHeader title="Privacy Policy" />

        <div className="prose-sm space-y-8 text-ink-light leading-relaxed">
          <p className="text-xs text-ink-muted">Last updated: April 7, 2026</p>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              1. Information We Collect
            </h2>
            <p className="font-medium text-ink">Account Information</p>
            <p>
              When you create an account, we collect your name, email address, and
              password. If you sign in with a third-party provider (e.g., Google), we
              receive your name and email from that provider.
            </p>
            <p className="mt-3 font-medium text-ink">Uploaded Content</p>
            <p>
              We store files and text you upload to the Service (PDFs, documents, pasted
              text, links) to provide our learning features. Your content is associated
              with your account and not shared with other users.
            </p>
            <p className="mt-3 font-medium text-ink">Usage Data</p>
            <p>
              We collect information about how you use the Service, including pages
              visited, features used, learning progress, and quiz scores.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              2. How We Use Your Information
            </h2>
            <ul className="ml-5 list-disc space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To process your uploaded content and generate learning materials</li>
              <li>To personalize your learning experience</li>
              <li>To communicate with you about the Service</li>
              <li>To improve and develop new features</li>
              <li>To ensure security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              3. AI Processing
            </h2>
            <p>
              Your uploaded content is sent to AI language model providers (currently
              Anthropic&apos;s Claude) to generate summaries, quizzes, lesson plans, and
              other learning features. We send only the content necessary to provide the
              requested feature. AI providers process your data according to their
              respective privacy policies and data processing agreements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              4. Data Sharing
            </h2>
            <p>We do not sell your personal data. We may share data with:</p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>
                <strong>Service providers:</strong> Infrastructure (hosting, storage,
                database) and AI providers necessary to operate the Service
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law, legal process,
                or to protect our rights
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              5. Data Security
            </h2>
            <p>
              We implement industry-standard security measures including encryption in
              transit (TLS) and at rest, secure authentication, and regular security
              reviews. However, no method of transmission over the Internet is 100%
              secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              6. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. You can delete
              your uploaded content at any time. If you delete your account, we will
              delete your data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              8. Cookies
            </h2>
            <p>
              We use essential cookies for authentication and session management. We do
              not use third-party advertising cookies. Analytics cookies are used only to
              improve the Service and can be opted out of.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              9. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed at children under 13. We do not knowingly
              collect personal data from children under 13. If we learn that we have
              collected data from a child under 13, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. We will notify you of material
              changes via email or a notice on the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink font-[family-name:var(--font-dm-sans)]">
              11. Contact
            </h2>
            <p>
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@studyzoneai.com" className="text-ink underline">
                privacy@studyzoneai.com
              </a>
              .
            </p>
          </section>
        </div>
    </main>
  );
}
