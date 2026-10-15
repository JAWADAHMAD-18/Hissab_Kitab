import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/server/legal/LegalPage";
import { WHATSAPP_PUBLIC } from "@/lib/features";
import { OPERATOR_NAME, OPERATOR_URL, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "About",
  description:
    "A guide to Hisab Kitab: how to navigate your dashboard, log expenses by voice, set budgets, and track monthly money.",
};

export default function AboutPage() {
  return (
    <LegalPage
      title="About Hisab Kitab"
      subtitle="A quick guide to finding your way around Hisab Kitab and tracking your monthly money with ease."
    >
      <h2>What is Hisab Kitab?</h2>
      <p>
        Hisab Kitab is a straightforward monthly money tracker built for students,
        freelancers, and salaried individuals. It helps you see exactly where your
        money goes and how much you have left to spend each month.
      </p>

      <h2>The Dashboard</h2>
      <p>
        Your <Link href="/dashboard">Dashboard</Link> is your central hub for the
        current month:
      </p>
      <ul>
        <li>
          <strong>Month Switcher:</strong> Move between past months and the current
          month to see historical income and spending.
        </li>
        <li>
          <strong>Summary Cards:</strong> View total spent, remaining balance, total
          income, and any carried-forward balance from previous months.
        </li>
        <li>
          <strong>Month Runway:</strong> A projection showing how many days your
          remaining balance will last based on your average daily burn rate.
        </li>
        <li>
          <strong>Category Breakdown &amp; Budgets:</strong> See where your money
          went across categories, set monthly limits, and monitor your progress.
        </li>
        <li>
          <strong>Recent Activity:</strong> Quick access to your latest recorded
          expenses and income entries.
        </li>
      </ul>

      <h2>Adding Entries</h2>
      <p>
        Adding transactions is designed to take seconds:
      </p>
      <ul>
        <li>
          <strong>Quick Add Buttons:</strong> Use the green &quot;+ Add Income&quot;
          or red &quot;+ Add Expense&quot; buttons at the top of the dashboard or
          in the navbar.
        </li>
        <li>
          <strong>Voice Logging:</strong> Tap the floating microphone button and
          speak naturally in Urdu or English. For example, say{" "}
          <em>&quot;aj shawarma 500 ka&quot;</em> or log multiple items at once like{" "}
          <em>&quot;fuel 1200 aur lunch 600&quot;</em>. The audio is transcribed
          and parsed into structured entries instantly.
        </li>
      </ul>

      <h2>Budgets &amp; Alerts</h2>
      <p>
        You can set spending caps on individual expense categories or a total
        monthly limit right from the Category Breakdown card on your{" "}
        <Link href="/dashboard">Dashboard</Link>.
      </p>
      <ul>
        <li>
          <strong>Scope:</strong> Choose whether a budget applies only to the
          selected month or carries forward to this month and onward.
        </li>
        <li>
          <strong>Warnings:</strong> Visual alerts appear at 80% (amber warning) and
          100% (red exceeded limit) to keep your spending in check.
        </li>
      </ul>

      <h2>Transactions Page</h2>
      <p>
        Head over to the <Link href="/transactions">Transactions</Link> page to
        view all transactions for a given month grouped by week. You can edit any
        entry, adjust dates and notes, or delete mistaken records.
      </p>

      <h2>Settings &amp; Preferences</h2>
      <p>
        In <Link href="/settings">Settings</Link>, you can:
      </p>
      <ul>
        <li>Update your display name and upload a profile photo.</li>
        <li>Change your password if you signed up with email and password.</li>
        <li>Export all your historical data as a clean CSV spreadsheet.</li>
        <li>
          Delete your account and all associated data permanently at any time.
        </li>
      </ul>

      <h2>Email Reports</h2>
      <p>
        Hisab Kitab can send automated weekly and monthly summaries directly to your
        registered inbox, highlighting key spending categories, budget status, and
        practical tips.
      </p>

      <h2>Install on Your Phone (PWA)</h2>
      <p>
        Hisab Kitab is a Progressive Web App (PWA). You can install it on your home
        screen without downloading it from an app store:
      </p>
      <ul>
        <li>
          <strong>Android (Chrome):</strong> Tap the install banner at the bottom of
          the dashboard or open Chrome menu &gt; &quot;Install app&quot;.
        </li>
        <li>
          <strong>iPhone / iPad (Safari):</strong> Tap the Share button in Safari,
          scroll down, and select &quot;Add to Home Screen&quot;.
        </li>
      </ul>

      <h2>WhatsApp Integration</h2>
      {WHATSAPP_PUBLIC ? (
        <p>
          You can connect your WhatsApp number in{" "}
          <Link href="/settings#whatsapp">Settings</Link> to log expenses by text
          or voice notes directly through WhatsApp.
        </p>
      ) : (
        <p>
          WhatsApp expense logging is currently in private preview and coming soon
          to the public.
        </p>
      )}

      <h2>Need Help?</h2>
      <p>
        Check our <Link href="/faq">Frequently Asked Questions (FAQ)</Link> or reach
        out to us on our <Link href="/contact">Contact page</Link> or via email at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <p className="pt-6 border-t border-border text-xs text-text-muted">
        Hisab Kitab is built and maintained by{" "}
        <a
          href={OPERATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-accent"
        >
          {OPERATOR_NAME}
        </a>
        .
      </p>
    </LegalPage>
  );
}
