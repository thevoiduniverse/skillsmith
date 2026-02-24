import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const asgardFat = localFont({
  src: "./fonts/AsgardTrial-Fat.ttf",
  variable: "--font-asgard-fat",
  display: "swap",
});

const brockmann = localFont({
  src: "./fonts/brockmann-medium-webfont.woff2",
  variable: "--font-brockmann",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "SkillSMITH — Build, Test & Share Claude Skills",
  description:
    "Create, test, and share custom Claude skills with an AI-assisted editor and testing playground.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${brockmann.className} ${brockmann.variable} ${jetbrains.variable} ${asgardFat.variable} bg-[#0a0a0a]`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
