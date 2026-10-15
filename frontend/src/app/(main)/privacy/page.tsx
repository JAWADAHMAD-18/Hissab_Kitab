import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/server/legal/LegalPage";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn what information Hisab Kitab collects, how it is processed and protected, and how you control or delete your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Hisab Kitab handles, protects, and stores your personal and financial information."
    >
      <h2>Overview</h2>
      <p>
        Hisab Kitab is operated by {OPERATOR_NAME}. We respect your personal privacy
        and believe your financial data belongs exclusively to you. We do not sell
        your data, we do not run advertisements, and we do not use tracking or
        third-party analytics tools.
      </p>

      <h2>Data We Collect</h2>
      <p>
        We only collect information necessary to deliver and secure our financial
        tracking service:
      </p>
      <ul>
        <li>
          <strong>Account details:</strong> Your name, email address, and password.
          Passwords are never stored in plain text; they are secured using strong
          one-way bcrypt hashing.
        </li>
        <li>
          <strong>Profile photo:</strong> An image you choose to upload (stored
          directly in our database) or your public Google profile picture URL if
          you sign in with Google.
        </li>
        <li>
          <strong>Financial entries:</strong> Income and expense records you log,
          including amounts, categories, dates, optional notes, payment methods, and
          entry sources (e.g. manual, voice, or WhatsApp).
        </li>
        <li>
          <strong>Budgets:</strong> Category-specific and monthly spending limits you
          configure.
        </li>
        <li>
          <strong>WhatsApp information:</strong> If you choose to link WhatsApp, we
          store your phone number and a short-lived temporary 6-digit linking code.
        </li>
        <li>
          <strong>Preferences:</strong> Settings such as email notification
          preferences for weekly or monthly summary reports.
        </li>
      </ul>

      <h2>Voice &amp; Text Processing</h2>
      <p>
        When you use voice logging in the app or send audio messages via WhatsApp:
      </p>
      <ul>
        <li>
          Audio recordings are sent to Groq Whisper for instantaneous
          transcription. Hisab Kitab does not store your voice recordings or audio
          files; they are discarded immediately after transcription completes.
        </li>
        <li>
          The resulting text transcript is passed to a Groq language model to parse
          amounts, categories, and dates into structured transactions.
        </li>
      </ul>

      <h2>Temporary Security Logs &amp; Tokens</h2>
      <p>
        To prevent abuse and maintain service integrity, we maintain the following
        short-lived operational records:
      </p>
      <ul>
        <li>
          <strong>WhatsApp message logs:</strong> Incoming message IDs, phone
          numbers, message types, and brief summary lines are kept for 7 days
          solely for deduplication and duplicate-message protection, after which
          they are automatically deleted via database TTL indexes.
        </li>
        <li>
          <strong>Password reset tokens:</strong> Password reset tokens are stored
          cryptographically hashed and automatically expire after 15 minutes.
        </li>
        <li>
          <strong>Rate-limiting counters:</strong> Short-lived counters keyed by IP
          address or email address are kept to prevent brute-force attacks and abuse.
        </li>
      </ul>

      <h2>Service Providers</h2>
      <p>
        We work with trusted third-party providers who process data on our behalf to
        operate the application:
      </p>
      <ul>
        <li>
          <strong>MongoDB Atlas:</strong> Managed database infrastructure where
          account and transaction records are encrypted and stored.
        </li>
        <li>
          <strong>Vercel:</strong> Application hosting and cloud execution.
        </li>
        <li>
          <strong>Groq:</strong> Speech-to-text audio transcription and AI natural
          language parsing.
        </li>
        <li>
          <strong>Brevo:</strong> Delivery of transactional emails, including password
          reset links and weekly/monthly financial reports.
        </li>
        <li>
          <strong>Google:</strong> Optional single sign-on authentication.
        </li>
        <li>
          <strong>Meta (WhatsApp Cloud API):</strong> Message transmission when
          interacting with our WhatsApp bot.
        </li>
      </ul>

      <h2>Cookies &amp; Local Storage</h2>
      <p>
        Hisab Kitab uses minimal, privacy-friendly storage:
      </p>
      <ul>
        <li>
          <strong>Session Cookie:</strong> An essential, secure HTTP-only cookie
          used exclusively to maintain your signed-in state.
        </li>
        <li>
          <strong>Local Storage:</strong> A small browser-storage flag to remember
          whether you dismissed the app installation prompt banner.
        </li>
        <li>
          <strong>Service Worker:</strong> Our offline service worker caches only
          static UI assets and a generic offline message page. It never caches your
          financial data or user records.
        </li>
      </ul>

      <h2>Data Retention &amp; Your Choices</h2>
      <p>
        Your data is retained for as long as your account remains active. You maintain
        complete control over your information at all times:
      </p>
      <ul>
        <li>
          <strong>Edit or delete entries:</strong> You can edit or delete any
          individual income or expense entry from the Transactions page at any time.
        </li>
        <li>
          <strong>Export your data:</strong> You can download a complete CSV copy of
          all your income and expense records from{" "}
          <Link href="/settings">Settings</Link>.
        </li>
        <li>
          <strong>Disconnect WhatsApp:</strong> You can unlink your WhatsApp number
          at any time from Settings.
        </li>
        <li>
          <strong>Permanent account deletion:</strong> You can permanently delete
          your account and all related records directly from Settings. Read our{" "}
          <Link href="/data-deletion">Data Deletion</Link> page for step-by-step
          instructions and details on the deletion process.
        </li>
      </ul>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Hisab Kitab is not directed at children under the age of 13, and we do not
        knowingly collect personal information from children.
      </p>

      <h2>Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When changes are made,
        we will update the &quot;Last updated&quot; date at the top of this page.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions or concerns about this policy or your data, please
        contact us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or
        visit our <Link href="/contact">Contact page</Link>.
      </p>
    </LegalPage>
  );
}
