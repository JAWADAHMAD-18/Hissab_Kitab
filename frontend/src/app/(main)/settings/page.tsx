import type { Metadata } from "next";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import User from "@/models/User";
import { ProfileSection } from "@/components/client/ProfileSection";
import { ChangePasswordSection } from "@/components/client/ChangePasswordSection";
import { ExportDataButton } from "@/components/client/ExportDataButton";
import { WhatsAppConnectSection } from "@/components/client/WhatsAppConnectSection";
import { DeleteAccountSection } from "@/components/client/DeleteAccountSection";

export const metadata: Metadata = {
  title: "Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(new mongoose.Types.ObjectId(userId)).lean();

  if (!user) {
    redirect("/login");
  }

  const hasPassword = Boolean(user.password);

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8 lg:py-12 flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <ProfileSection
        name={user.name}
        email={user.email}
        image={user.image || null}
        createdAt={
          user.createdAt
            ? new Date(user.createdAt).toISOString()
            : new Date().toISOString()
        }
      />

      {/* Password — only for credential accounts */}
      {hasPassword && <ChangePasswordSection />}

      {/* WhatsApp linking */}
      <WhatsAppConnectSection
        whatsappNumber={user.whatsappNumber || null}
        whatsappVerified={user.whatsappVerified === true}
        whatsappDisplayNumber={process.env.WHATSAPP_DISPLAY_NUMBER || ""}
      />

      {/* Data & Privacy */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight">Data &amp; Privacy</h2>
          <p className="text-sm text-text-muted mt-1">
            Download a copy of all your income and expense records.
          </p>
        </div>
        <ExportDataButton />
      </div>

      {/* Danger Zone */}
      <DeleteAccountSection />
    </div>
  );
}
