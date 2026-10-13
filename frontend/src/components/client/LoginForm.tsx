"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginFormInputs {
  email: string;
  password?: string;
}

interface LoginFormProps {
  onToggleMode?: () => void;
  onSuccess?: () => void;
  onNavigate?: () => void;
}

export function LoginForm({ onToggleMode, onSuccess, onNavigate }: LoginFormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        if (onSuccess) onSuccess();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Login submit error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 id="auth-modal-title" className="text-2xl font-bold text-text-primary tracking-tight">
          Sign In to Hisab Kitab
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Access your monthly income and expense tracker
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

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-text-muted">
              Password
            </label>
            <Link
              href="/forgot-password"
              onClick={() => {
                if (onNavigate) onNavigate();
              }}
              className="text-xs text-accent hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
            })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
          />
          {errors.password && (
            <span className="text-xs text-expense mt-1 block">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-accent hover:bg-emerald-700 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <span className="relative bg-surface px-2 text-xs text-text-muted">
          OR
        </span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full py-2.5 bg-background border border-border hover:bg-surface text-text-primary font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-xs text-text-muted mt-6">
        Don&apos;t have an account?{" "}
        {onToggleMode ? (
          <button
            type="button"
            onClick={onToggleMode}
            className="text-accent hover:underline font-medium cursor-pointer"
          >
            Sign Up
          </button>
        ) : (
          <Link href="/signup" className="text-accent hover:underline font-medium">
            Sign Up
          </Link>
        )}
      </p>
    </div>
  );
}
