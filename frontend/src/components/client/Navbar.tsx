"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-3 h-3 rounded-full bg-accent inline-block"></span>
          Hisab Kitab
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-accent font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm font-medium text-text-muted hover:text-text-primary px-3 py-1.5 rounded-md border border-border hover:bg-background transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/login"
                    ? "text-accent font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-accent hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
