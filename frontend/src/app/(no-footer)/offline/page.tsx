import type { Metadata } from "next";
import { TryAgainButton } from "./TryAgainButton";

export const metadata: Metadata = {
  title: "You're offline — Hisab Kitab",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <span className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
        <span className="w-5 h-5 rounded-full bg-accent inline-block" />
      </span>
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        You&apos;re offline
      </h1>
      <p className="text-text-muted text-sm max-w-xs">
        Hisab Kitab needs a connection to show your latest numbers.
      </p>
      <TryAgainButton />
    </div>
  );
}
