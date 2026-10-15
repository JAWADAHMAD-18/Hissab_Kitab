import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/server/legal/LegalPage";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact Support",
  description:
    "Get in touch with the Hisab Kitab team for questions, feedback, or support requests.",
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact Support"
      subtitle="Have a question, feedback, or need help with your account? We're here to assist."
      lastUpdated=""
    >
      <h2>Email Support</h2>
      <p>
        The best way to reach us is by sending an email directly to:
      </p>
      <p className="text-lg font-semibold">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-accent underline underline-offset-4 hover:text-emerald-700"
        >
          {SUPPORT_EMAIL}
        </a>
      </p>

      <h2>What to Include in Your Message</h2>
      <p>
        To help us assist you as quickly and effectively as possible, please include:
      </p>
      <ul>
        <li>
          <strong>Your account email:</strong> The email address linked to your Hisab
          Kitab account.
        </li>
        <li>
          <strong>What happened:</strong> A clear, concise description of the issue,
          question, or feedback.
        </li>
        <li>
          <strong>Details:</strong> If reporting an error, include relevant details
          such as what page you were on, what action was performed, and any error
          text displayed.
        </li>
      </ul>

      <h2>Helpful Resources</h2>
      <p>
        You may find quick answers to common questions in our existing guides:
      </p>
      <ul>
        <li>
          Visit our <Link href="/faq">Frequently Asked Questions (FAQ)</Link> for
          answers on voice logging, budgets, exports, and offline behavior.
        </li>
        <li>
          Explore our <Link href="/about">About page</Link> for an overview of all
          features and dashboard navigation.
        </li>
        <li>
          Review our <Link href="/data-deletion">Data Deletion</Link> guide if you
          are looking to delete your records.
        </li>
      </ul>

      <p className="pt-6 border-t border-border text-xs text-text-muted">
        Hisab Kitab is developed and maintained by {OPERATOR_NAME}.
      </p>
    </LegalPage>
  );
}
