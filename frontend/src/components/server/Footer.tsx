import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function Footer() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-12">
        <nav
          aria-label="Footer"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
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
                  href="/login"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Zone 3: Account column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Account
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-text-muted">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      Settings
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      Sign up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>

        {/* Zone 4: Bottom bar */}
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
