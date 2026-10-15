import React from "react";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/legal";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-12">
        <nav
          aria-label="Footer"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12"
        >
          {/* Zone 1: Brand block */}
          <div className="sm:col-span-2 flex flex-col gap-3">
            <Link
              href="/"
              className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity whitespace-nowrap w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
            >
              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-accent inline-block shrink-0" />
              Hisab Kitab
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-sm">
              A simple monthly money tracker. Log income and spending by typing or voice, and see what&apos;s left.
            </p>
          </div>

          {/* Zone 2: Product column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Product
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-text-muted">
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#why-hisab-kitab"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  Why Hisab Kitab
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Zone 3: Legal column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Legal
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-text-muted">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/data-deletion"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  Data Deletion
                </Link>
              </li>
            </ul>
          </div>

          {/* Zone 4: Support column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Support
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-text-muted">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Zone 5: Bottom bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-text-muted">
          <p>© {currentYear} Hisab Kitab</p>
          <p>
            A product of{" "}
            <a
              href="https://zalvrohq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary font-medium hover:text-accent transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              Zalvro
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
