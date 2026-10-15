import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppPromoCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            Log expenses from WhatsApp
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Send voice notes or quick messages to automatically track daily spending.
          </p>
        </div>
      </div>
      <Link
        href="/settings#whatsapp"
        className="px-4 py-2 bg-accent hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shrink-0 text-center self-start sm:self-auto cursor-pointer"
      >
        Connect WhatsApp
      </Link>
    </div>
  );
}
