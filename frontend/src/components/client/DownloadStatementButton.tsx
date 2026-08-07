"use client";

import { useState, useRef, useCallback } from "react";
import { Download } from "lucide-react";
import { TransactionItem } from "@/components/server/RecentActivity";

interface DownloadStatementButtonProps {
  monthLabel: string;       // e.g. "August 2026"
  selectedMonth: string;    // e.g. "2026-08" (for filename)
  transactions: TransactionItem[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const HINT_TEXT = "Need everything? Full CSV export is in Settings";

export function DownloadStatementButton({
  monthLabel,
  selectedMonth,
  transactions,
  totalIncome,
  totalExpense,
  balance,
}: DownloadStatementButtonProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(() => {
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const handleDownload = async () => {
    // Dynamic import so jsPDF is not bundled server-side
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 18;
    const colW = pageW - margin * 2;
    let y = 20;

    const fmt = (n: number) =>
      `Rs. ${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    // ── Header ──────────────────────────────────────────────
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39); // text-primary
    doc.text("Hisab Kitab", margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128); // text-muted
    doc.text(`Monthly Statement — ${monthLabel}`, margin, y);
    y += 10;

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // ── Summary block ──────────────────────────────────────
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("Summary", margin, y);
    y += 6;

    const summaryRows = [
      { label: "Total Income", value: fmt(totalIncome), color: [5, 150, 105] as [number, number, number] },
      { label: "Total Expenses", value: fmt(totalExpense), color: [220, 38, 38] as [number, number, number] },
      {
        label: "Net Balance",
        value: (balance >= 0 ? "" : "- ") + fmt(balance),
        color: (balance >= 0 ? [17, 24, 39] : [220, 38, 38]) as [number, number, number],
      },
    ];

    for (const row of summaryRows) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(row.label, margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...row.color);
      doc.text(row.value, pageW - margin, y, { align: "right" });
      y += 6;
    }

    y += 4;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // ── Table header ───────────────────────────────────────
    const cols = { date: margin, type: margin + 28, label: margin + 48, amount: pageW - margin };
    const colWidths = [28, 20, colW - 48 - 28, 0];

    doc.setFillColor(249, 250, 251);
    doc.rect(margin, y - 4, colW, 8, "F");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text("Date", cols.date, y);
    doc.text("Type", cols.type, y);
    doc.text("Category / Source", cols.label, y);
    doc.text("Amount", cols.amount, y, { align: "right" });
    y += 7;

    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y - 1, pageW - margin, y - 1);
    y += 2;

    // ── Table rows ─────────────────────────────────────────
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    doc.setFontSize(8.5);
    for (const tx of sorted) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const dateStr = new Date(tx.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const isIncome = tx.type === "income";

      // Row bg tint for income
      if (isIncome) {
        doc.setFillColor(240, 253, 244);
        doc.rect(margin, y - 3.5, colW, 7, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(dateStr, cols.date, y);

      doc.setTextColor(17, 24, 39);
      doc.text(isIncome ? "Income" : "Expense", cols.type, y);

      // Truncate long label if needed
      const labelMax = colWidths[2] - 4;
      const labelText = doc.getStringUnitWidth(tx.label) * 8.5 / doc.internal.scaleFactor > labelMax
        ? tx.label.slice(0, 22) + "…"
        : tx.label;
      doc.text(labelText, cols.label, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(isIncome ? 5 : 220, isIncome ? 150 : 38, isIncome ? 105 : 38);
      doc.text(
        (isIncome ? "+ " : "- ") + fmt(tx.amount),
        cols.amount,
        y,
        { align: "right" }
      );

      y += 7;
      doc.setDrawColor(243, 244, 246);
      doc.line(margin, y - 1.5, pageW - margin, y - 1.5);
    }

    if (sorted.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("No transactions this month.", margin, y);
      y += 7;
    }

    // ── Footer ─────────────────────────────────────────────
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generated by Hisab Kitab on ${today}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );

    // ── Save ───────────────────────────────────────────────
    const slug = monthLabel.toLowerCase().replace(/\s+/g, "-");
    doc.save(`hisab-kitab-statement-${slug}.pdf`);

    showToast();
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Button */}
      <button
        type="button"
        onClick={handleDownload}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        aria-label="Download monthly statement as PDF"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-accent hover:bg-surface border border-border bg-background transition-colors cursor-pointer shadow-xs"
      >
        <Download className="w-4 h-4" />
        Statement
      </button>

      {/* Hover tooltip (desktop) */}
      <div
        aria-hidden="true"
        className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[220px] px-3 py-1.5 bg-text-primary text-white text-xs font-medium rounded-lg shadow-lg pointer-events-none transition-all duration-200 ${
          tooltipVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        {HINT_TEXT}
        {/* Arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text-primary" />
      </div>

      {/* Toast (post-click, covers mobile) */}
      {toastVisible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-text-primary text-white text-sm font-medium rounded-xl shadow-lg animate-fade-in-up"
        >
          <Download className="w-4 h-4 shrink-0" />
          {HINT_TEXT}
        </div>
      )}
    </div>
  );
}
