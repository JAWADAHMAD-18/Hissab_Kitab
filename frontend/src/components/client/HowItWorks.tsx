"use client";

import { motion } from "framer-motion";
import { Mic, Sparkles, Mail } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Mic,
      iconBg: "bg-accent/10 text-accent",
      title: "Send a Voice Note",
      body: "Open WhatsApp, send a voice note — 'lunch, 450 rupees.' That's literally it.",
    },
    {
      number: "02",
      icon: Sparkles,
      iconBg: "bg-accent/10 text-accent",
      title: "It Auto-Categorizes Itself",
      body: "AI listens, picks up the amount and category — Food, Transport, Rent, whatever it is. Nothing to type.",
    },
    {
      number: "03",
      icon: Mail,
      iconBg: "bg-signature/10 text-signature",
      title: "Get the Story at Month-End",
      body: "Not just a table of numbers — a written email that tells you where your money went, and what could be better next month.",
    },
  ];

  return (
    <section id="how-it-works" className="py-8 lg:py-16 bg-background">
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
            How It Works
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">
            Just Three Steps.
          </h2>
          <p className="text-base text-text-muted font-normal leading-relaxed">
            No forms, no manual entry — just a voice note.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Desktop Connecting Line */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-14 left-12 right-12 h-0 border-t-2 border-dashed border-border -z-0"
          />

          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
                className="bg-surface border border-border rounded-2xl p-6 lg:p-8 relative z-10 flex flex-col items-start gap-4 shadow-xs"
              >
                {/* Header row: Icon & Number Badge */}
                <div className="w-full flex items-center justify-between">
                  <div
                    aria-hidden="true"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.iconBg}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-semibold tracking-wider text-text-muted bg-background border border-border px-3 py-1 rounded-full">
                    {step.number}
                  </span>
                </div>

                {/* Step Title & Body */}
                <div className="flex flex-col gap-2 mt-2">
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-muted font-normal leading-relaxed">
                    {step.body}
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
