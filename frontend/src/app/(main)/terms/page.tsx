import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/server/legal/LegalPage";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service governing your use of the Hisab Kitab personal money tracking application.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Please read these terms carefully before using Hisab Kitab."
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using Hisab Kitab, you agree to these Terms of
        Service. If you do not agree, please do not use the application.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        Hisab Kitab is a personal money-tracking tool operated by {OPERATOR_NAME}. It
        helps individuals record income, log daily expenses, monitor spending against
        self-defined budgets, and receive periodic summaries.
      </p>

      <h2>3. Account &amp; Security</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activities that occur under your account. Please
        notify us immediately at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if you suspect any
        unauthorized use of your account.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>
        You agree to use Hisab Kitab only for lawful, personal purposes. You agree
        not to probe, scan, or test the vulnerability of the system, disrupt service
        availability, attempt unauthorized access, or misuse our API endpoints.
      </p>

      <h2>5. AI Transcription &amp; Automated Entries</h2>
      <p>
        When you log entries using voice or WhatsApp, automated speech-to-text and
        language models parse your transactions. While our parsing algorithms are
        designed to be accurate, automated recognition can make mistakes. You are
        responsible for reviewing your recorded entries and verifying their accuracy.
      </p>

      <h2>6. Not Financial, Tax, or Legal Advice</h2>
      <p>
        Hisab Kitab is an informational record-keeping and tracking utility. It does
        not provide financial planning, accounting, tax, investment, or legal advice.
        Any calculations, summaries, or runway estimates are for personal reference
        only.
      </p>

      <h2>7. Availability &amp; Modifications</h2>
      <p>
        Hisab Kitab is provided on an &quot;as is&quot; and &quot;as available&quot;
        basis without warranties of any kind, whether express or implied. We reserve
        the right to modify, suspend, or discontinue any feature at any time without
        prior notice.
      </p>

      <h2>8. Third-Party Services</h2>
      <p>
        Our service integrates with third-party providers including Google, Meta
        (WhatsApp), Groq, Brevo, and MongoDB Atlas. Your use of features reliant on
        these providers may be subject to their respective terms and availability.
      </p>

      <h2>9. Your Data &amp; Deletion</h2>
      <p>
        You retain all rights to the financial data you enter into Hisab Kitab. You
        may export a CSV copy of your records or permanently delete your account and
        all associated information at any time from your account settings. For
        details, refer to our <Link href="/data-deletion">Data Deletion</Link> guide.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using Hisab Kitab and delete your account at any time. We reserve
        the right to suspend or terminate accounts that violate these terms or engage
        in abusive behavior.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, {OPERATOR_NAME} and its creators shall
        not be liable for any indirect, incidental, special, consequential, or
        punitive damages, or any loss of profits or data arising out of your access to
        or inability to use the service.
      </p>

      <h2>12. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws
        of Pakistan, without regard to its conflict of law principles.
      </p>

      <h2>13. Changes to Terms</h2>
      <p>
        We may revise these Terms occasionally. Any updates will be reflected on
        this page with an updated &quot;Last updated&quot; date. Continued use of the
        service constitutes acceptance of the modified terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        If you have any questions regarding these Terms, please contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
