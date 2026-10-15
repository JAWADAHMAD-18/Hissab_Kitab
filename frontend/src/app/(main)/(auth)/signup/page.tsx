import type { Metadata } from "next";
import { SignupForm } from "@/components/client/SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create your free Hisab Kitab account and start tracking your monthly money.",
};

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
