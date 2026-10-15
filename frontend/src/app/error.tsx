"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 sm:px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-expense/10 text-expense flex items-center justify-center mb-5">
        <span className="w-4 h-4 rounded-full bg-expense inline-block" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-expense mb-2">
        Error
      </p>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        An unexpected error occurred while loading this page. Please try again or
        return to the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-surface hover:bg-background border border-border text-text-primary font-semibold text-sm rounded-xl transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
