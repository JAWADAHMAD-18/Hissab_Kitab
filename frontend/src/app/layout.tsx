import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/client/Providers";
import { AuthModalProvider } from "@/components/client/AuthModalProvider";
import { TransactionModalProvider } from "@/components/client/TransactionModalProvider";
import { TransactionModal } from "@/components/client/TransactionModal";
import { Navbar } from "@/components/client/Navbar";
import { Footer } from "@/components/server/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hisab Kitab — Personal Monthly Finance Tracker",
  description:
    "A personal monthly finance tracker designed for students and salaried employees to log income, track daily expenses, and stay on top of where their paycheck goes.",
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
              <Footer />
              <TransactionModal />
            </TransactionModalProvider>
          </AuthModalProvider>
        </Providers>
      </body>
    </html>
  );
}


