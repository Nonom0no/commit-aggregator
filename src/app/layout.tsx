import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { FloatingNavbar } from "@/components/layout/FloatingNavbar";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Commit Aggregator",
  description: "Gabungkan commit dari banyak repositori GitHub menjadi satu laporan Markdown rapi",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-rose-50 text-slate-900 antialiased flex flex-col">
        <FloatingNavbar />
        <div className="relative flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}