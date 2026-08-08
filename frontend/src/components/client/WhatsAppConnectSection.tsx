"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface WhatsAppConnectSectionProps {
  whatsappNumber: string | null;
  whatsappVerified: boolean;
}

export function WhatsAppConnectSection({
  whatsappNumber: initialNumber,
  whatsappVerified: initialVerified,
}: WhatsAppConnectSectionProps) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialVerified && Boolean(initialNumber));
  const [connectedNumber, setConnectedNumber] = useState(initialNumber || "");
  const [phoneNumber, setPhoneNumber] = useState(initialNumber || "");
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      setError("Please enter your WhatsApp number.");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch("/api/user/whatsapp/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to send verification code.");
        return;
      }

      setCodeSent(true);
      setSuccessMsg("Code sent! Check your WhatsApp.");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/user/whatsapp/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Verification failed.");
        return;
      }

      setConnected(true);
      setConnectedNumber(data.data.whatsappNumber);
      setCodeSent(false);
      setVerificationCode("");
      setSuccessMsg("WhatsApp connected successfully.");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setSuccessMsg(null);
    setDisconnecting(true);

    try {
      const res = await fetch("/api/user/whatsapp/disconnect", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to disconnect WhatsApp.");
        return;
      }

      setConnected(false);
      setConnectedNumber("");
      setPhoneNumber("");
      setCodeSent(false);
      setVerificationCode("");
      setSuccessMsg("WhatsApp disconnected.");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-4">
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
      ) : (
        <div className="flex flex-col gap-4 pl-[52px]">
          <form onSubmit={handleSendCode} className="flex flex-col gap-3 max-w-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+923001234567"
                disabled={codeSent && sendingCode}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-60"
              />
              <p className="text-xs text-text-muted">
                Include country code, e.g. +92XXXXXXXXXX
              </p>
            </div>

            {!codeSent && (
              <button
                type="submit"
                disabled={sendingCode}
                className="w-fit px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {sendingCode ? "Sending..." : "Send Code"}
              </button>
            )}
          </form>

          {codeSent && (
            <form onSubmit={handleVerify} className="flex flex-col gap-3 max-w-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm tracking-widest focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false);
                    setVerificationCode("");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-sm text-text-muted hover:text-text-primary cursor-pointer"
                >
                  Change number
                </button>
              </div>
            </form>
          )}
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
