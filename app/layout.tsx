import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
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

const rebond = localFont({
  src: [
    { path: "./fonts/ESRebondGrotesqueTrial-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/ESRebondGrotesqueTrial-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/ESRebondGrotesqueTrial-Semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/ESRebondGrotesqueTrial-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/ESRebondGrotesqueTrial-Extrabold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-rebond",
  display: "swap",
});

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
        className={`${rebond.className} ${rebond.variable} ${jetbrains.variable} ${asgardFat.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
