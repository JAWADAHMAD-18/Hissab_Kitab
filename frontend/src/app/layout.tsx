import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/client/Providers";
import { Navbar } from "@/components/client/Navbar";

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
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
