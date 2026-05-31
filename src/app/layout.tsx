import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  ),
  title: "Francesco Tenace — Full-stack Developer",
  description:
    "Senior Full-stack Developer with 5+ years of experience building scalable distributed systems. Java, .NET, Angular, Kubernetes.",
  authors: [{ name: "Francesco Tenace" }],
  openGraph: {
    title: "Francesco Tenace — Full-stack Developer",
    description:
      "Senior Full-stack Developer specialized in Java/.NET, distributed systems and DevOps automation.",
    type: "profile",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
