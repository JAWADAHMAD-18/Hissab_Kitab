import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/server/legal/LegalPage";
import { WHATSAPP_PUBLIC } from "@/lib/features";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about using Hisab Kitab, voice logging, budgets, data privacy, and account settings.",
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQGroup {
  title: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const faqGroups: FAQGroup[] = [
    {
      title: "Getting Started",
      items: [
        {
          question: "What does \"Remaining\" mean on my dashboard?",
          answer: (
            <>
              &quot;Remaining&quot; is your total income for the selected month minus
              all expenses recorded in that same month. It shows how much unallocated
              cash you have left from this month&apos;s earnings.
            </>
          ),
        },
        {
          question: "How does carry-forward work?",
          answer: (
            <>
              Carried-forward balance is the cumulative surplus (or deficit) from all
              months strictly prior to the selected month. It gives you an accurate
              picture of your overall savings accumulated before the current month began.
            </>
          ),
        },
        {
          question: "How do I install Hisab Kitab on my phone?",
          answer: (
            <>
              On Android, open Chrome and tap the install prompt banner at the bottom
              of the dashboard, or tap the three dots in Chrome and choose &quot;Install
              app&quot;. On iPhone, open Safari, tap the Share icon at the bottom, and
              select &quot;Add to Home Screen&quot;.
            </>
          ),
        },
        {
          question: "Does Hisab Kitab work offline?",
          answer: (
            <>
              Hisab Kitab requires an active internet connection to securely fetch and
              save your latest financial data. If your connection drops, an offline
              page will inform you until connectivity is restored.
            </>
          ),
        },
      ],
    },
    {
      title: "Adding Entries & Voice Logging",
      items: [
        {
          question: "How do I add an expense using my voice?",
          answer: (
            <>
              Tap the green microphone button on your dashboard. When recording starts,
              speak in Urdu, English, or a mix of both (e.g., &quot;aj shawarma 500
              ka&quot;). Tap the checkmark button when finished, and the transaction
              will be parsed and added to your records automatically.
            </>
          ),
        },
        {
          question: "Can I log multiple expenses in a single sentence?",
          answer: (
            <>
              Yes. You can say phrases like &quot;fuel 1500, groceries 3000 aur lunch
              800&quot;. The AI parser identifies each item and category, creating
              separate expense entries for each one.
            </>
          ),
        },
        {
          question: "Is my voice recording stored anywhere?",
          answer: (
            <>
              No. Audio is sent securely to Groq Whisper for immediate transcription
              and is discarded right after. Hisab Kitab does not store your voice notes
              or raw audio files.
            </>
          ),
        },
      ],
    },
    {
      title: "Budgets & Spending Limits",
      items: [
        {
          question: "How do budget rules apply across months?",
          answer: (
            <>
              When setting a budget, you can choose &quot;This month and onward&quot;
              or &quot;Only this month&quot;. Default budgets apply from the chosen
              month forward, while month-specific budgets override the default for
              that single month without affecting future months.
            </>
          ),
        },
        {
          question: "What do the 80% and 100% budget alerts mean?",
          answer: (
            <>
              When you reach 80% of an allocated category or total monthly budget, an
              amber warning appears on your dashboard and in weekly emails. At 100% or
              above, a red alert reminds you that you have exceeded your target limit.
            </>
          ),
        },
      ],
    },
    {
      title: "Account & Security",
      items: [
        {
          question: "What should I do if I forgot my password?",
          answer: (
            <>
              Go to the <Link href="/login">Login</Link> page and click &quot;Forgot
              password?&quot;, or visit the{" "}
              <Link href="/forgot-password">Forgot Password</Link> page directly. Enter
              your email, and we will send you a secure link that expires in 15
              minutes.
            </>
          ),
        },
        {
          question: "I signed up with Google. Can I set a password?",
          answer: (
            <>
              Yes. Visit the <Link href="/forgot-password">Forgot Password</Link> page,
              enter your Google account email, and follow the link sent to your inbox.
              This allows you to set a password and sign in with either Google or
              email and password.
            </>
          ),
        },
        {
          question: "How do I export all my data?",
          answer: (
            <>
              Go to <Link href="/settings">Settings</Link> and find the &quot;Data &amp;
              Privacy&quot; section. Click &quot;Export All Data&quot; to download a CSV
              spreadsheet containing every income and expense record you have saved.
            </>
          ),
        },
        {
          question: "How do I delete my account and data?",
          answer: (
            <>
              Go to <Link href="/settings">Settings</Link> and scroll to the Danger
              Zone. Click &quot;Delete account&quot;, type <code>DELETE</code> to
              confirm, and all your records, budgets, profile data, and credentials
              will be permanently removed immediately. See our{" "}
              <Link href="/data-deletion">Data Deletion</Link> page for full details.
            </>
          ),
        },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        {
          question: "Is my financial data sold or shared with advertisers?",
          answer: (
            <>
              No. We do not sell your personal data, nor do we run advertisements or
              track you across third-party websites. Your financial records are
              private to your account.
            </>
          ),
        },
        {
          question: "What cookies does Hisab Kitab use?",
          answer: (
            <>
              We only use essential session cookies to keep you securely signed in and
              a small local storage item to remember if you dismissed the install
              banner. We do not use third-party tracking or advertising cookies.
            </>
          ),
        },
      ],
    },
    {
      title: "WhatsApp & Support",
      items: [
        {
          question: "How does the WhatsApp integration work?",
          answer: WHATSAPP_PUBLIC ? (
            <>
              You can connect your WhatsApp number in{" "}
              <Link href="/settings#whatsapp">Settings</Link>. Once linked, you can
              send voice notes or text messages directly to our WhatsApp number, and
              expenses will be logged into your account automatically.
            </>
          ) : (
            <>
              WhatsApp logging is currently in private preview and will be made
              available publicly soon. Once launched, you will be able to connect your
              number in Settings.
            </>
          ),
        },
        {
          question: "How can I contact support?",
          answer: (
            <>
              You can email us directly at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your account
              email and details about your question or issue. You can also visit our{" "}
              <Link href="/contact">Contact page</Link>.
            </>
          ),
        },
      ],
    },
  ];

  return (
    <LegalPage
      title="Frequently Asked Questions"
      subtitle="Quick answers to common questions about features, privacy, budgets, and security in Hisab Kitab."
    >
      <div className="space-y-8">
        {faqGroups.map((group) => (
          <section key={group.title} className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary tracking-tight !mt-6 !mb-2 border-b border-border/60 pb-2">
              {group.title}
            </h2>
            <div className="space-y-2.5">
              {group.items.map((item, index) => (
                <details
                  key={index}
                  className="group border border-border rounded-xl bg-surface p-4 transition-colors"
                >
                  <summary className="font-medium text-text-primary text-sm sm:text-base cursor-pointer list-none flex items-center justify-between gap-3 select-none">
                    <span>{item.question}</span>
                    <span className="text-text-muted text-xs transition-transform duration-200 group-open:rotate-180 shrink-0">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-3 text-xs sm:text-sm text-text-muted leading-relaxed pt-3 border-t border-border/50">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </LegalPage>
  );
}
