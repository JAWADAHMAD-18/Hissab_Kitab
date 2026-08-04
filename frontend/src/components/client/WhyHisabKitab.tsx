"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowLeftRight, MessageCircle, Tag } from "lucide-react";

export function WhyHisabKitab() {
  const features = [
    {
      icon: Wallet,
      title: "One Paycheck, One Month",
      body: "No multi-account dashboards, no clutter. Just this month's money, tracked simply.",
    },
    {
      icon: ArrowLeftRight,
      title: "Income and Expenses, Both",
      body: "See the full picture — not just where money left, but where it came from.",
    },
    {
      icon: MessageCircle,
      title: "No New App to Learn",
      body: "It lives inside WhatsApp, where you already are. Nothing to download, nothing to figure out.",
    },
    {
      icon: Tag,
      title: "Categories That Actually Fit",
      body: "Food, Transport, Rent, Utilities, Education, Health, Shopping, Family — built around real spending, not generic buckets.",
    },
  ];

  return (
    <section id="why-hisab-kitab" className="py-8 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12 lg:gap-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-xl mx-auto gap-3"
        >
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-accent/10 text-accent font-semibold text-xs sm:text-sm tracking-wide">
            Why Hisab Kitab
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">
            Not Another Budgeting App.
          </h2>
          <p className="text-base text-text-muted font-normal leading-relaxed">
            Most finance apps are built for people juggling five accounts and a
            spreadsheet. This one&apos;s built for exactly one paycheck.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="bg-surface border border-border rounded-2xl p-6 lg:p-8 flex items-start gap-4 shadow-xs"
              >
                <div
                  aria-hidden="true"
                  className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0"
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-muted font-normal leading-relaxed">
                    {feature.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
