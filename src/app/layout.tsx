import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CustomCursor } from "@/components/CustomCursor";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uday Raj — AI & Data Science Engineer | Portfolio",
  description: "Portfolio of Uday Raj — B.Tech AI & Data Science at IIITDM Kurnool. Ex-Research Intern at SVNIT. Adversarial ML researcher, PaliGemma VLM implementer, Global Top 20 Shell.ai. Ask APEX AI anything about him.",
  keywords: [
    "Uday Raj", "AI Engineer", "Machine Learning", "Adversarial ML",
    "Computer Vision", "SegFormer", "PaliGemma", "Vision-Language Model",
    "IIITDM Kurnool", "SVNIT", "Research Intern", "Portfolio",
    "CourtSense AI", "PyTorch", "Deep Learning", "YOLOv8",
  ],
  authors: [{ name: "Uday Raj", url: "https://github.com/udayraj1238" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Uday Raj — AI & Data Science Portfolio",
    description: "Adversarial ML & Multimodal AI Researcher. Ex-SVNIT Research Intern. Global Top 20 Shell.ai. Interactive 3D portfolio with APEX AI assistant.",
    type: "website",
    url: "https://udayraj1238.vercel.app",
    siteName: "Uday Raj Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Uday Raj — AI & Data Science Engineer",
    description: "Adversarial ML researcher, PaliGemma VLM implementer, Global Top 20 Shell.ai. Ask APEX AI anything.",
  },
};

import { SmoothScroll } from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CustomCursor />
        <SmoothScroll>
          <div id="dom-root">
            {children}
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
