"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/client/Button";
import { useAuthModal } from "@/components/client/AuthModalProvider";
import { NavLink } from "@/components/client/NavLink";
import { clearAllCaches } from "@/lib/clearAllCaches";
import { AVATAR_UPDATED_EVENT } from "@/lib/avatarEvents";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const { openModal } = useAuthModal();

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll listener for border styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Outside click to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key to close dropdown & return focus to avatar button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dropdownOpen) {
        setDropdownOpen(false);
        avatarButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen]);

  // Listen for avatar updates from Settings
  useEffect(() => {
    const handleAvatarUpdated = () => {
      setAvatarVersion((v) => v + 1);
      setImgLoaded(false);
      setImgError(false);
    };
    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);
    return () => window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);
  }, []);

  const userInitial = (
    session?.user?.name ||
    session?.user?.email ||
    "U"
  )[0].toUpperCase();

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await clearAllCaches();
    signOut({ callbackUrl: "/login" });
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-50 bg-surface/95 backdrop-blur-md transition-all duration-300 [padding-top:env(safe-area-inset-top)] ${
        scrolled ? "border-b border-border shadow-xs" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 flex items-center justify-between gap-3 min-w-0">
        {/* Brand */}
        <Link
          href="/"
          className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-accent inline-block shrink-0" />
          Hisab Kitab
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 min-w-0 [&_a]:text-sm sm:[&_a]:text-base">
          <NavLink href="/about">About</NavLink>
          <NavLink href="/faq">FAQ</NavLink>

          {isAuthenticated ? (
            <div className="relative flex items-center gap-4 min-w-0 ml-2" ref={dropdownRef}>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/transactions">Transactions</NavLink>

              {/* Avatar Button */}
              <button
                ref={avatarButtonRef}
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                className="w-8 h-8 rounded-full relative overflow-hidden bg-accent/10 border border-accent/20 flex items-center justify-center hover:ring-2 hover:ring-accent/30 transition-all cursor-pointer shrink-0"
              >
                {/* Fallback initial letter */}
                <span className="text-accent font-semibold text-xs select-none">
                  {userInitial}
                </span>

                {/* Avatar image (rendered smoothly over initial if available) */}
                {!imgError && (
                  <img
                    src={`/api/user/avatar?v=${avatarVersion}`}
                    alt=""
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                    className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-150 ${
                      imgLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                )}
              </button>

              {/* Desktop Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="menu"
                    aria-label="User menu options"
                    className="absolute right-0 top-11 w-52 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-50 flex flex-col"
                  >
                    <div className="px-3.5 py-2 border-b border-border/60">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {session?.user?.email}
                      </p>
                    </div>

                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-background transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-text-muted" />
                      Settings
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-expense hover:bg-background transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 ml-2">
              <Button variant="secondary" onClick={() => openModal("login")}>
                Login
              </Button>
              <Button variant="primary" onClick={() => openModal("signup")}>
                Get Started
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              href="/settings"
              aria-label="Go to Settings"
              className="w-7 h-7 rounded-full relative overflow-hidden bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0"
            >
              <span className="text-accent font-semibold text-xs select-none">
                {userInitial}
              </span>
              {!imgError && (
                <img
                  src={`/api/user/avatar?v=${avatarVersion}`}
                  alt=""
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover absolute inset-0 ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="p-1.5 rounded-lg border border-border text-text-primary hover:bg-background transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3 overflow-hidden shadow-lg"
          >
            {isAuthenticated && (
              <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                <div className="w-9 h-9 rounded-full relative overflow-hidden bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-accent font-semibold text-sm">
                    {userInitial}
                  </span>
                  {!imgError && (
                    <img
                      src={`/api/user/avatar?v=${avatarVersion}`}
                      alt=""
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1 text-sm">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg font-medium text-text-primary hover:bg-background transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/transactions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg font-medium text-text-primary hover:bg-background transition-colors"
                  >
                    Transactions
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg font-medium text-text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-text-muted" />
                    Settings
                  </Link>
                </>
              ) : null}

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 rounded-lg font-medium text-text-primary hover:bg-background transition-colors"
              >
                About
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 rounded-lg font-medium text-text-primary hover:bg-background transition-colors"
              >
                FAQ
              </Link>
            </div>

            <div className="pt-2 border-t border-border/60">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-2.5 py-2 text-sm font-medium text-expense hover:bg-background rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openModal("login");
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openModal("signup");
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
