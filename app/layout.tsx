import type { Metadata } from "next";
import { Work_Sans, Aleo, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const aleo = Aleo({
  variable: "--font-heading",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StellarEarn",
  description: "Discover bounties, projects, and grants from Stellar DAOs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${aleo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col font-sans text-zinc-950 bg-slate-50/50">
        {/* Ambient Glow Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-[10%] left-[5%] h-[350px] w-[350px] rounded-full bg-[#B7ACE8]/15 blur-[100px] animate-pulse" style={{ animationDuration: "12s" }} />
          <div className="absolute top-[35%] right-[5%] h-[400px] w-[400px] rounded-full bg-[#00A7B5]/12 blur-[120px] animate-pulse" style={{ animationDuration: "16s", animationDelay: "2s" }} />
          <div className="absolute bottom-[30%] left-[10%] h-[380px] w-[380px] rounded-full bg-[#00A7B5]/10 blur-[110px] animate-pulse" style={{ animationDuration: "14s", animationDelay: "1s" }} />
          <div className="absolute bottom-[5%] right-[10%] h-[350px] w-[350px] rounded-full bg-[#B7ACE8]/15 blur-[100px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "3s" }} />
        </div>
        <Header />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
