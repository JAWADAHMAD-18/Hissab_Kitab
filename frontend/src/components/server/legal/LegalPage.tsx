import React from "react";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

interface LegalPageProps {
  title: string;
  lastUpdated?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function LegalPage({
  title,
  lastUpdated = LEGAL_LAST_UPDATED,
  subtitle,
  children,
}: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
      <header className="mb-8 pb-6 border-b border-border">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-text-muted mt-2 leading-relaxed">
            {subtitle}
          </p>
        )}
        {lastUpdated && (
          <p className="text-xs text-text-muted mt-3">
            Last updated: {lastUpdated}
          </p>
        )}
      </header>

      <main className="text-text-primary [&_h2]:text-lg sm:[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:tracking-tight [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ul]:text-sm sm:[&_ul]:text-base [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-4 [&_ol]:text-sm sm:[&_ol]:text-base [&_li]:leading-relaxed [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-emerald-700">
        {children}
      </main>
    </div>
  );
}
