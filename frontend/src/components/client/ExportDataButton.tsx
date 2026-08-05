"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function ExportDataButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) {
        setError("Failed to export data. Please try again.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hisab-kitab-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer w-fit"
      >
        <Download className="w-4 h-4" />
        {loading ? "Preparing export..." : "Export My Data (CSV)"}
      </button>
      {error && <p className="text-xs text-expense font-semibold">{error}</p>}
    </div>
  );
}
