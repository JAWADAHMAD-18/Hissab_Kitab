"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { MIN_PASSWORD_LENGTH, validatePassword } from "@/lib/passwordPolicy";

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update password.");
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-6">
      <h2 className="text-lg font-bold text-text-primary tracking-tight">Change Password</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        {/* Current password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-text-muted">Minimum {MIN_PASSWORD_LENGTH} characters</p>
        </div>

        {/* Confirm new password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-xs text-expense font-semibold">{error}</p>}

        <div className="flex items-center gap-3 mt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
          {successMsg && (
            <span className="text-xs text-income font-semibold">Password updated ✓</span>
          )}
        </div>
      </form>
    </div>
  );
}
