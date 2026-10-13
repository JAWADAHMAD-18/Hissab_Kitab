"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";

interface ForgotPasswordInputs {
  email: string;
}

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendRequest = async (email: string) => {
    setErrorMsg(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(
          data.error || "An error occurred while sending the reset link."
        );
        setStatus("idle");
        return;
      }

      setSubmittedEmail(email);
      setStatus("sent");
      setCooldown(60);
    } catch {
      setErrorMsg("An unexpected network error occurred. Please try again.");
      setStatus("idle");
    }
  };

  const onSubmit = async (data: ForgotPasswordInputs) => {
    await sendRequest(data.email);
  };

  const handleResend = async () => {
    if (cooldown > 0 || !submittedEmail) return;
    await sendRequest(submittedEmail);
  };

  if (status === "sent") {
    return (
      <div className="w-full text-center">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
          <MailCheck className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Check your inbox
        </h2>

        <p className="text-sm text-text-muted mt-2">
          If an account exists for{" "}
          <strong className="text-text-primary font-medium">
            {submittedEmail}
          </strong>
          , we&apos;ve sent a link. It expires in 15 minutes.
        </p>

        <p className="text-xs text-text-muted mt-3 bg-surface/50 border border-border/80 rounded-md p-3">
          Signed up with Google? This link lets you set a password too.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/40 border border-expense text-expense text-sm rounded-md text-center">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="w-full py-2.5 bg-background border border-border hover:bg-surface text-text-primary font-medium text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
          </button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-accent hover:underline font-medium mt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Forgot Password
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Enter your email and we&apos;ll send you a link to reset or set your password.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-950/40 border border-expense text-expense text-sm rounded-md text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
          />
          {errors.email && (
            <span className="text-xs text-expense mt-1 block">
              {errors.email.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-2.5 bg-accent hover:bg-emerald-700 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          {status === "loading" ? "Sending link..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-xs text-text-muted mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>
      </p>
    </div>
  );
}
