"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/client/Toast";

interface LoginToastHandlerProps {
  resetSuccess?: boolean;
}

export function LoginToastHandler({ resetSuccess }: LoginToastHandlerProps) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(Boolean(resetSuccess));

  useEffect(() => {
    if (resetSuccess) {
      router.replace("/login");
    }
  }, [resetSuccess, router]);

  if (!showToast) return null;

  return (
    <Toast
      message="Password updated. You can now sign in."
      type="success"
      onClose={() => setShowToast(false)}
    />
  );
}
