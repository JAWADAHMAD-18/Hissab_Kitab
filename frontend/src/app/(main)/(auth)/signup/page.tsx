import { SignupForm } from "@/components/client/SignupForm";

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
