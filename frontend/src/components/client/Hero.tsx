'use client';

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Mic, ChevronDown, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/client/Button";
import { useAuthModal } from "@/components/client/AuthModalProvider";

export function Hero() {
  const { openModal } = useAuthModal();

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Waveform bars height variation for subtle infinite loop
  const waveformHeights = [
    ["12px", "28px", "14px", "22px", "12px"],
    ["20px", "12px", "26px", "16px", "20px"],
    ["14px", "24px", "12px", "28px", "14px"],
    ["24px", "16px", "28px", "12px", "24px"],
    ["16px", "26px", "18px", "24px", "16px"],
  ];

  return (
    <section className="w-full min-h-none lg:min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background py-12 lg:py-16">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center">
        {/* Left Column: Copy & CTAs */}
        <motion.div
          className="flex flex-col items-start text-left gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* 1. Eyebrow Pill */}
          <motion.div
            variants={childVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-xs sm:text-sm tracking-wide"
          >
            Voice-First Expense Tracking
          </motion.div>

          {/* 2. H1 Headline */}
          <motion.h1
            variants={childVariants}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary tracking-tight leading-[1.1]"
          >
            Ek Paycheck. Ek Mahina. Har Rupee Ka Hisab.
          </motion.h1>

          {/* 3. Subheadline */}
          <motion.p
            variants={childVariants}
            className="text-base sm:text-lg text-text-muted max-w-xl font-normal leading-relaxed"
          >
            WhatsApp pe voice note bhejo — Hisab Kitab khud expense log kar dega.
            Month-end pe milegi poori kahani, sirf numbers nahi.
          </motion.p>

          {/* 4. CTA Row */}
          <motion.div
            variants={childVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <Button variant="primary" onClick={() => openModal("signup")}>
              Free Mein Shuru Karo
            </Button>
            <Button variant="secondary" href="#how-it-works">
              Dekho Kaise Kaam Karta Hai &rarr;
            </Button>
          </motion.div>

          {/* 5. Trust Microcopy */}
          <motion.p
            variants={childVariants}
            className="text-sm text-text-muted font-normal mt-1"
          >
            Koi credit card nahi chahiye &nbsp;&middot;&nbsp; 2 minute mein setup
          </motion.p>
        </motion.div>

        {/* Right Column: Product Mechanic Visual */}
        <div
          aria-hidden="true"
          className="w-full bg-surface border border-border rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col gap-5 select-none pointer-events-none"
        >
          {/* Step 1: Voice Message Bubble */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            className="bg-background border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 h-8">
                {waveformHeights.map((keyframes, idx) => (
                  <motion.span
                    key={idx}
                    className="w-1 bg-accent rounded-full inline-block"
                    animate={{ height: keyframes }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs font-mono text-text-muted">
              &quot;Lunch at Biryani House Rs. 450&quot;
            </span>
          </motion.div>

          {/* Step 2: Connecting Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex items-center justify-center text-text-muted/60"
          >
            <ChevronDown className="w-5 h-5 text-accent animate-bounce" />
          </motion.div>

          {/* Step 3: Auto-categorized Expense Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
            className="bg-background border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">
                  Food
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-accent" />
                  Auto-categorized
                </span>
              </div>
            </div>
            <span className="text-lg font-bold text-expense">
              Rs. 450
            </span>
          </motion.div>

          {/* Step 4: Month Runway Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5, ease: "easeOut" }}
            className="bg-background border border-border rounded-xl p-4 flex flex-col gap-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-text-primary font-semibold">
                18 din baaki
              </span>
              <span className="text-text-muted">
                Rs. 12,400 remaining
              </span>
            </div>
            <div className="w-full bg-border/60 h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
                className="bg-signature h-full rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
