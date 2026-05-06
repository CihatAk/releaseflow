import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "./components/analytics";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ChatBotWrapper from "@/components/chat-bot-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://releaseflow.dev"),
  title: {
    default: "ReleaseFlow - Generate Changelogs from GitHub Commits",
    template: "%s | ReleaseFlow",
  },
  description:
    "Stop wasting hours writing release notes. Connect your GitHub repo and generate beautiful changelogs in seconds. Automatically parses conventional commits.",
  keywords: [
    "changelog generator",
    "github",
    "release notes",
    "conventional commits",
    "developer tools",
    "auto changelog",
  ],
  authors: [{ name: "ReleaseFlow" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://releaseflow.dev",
    siteName: "ReleaseFlow",
    title: "ReleaseFlow - Generate Changelogs from GitHub Commits",
    description:
      "Stop wasting hours writing release notes. Connect your GitHub repo and generate beautiful changelogs in seconds.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ReleaseFlow - Changelog Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReleaseFlow - Generate Changelogs from GitHub Commits",
    description:
      "Stop wasting hours writing release notes. Connect your GitHub repo and generate beautiful changelogs in seconds.",
    images: ["/og-image.svg"],
    creator: "@releaseflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
          <Toaster />
          <ChatBotWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}