"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/client/Button";
import { useAuthModal } from "@/components/client/AuthModalProvider";

export function FinalCTA() {
  const { openModal } = useAuthModal();

  return (
    <section id="get-started" className="py-8 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full rounded-3xl bg-accent px-8 py-12 lg:py-16 text-center text-white flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
        >
          {/* H2 Headline */}
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Stop Wondering Where It Went.
          </h2>

          {/* Subtext */}
          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mt-4 font-normal leading-relaxed">
            One voice note is all it takes to start tracking properly.
          </p>

          {/* Button */}
          <div className="mt-8">
            <Button
              variant="primary"
              onClick={() => openModal("signup")}
              className="!bg-white !text-accent hover:!bg-white/90 font-semibold text-base shadow-md"
            >
              Get Started Free
            </Button>
          </div>

          {/* Trust Line */}
          <p className="text-white/70 text-xs sm:text-sm mt-4 font-normal">
            No credit card needed &nbsp;&middot;&nbsp; 2-minute setup
          </p>
        </motion.div>
      </div>
    </section>
  );
}
