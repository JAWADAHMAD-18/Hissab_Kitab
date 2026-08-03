import Link from "next/link";
import { HeroAnimation } from "@/components/client/HeroAnimation";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col gap-20">
      {/* Hero Section */}
      <HeroAnimation>
        <section className="text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-income"></span>
            Personal Monthly Finance Tracker
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight max-w-3xl">
            One paycheck. One month. Know exactly where your money went.
          </h1>

          <p className="text-base sm:text-lg text-text-muted max-w-2xl font-normal leading-relaxed">
            Hisab Kitab is built for students and salaried employees who get paid once a month and lose track of daily spending before month-end.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-md bg-accent text-white font-medium hover:bg-blue-600 transition-colors shadow-sm"
            >
              Start Tracking Now
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-md bg-surface border border-border text-text-primary font-medium hover:bg-background transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>
      </HeroAnimation>

      {/* How It Works Section */}
      <section className="flex flex-col gap-10">
        <div className="border-t border-border pt-12 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            How it works
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Simple, structured monthly bookkeeping in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3">
            <div className="w-8 h-8 rounded bg-background border border-border text-accent flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              Add Monthly Income
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Log your single monthly salary, allowance, or freelance payout at the start of the month to set your baseline budget.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3">
            <div className="w-8 h-8 rounded bg-background border border-border text-accent flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              Log Expenses as You Go
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Record daily expenses into fixed categories like Food, Transport, Utilities, and Rent to prevent fragmented tracking.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3">
            <div className="w-8 h-8 rounded bg-background border border-border text-accent flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              Get Month-End Summary
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Review your monthly spending, remaining budget, and cumulative balance to build healthier financial habits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
