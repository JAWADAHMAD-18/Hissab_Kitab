import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/client/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Hisab Kitab",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
