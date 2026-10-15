"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface AvatarUploadProps {
  currentImage: string | null;
  userInitial: string;
  onSave: (base64: string) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export function AvatarUpload({ currentImage, userInitial, onSave, onRemove }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [pendingBase64, setPendingBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError(null);
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const MAX = 200;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      } else {
        if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL("image/jpeg", 0.8);
      setPreview(base64);
      setPendingBase64(base64);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleSave = async () => {
    if (!pendingBase64) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(pendingBase64);
      setPendingBase64(null);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch {
      setError("Failed to save avatar.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setSaving(true);
    setError(null);
    try {
      await onRemove();
      setPreview(null);
      setPendingBase64(null);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch {
      setError("Failed to remove avatar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      {/* Avatar circle / preview */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border hover:border-accent transition-colors cursor-pointer shrink-0 group"
        aria-label="Upload avatar"
      >
        {preview ? (
          <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl">
            {userInitial}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="w-5 h-5 text-white" />
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs font-semibold text-accent hover:underline underline-offset-2 cursor-pointer w-fit"
          >
            Change photo
          </button>
          {preview && onRemove && !pendingBase64 && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="text-xs font-medium text-expense hover:underline underline-offset-2 cursor-pointer w-fit disabled:opacity-50"
            >
              Remove photo
            </button>
          )}
        </div>
        <p className="text-xs text-text-muted">Max 200×200px, JPEG/PNG</p>

        {pendingBase64 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-1 px-3 py-1.5 bg-accent hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer w-fit"
          >
            {saving ? "Saving..." : "Save Photo"}
          </button>
        )}

        {savedMsg && (
          <span className="text-xs text-income font-semibold">Photo updated ✓</span>
        )}
        {error && (
          <span className="text-xs text-expense font-semibold">{error}</span>
        )}
      </div>
    </div>
  );
}
