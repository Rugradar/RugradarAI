import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RugRadar — AI Meme Token Scanner | Honeypot Detection",
  description:
    "Free AI-powered security scanner for meme tokens on Base, BSC & Solana. Instant honeypot detection, LP lock check, tax analysis, and risk scoring. Scan before you ape.",
  keywords: [
    "rug pull checker",
    "honeypot detector",
    "meme token scanner",
    "crypto security",
    "base token scanner",
    "bsc token scanner",
    "solana token scanner",
    "smart contract audit",
    "defi security",
    "rugradar",
  ],
  icons: { icon: "/favicon.ico" },
  metadataBase: new URL("https://rugradar-ai.vercel.app"),
  openGraph: {
    title: "RugRadar — AI Meme Token Scanner",
    description:
      "Free honeypot detection & security scanner for Base, BSC & Solana tokens. Scan any contract in seconds.",
    url: "https://rugradar-ai.vercel.app",
    siteName: "RugRadar",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "RugRadar — AI-Powered Meme Token Scanner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RugRadar — AI Meme Token Scanner",
    description:
      "Free honeypot detection & security scanner for Base, BSC & Solana. Scan before you ape.",
    images: ["/og.png"],
    creator: "@0xrugradar",
    site: "@0xrugradar",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="scan-line" />
        {children}
      </body>
    </html>
  );
}
