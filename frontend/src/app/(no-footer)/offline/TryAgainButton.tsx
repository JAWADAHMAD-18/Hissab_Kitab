"use client";

export function TryAgainButton() {
  return (
    <button
      type="button"
      onClick={() => location.reload()}
      className="mt-6 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
    >
      Try again
    </button>
  );
}
