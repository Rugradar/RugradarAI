import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RugRadar — AI Meme Token Scanner",
  description: "AI-powered rug detection on Base, BSC & Solana. Scan before you ape.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="scan-line" />
        {children}
      </body>
    </html>
  );
}
