"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="py-8 lg:py-12 bg-background border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col"
        >
          {/* Top Row: Wordmark & Tagline */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-sm font-bold text-text-primary tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block shrink-0"></span>
              Hisab Kitab
            </Link>
            <span className="hidden sm:inline text-text-muted/40 text-xs">
              &middot;
            </span>
            <p className="text-sm text-text-muted">
              One paycheck, one month, fully tracked.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Bottom Row: Copyright & Mailto */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-text-muted">
              &copy; 2026 Hisab Kitab. All rights reserved.
            </p>
            <a
              href="mailto:hello@hisabkitab.app"
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              hello@hisabkitab.app
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
