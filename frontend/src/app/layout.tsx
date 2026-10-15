import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/client/Providers";
import { AuthModalProvider } from "@/components/client/AuthModalProvider";
import { TransactionModalProvider } from "@/components/client/TransactionModalProvider";
import { TransactionModal } from "@/components/client/TransactionModal";
import { Navbar } from "@/components/client/Navbar";
import { ServiceWorkerRegister } from "@/components/client/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hisab Kitab — Personal Monthly Finance Tracker",
  description:
    "A personal monthly finance tracker designed for students and salaried employees to log income, track daily expenses, and stay on top of where their paycheck goes.",
  appleWebApp: {
    capable: true,
    title: "Hisab Kitab",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-primary min-h-screen antialiased flex flex-col`}>
        <Providers>
          <AuthModalProvider>
            <TransactionModalProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <TransactionModal />
            </TransactionModalProvider>
          </AuthModalProvider>
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
