"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/passwordPolicy";

interface ResetPasswordFormProps {
  token: string | null;
}

interface ResetFormInputs {
  password: string;
  confirmPassword: string;
}

const HEX_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "invalid" | "form">("checking");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetFormInputs>();

  useEffect(() => {
    if (!token || !HEX_TOKEN_REGEX.test(token)) {
      setStatus("invalid");
      return;
    }

    let isMounted = true;
    const verifyToken = async () => {
      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`
        );
        const data = await res.json().catch(() => ({}));
        if (!isMounted) return;

        if (res.ok && data?.data?.valid) {
          setStatus("form");
        } else {
          setStatus("invalid");
        }
      } catch {
        if (isMounted) setStatus("invalid");
      }
    };

    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const onSubmit = async (data: ResetFormInputs) => {
    if (!token) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok || !resData.success) {
        const error = resData.error || "Failed to update password.";
        if (
          typeof error === "string" &&
          (error.toLowerCase().includes("invalid or has expired") ||
            res.status === 400 && error.toLowerCase().includes("expired"))
        ) {
          setStatus("invalid");
        } else {
          setErrorMsg(error);
        }
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="w-full text-center py-8">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
        <p className="text-sm text-text-muted">Verifying your reset link…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="w-full text-center py-2">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-expense">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Invalid or Expired Link
        </h2>

        <p className="text-sm text-text-muted mt-2">
          This password reset link is invalid or has expired. Reset links expire
          15 minutes after being issued.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/forgot-password"
            className="w-full py-2.5 bg-accent hover:bg-emerald-700 text-white font-medium text-sm rounded-md transition-colors text-center"
          >
            Request a new link
          </Link>

          <Link
            href="/login"
            className="text-xs text-text-muted hover:text-text-primary transition-colors text-center mt-2"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Set New Password
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Create a new password for your Hisab Kitab account
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
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: MIN_PASSWORD_LENGTH,
                  message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
                },
                maxLength: {
                  value: MAX_PASSWORD_LENGTH,
                  message: `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`,
                },
              })}
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-expense mt-1 block">
              {errors.password.message}
            </span>
          )}
          <p className="text-xs text-text-muted mt-1">
            Minimum {MIN_PASSWORD_LENGTH} characters
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              })}
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-expense mt-1 block">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-accent hover:bg-emerald-700 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
