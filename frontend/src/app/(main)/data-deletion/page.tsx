import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/server/legal/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Data Deletion",
  description:
    "How to permanently delete your account and personal financial records from Hisab Kitab.",
};

export default function DataDeletionPage() {
  return (
    <LegalPage
      title="Data Deletion Instructions"
      subtitle="You have full control over your data. Here is how you can remove your information from Hisab Kitab."
    >
      <h2>1. In-App Account Deletion (Immediate &amp; Permanent)</h2>
      <p>
        You can permanently delete your account and all associated data at any time
        directly from your account settings:
      </p>
      <ol>
        <li>
          Sign in to your account and go to <Link href="/settings">Settings</Link>.
        </li>
        <li>Scroll down to the &quot;Danger Zone&quot; at the bottom of the page.</li>
        <li>
          Click the red &quot;Delete account&quot; button to open the confirmation
          dialog.
        </li>
        <li>
          Type <code>DELETE</code> in the confirmation input to verify your intent,
          then click &quot;Permanently Delete&quot;.
        </li>
      </ol>

      <h3>What is permanently removed?</h3>
      <p>
        When you confirm account deletion, our servers immediately and irrevocably
        delete:
      </p>
      <ul>
        <li>
          <strong>All income records:</strong> Every logged income amount, source,
          and date.
        </li>
        <li>
          <strong>All expense records:</strong> Every logged expense amount,
          category, note, and date.
        </li>
        <li>
          <strong>All budgets:</strong> Every category and monthly spending cap you
          configured.
        </li>
        <li>
          <strong>WhatsApp message logs:</strong> Any temporary incoming message
          metadata linked to your account.
        </li>
        <li>
          <strong>Password reset tokens:</strong> All active or expired password reset
          records for your account.
        </li>
        <li>
          <strong>Your user profile:</strong> Your name, email, password hash,
          uploaded profile picture, and linked WhatsApp number.
        </li>
      </ul>
      <p>
        Once confirmed, your session will be terminated and all cached data will be
        cleared from your browser. This action cannot be undone.
      </p>

      <h2>2. Disconnecting WhatsApp Only</h2>
      <p>
        If you only want to stop using WhatsApp logging without deleting your whole
        account:
      </p>
      <ol>
        <li>
          Navigate to <Link href="/settings#whatsapp">Settings &gt; WhatsApp</Link>.
        </li>
        <li>
          Click &quot;Disconnect&quot; (or &quot;Unlink&quot;).
        </li>
      </ol>
      <p>
        Your phone number and verification status will be cleared immediately. Your
        existing income and expense records will remain untouched in your account.
      </p>

      <h2>3. Requesting Deletion via Email</h2>
      <p>
        If you are unable to log in to your account or need manual assistance, you
        can request account deletion by emailing us:
      </p>
      <ul>
        <li>
          Send an email to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20Hisab%20Kitab%20data`}>
            {SUPPORT_EMAIL}
          </a>
        </li>
        <li>
          You <strong>must</strong> send the email from the email address registered
          with your Hisab Kitab account.
        </li>
        <li>
          Use the subject line: <code>Delete my Hisab Kitab data</code>.
        </li>
      </ul>
      <p>
        Once we verify ownership of the account from the sending address, our team
        will delete all user records from our database.
      </p>

      <h2>Important Notes on Backups &amp; Logs</h2>
      <p>
        Please note that account deletion from our live databases is immediate and
        permanent. Standard provider-level operational backups (such as automated
        MongoDB Atlas cluster snapshots) follow their own automatic retention cycles
        and will naturally overwrite older data as backup retention windows expire.
      </p>

      <h2>Questions?</h2>
      <p>
        If you have any questions about data deletion or our data practices, please
        reach out at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
