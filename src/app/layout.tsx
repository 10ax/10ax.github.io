import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Archivo, Geist, Geist_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Starfield } from "@/components/scene/starfield";
import { SkipLink } from "@/components/skip-link";
import { getSiteUrlObject } from "@/lib/site-url";
import { themeInitScript } from "@/lib/theme";

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

// Display face. The `wdth` axis is what lets headlines tighten without a second family.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  axes: ["wdth"],
});

// Micro-labels only, never body copy.
const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: "Francesco Tenace | Full-stack developer",
  description:
    "Senior Full-stack Developer with 5+ years of experience building scalable distributed systems. Java, .NET, Angular, Kubernetes.",
  authors: [{ name: "Francesco Tenace" }],
  openGraph: {
    title: "Francesco Tenace | Full-stack developer",
    description:
      "Senior Full-stack Developer specialized in Java/.NET, distributed systems and DevOps automation.",
    type: "profile",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#08090b" },
  ],
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
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${silkscreen.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before paint so the first frame is already the right theme. Fixed string,
          no interpolation: see `themeInitScript` for why.
          eslint-disable-next-line react/no-danger -- script text, not user input
        */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript() }}
        />
      </head>
      <body
        className="bg-surface text-ink flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <Starfield />
        <div className="grain" aria-hidden="true" />
        <SkipLink />
        <SiteHeader />
        <ViewTransition>{children}</ViewTransition>
        <SiteFooter />
      </body>
    </html>
  );
}
