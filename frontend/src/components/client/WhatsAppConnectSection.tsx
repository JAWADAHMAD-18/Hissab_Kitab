"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface WhatsAppConnectSectionProps {
  whatsappNumber: string | null;
  whatsappVerified: boolean;
  whatsappDisplayNumber: string;
}

const LINK_CODE_TTL_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 3000;

export function WhatsAppConnectSection({
  whatsappNumber: initialNumber,
  whatsappVerified: initialVerified,
  whatsappDisplayNumber,
}: WhatsAppConnectSectionProps) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialVerified && Boolean(initialNumber));
  const [connectedNumber, setConnectedNumber] = useState(initialNumber || "");
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [waitingForLink, setWaitingForLink] = useState(false);
  const [startingLink, setStartingLink] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const linkStartedAtRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
  }, []);

  const resetLinkFlow = useCallback(() => {
    clearPolling();
    setWaitingForLink(false);
    setLinkCode(null);
    linkStartedAtRef.current = null;
  }, [clearPolling]);

  const handleStartLink = async () => {
    setError(null);
    setSuccessMsg(null);
    setStartingLink(true);

    try {
      const res = await fetch("/api/user/whatsapp/start-link", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to start WhatsApp linking.");
        return;
      }

      setLinkCode(data.data.code);
      setWaitingForLink(true);
      linkStartedAtRef.current = Date.now();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setStartingLink(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setSuccessMsg(null);
    setDisconnecting(true);

    try {
      const res = await fetch("/api/user/whatsapp/disconnect", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to disconnect WhatsApp.");
        return;
      }

      resetLinkFlow();
      setConnected(false);
      setConnectedNumber("");
      setSuccessMsg("WhatsApp disconnected.");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setDisconnecting(false);
    }
  };

  useEffect(() => {
    if (!waitingForLink) return;

    const pollStatus = async () => {
      try {
        const res = await fetch("/api/user/whatsapp/link-status");
        const data = await res.json();

        if (res.ok && data.success && data.data.whatsappVerified) {
          clearPolling();
          setWaitingForLink(false);
          setLinkCode(null);
          setConnected(true);
          setConnectedNumber(data.data.whatsappNumber || "");
          setSuccessMsg("WhatsApp connected successfully.");
          router.refresh();
        }
      } catch {
        // Keep polling — transient network errors shouldn't abort the flow
      }
    };

    pollStatus();
    pollIntervalRef.current = setInterval(pollStatus, POLL_INTERVAL_MS);

    const startedAt = linkStartedAtRef.current ?? Date.now();
    const remainingMs = Math.max(0, LINK_CODE_TTL_MS - (Date.now() - startedAt));

    expiryTimeoutRef.current = setTimeout(() => {
      resetLinkFlow();
      setError("Code expired, try again");
    }, remainingMs);

    return () => {
      clearPolling();
    };
  }, [waitingForLink, clearPolling, resetLinkFlow, router]);

  const displayNumber =
    whatsappDisplayNumber || "our WhatsApp number";

  return (
    <div id="whatsapp" className="scroll-mt-24 bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            WhatsApp
          </h2>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Link your WhatsApp number to log expenses by voice note — send a message,
            and we&apos;ll handle the rest.
          </p>
        </div>
      </div>

      {connected ? (
        <div className="flex flex-col gap-3 pl-[52px]">
          <p className="text-sm font-medium text-text-primary">
            Connected:{" "}
            <span className="font-semibold text-accent">{connectedNumber}</span>
          </p>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-fit px-4 py-2 text-sm font-semibold text-expense border border-border rounded-xl hover:bg-background transition-colors disabled:opacity-50 cursor-pointer"
          >
            {disconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      ) : waitingForLink && linkCode ? (
        <div className="flex flex-col gap-4 pl-[52px] max-w-sm">
          <p className="text-4xl font-mono font-bold tracking-[0.2em] text-text-primary">
            {linkCode}
          </p>
          <p className="text-sm text-text-muted leading-relaxed">
            Send this code as a WhatsApp message to{" "}
            <span className="font-semibold text-text-primary">{displayNumber}</span>
          </p>
          <p className="text-xs text-text-muted">
            Waiting for confirmation… (expires in 10 minutes)
          </p>
        </div>
      ) : (
        <div className="pl-[52px]">
          <button
            type="button"
            onClick={handleStartLink}
            disabled={startingLink}
            className="px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {startingLink ? "Generating code..." : "Connect WhatsApp"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-expense font-semibold pl-[52px]">{error}</p>
      )}
      {successMsg && (
        <p className="text-xs text-income font-semibold pl-[52px]">{successMsg}</p>
      )}
    </div>
  );
}
