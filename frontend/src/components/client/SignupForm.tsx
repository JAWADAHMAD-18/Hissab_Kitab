"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupFormInputs {
  name: string;
  email: string;
  password?: string;
}

interface SignupFormProps {
  onToggleMode?: () => void;
  onSuccess?: () => void;
}

export function SignupForm({ onToggleMode, onSuccess }: SignupFormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>();

  const onSubmit = async (data: SignupFormInputs) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      // 1. Create account via backend API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setErrorMsg(resData.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Automatically log in after registration
      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.ok) {
        if (onSuccess) onSuccess();
        router.push("/dashboard");
        router.refresh();
      } else {
        if (onToggleMode) {
          onToggleMode();
        } else {
          router.push("/login");
        }
      }
    } catch (err: unknown) {
      console.error("Signup submit error:", err);
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
          Create an Account
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Start tracking your monthly income and expenses
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
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...register("name", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
          />
          {errors.name && (
            <span className="text-xs text-expense mt-1 block">
              {errors.name.message}
            </span>
          )}
        </div>

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
          <label className="block text-xs font-medium text-text-muted mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
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
          {loading ? "Creating Account..." : "Create Account"}
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
        Already have an account?{" "}
        {onToggleMode ? (
          <button
            type="button"
            onClick={onToggleMode}
            className="text-accent hover:underline font-medium cursor-pointer"
          >
            Sign In
          </button>
        ) : (
          <Link href="/login" className="text-accent hover:underline font-medium">
            Sign In
          </Link>
        )}
      </p>
    </div>
  );
}
