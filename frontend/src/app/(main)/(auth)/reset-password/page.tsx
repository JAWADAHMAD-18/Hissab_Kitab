import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/client/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Hisab Kitab",
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string | string[];
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedParams = await searchParams;
  const rawToken = resolvedParams.token;
  const token = typeof rawToken === "string" ? rawToken : null;

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
