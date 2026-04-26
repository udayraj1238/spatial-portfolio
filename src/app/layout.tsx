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
  title: "Spatial Portfolio",
  description: "3D Spatial Portfolio built with Next.js and R3F",
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
