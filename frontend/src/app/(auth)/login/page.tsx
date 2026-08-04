import { LoginForm } from "@/components/client/LoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
