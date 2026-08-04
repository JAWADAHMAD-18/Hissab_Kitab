"use client";

import { motion } from "framer-motion";

export function FounderNote() {
  return (
    <section id="founder-note" className="py-8 lg:py-6 bg-background">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* Avatar */}
          <div
            aria-hidden="true"
            className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-xl flex items-center justify-center shrink-0 shadow-xs select-none"
          >
            J
          </div>

          {/* Quote body */}
          <blockquote className="text-xl lg:text-2xl text-text-primary font-medium leading-relaxed text-center">
            &quot;I never really knew where my money went. I&apos;d spend
            through the month, and by the end I couldn&apos;t tell you what it
            actually went to. I didn&apos;t want another app to open and fill
            in — I wanted something that just fit into what I was already doing.
            Send a message, and it&apos;s tracked. That&apos;s the whole idea
            behind Hisab Kitab.&quot;
          </blockquote>

          {/* Signature line */}
          <cite className="text-base text-text-muted not-italic">
            — Jawad, Founder of Hisab Kitab
          </cite>
        </motion.div>
      </div>
    </section>
  );
}
