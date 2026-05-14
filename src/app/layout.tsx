import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Scene from "@/components/canvas/Scene";

export const metadata: Metadata = {
  title: "Uday Raj — AI & Data Science Engineer",
  description: "Portfolio of Uday Raj — B.Tech AI & Data Science at IIITDM Kurnool. Adversarial ML researcher, PaliGemma VLM implementer, Global Top 20 Shell.ai. Ask APEX AI anything about him.",
  keywords: ["Uday Raj", "AI Engineer", "Adversarial Machine Learning", "SegFormer", "PaliGemma", "IIITDM Kurnool", "Portfolio"],
  openGraph: {
    title: "Uday Raj — AI Portfolio",
    description: "Adversarial ML & Multimodal AI Researcher. Global Top 20 Shell.ai.",
    type: "website",
    url: "https://udayraj1238.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div id="dom-root">
          {children}
        </div>
        <div id="canvas-container">
          <Scene />
        </div>
      </body>
    </html>
  );
}
