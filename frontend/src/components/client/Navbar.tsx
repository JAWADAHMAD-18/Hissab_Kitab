"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { Button } from "@/components/client/Button";
import { useAuthModal } from "@/components/client/AuthModalProvider";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const { openModal } = useAuthModal();

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = (
    session?.user?.name ||
    session?.user?.email ||
    "U"
  )[0].toUpperCase();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-50 bg-surface/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "border-b border-border shadow-xs" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="w-3.5 h-3.5 rounded-full bg-accent inline-block shrink-0"></span>
          Hisab Kitab
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5">
          {isAuthenticated ? (
            <div className="relative flex items-center gap-4" ref={dropdownRef}>
              <Link
                href="/dashboard"
                className={`text-base font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-accent font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Dashboard
              </Link>

              {/* Avatar Button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-sm flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer"
              >
                {userInitial}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-50 flex flex-col"
                  >
                    <div className="px-3.5 py-2 border-b border-border/60">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {session?.user?.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-expense hover:bg-background transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Button variant="secondary" onClick={() => openModal("login")}>
                Login
              </Button>
              <Button variant="primary" onClick={() => openModal("signup")}>
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
