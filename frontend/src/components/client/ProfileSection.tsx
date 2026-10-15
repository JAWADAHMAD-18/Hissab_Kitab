"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/client/AvatarUpload";
import { dispatchAvatarUpdated } from "@/lib/avatarEvents";

interface ProfileSectionProps {
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
}

export function ProfileSection({ name, email, image, createdAt }: ProfileSectionProps) {
  const router = useRouter();
  const [nameValue, setNameValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userInitial = (name || email || "U")[0].toUpperCase();

  const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleSaveProfile = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save name.");
      } else {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2500);
        router.refresh(); // updates Navbar initial
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvatar = async (base64: string) => {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: base64 }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to save avatar.");
    }
    dispatchAvatarUpdated();
    router.refresh(); // updates Navbar avatar
  };

  const handleRemoveAvatar = async () => {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: null }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to remove avatar.");
    }
    dispatchAvatarUpdated();
    router.refresh();
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-6">
      <h2 className="text-lg font-bold text-text-primary tracking-tight">Profile</h2>

      <AvatarUpload
        currentImage={image}
        userInitial={userInitial}
        onSave={handleSaveAvatar}
        onRemove={handleRemoveAvatar}
      />

      {/* Name field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-muted">Display Name</label>
        <input
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="w-full max-w-sm px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-accent"
        />
      </div>

      {/* Email (read-only) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-muted">Email</label>
        <p className="text-sm text-text-primary">{email}</p>
        <p className="text-xs text-text-muted">Email cannot be changed.</p>
      </div>

      {/* Member since */}
      <p className="text-xs text-text-muted">Member since {memberSince}</p>

      {error && <p className="text-xs text-expense font-semibold">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {savedMsg && (
          <span className="text-xs text-income font-semibold">Saved ✓</span>
        )}
      </div>
    </div>
  );
}
