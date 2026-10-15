import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/client/Providers";
import { AuthModalProvider } from "@/components/client/AuthModalProvider";
import { TransactionModalProvider } from "@/components/client/TransactionModalProvider";
import { TransactionModal } from "@/components/client/TransactionModal";
import { Navbar } from "@/components/client/Navbar";
import { ServiceWorkerRegister } from "@/components/client/ServiceWorkerRegister";

import { getAppBaseUrl } from "@/lib/appUrl";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  applicationName: "Hisab Kitab",
  title: {
    default: "Hisab Kitab — simple monthly money tracker",
    template: "%s | Hisab Kitab",
  },
  description:
    "Track income and spending. See what's left. A simple monthly money tracker with voice logging and smart budgets.",
  openGraph: {
    title: "Hisab Kitab — simple monthly money tracker",
    description: "Track income and spending. See what's left.",
    siteName: "Hisab Kitab",
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hisab Kitab — simple monthly money tracker",
    description: "Track income and spending. See what's left.",
  },
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
