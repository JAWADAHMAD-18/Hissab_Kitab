import type { Metadata } from "next";
import { LoginForm } from "@/components/client/LoginForm";
import { LoginToastHandler } from "@/components/client/LoginToastHandler";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Hisab Kitab account.",
};

interface LoginPageProps {
  searchParams: Promise<{
    reset?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams;
  const isResetSuccess = resolvedParams.reset === "success";

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      {isResetSuccess && <LoginToastHandler resetSuccess={true} />}
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
