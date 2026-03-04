import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Palanquin } from "next/font/google";
import localFont from "next/font/local";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const palanquin = Palanquin({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-palanquin",
});

const concretteXL = localFont({
  src: [
    { path: "./fonts/ConcretteXL-TRIAL-Thin.ttf", weight: "100", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "./fonts/ConcretteXL-TRIAL-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "./fonts/ConcretteXL-TRIAL-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-RegularItalic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/ConcretteXL-TRIAL-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "./fonts/ConcretteXL-TRIAL-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "./fonts/ConcretteXL-TRIAL-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "./fonts/ConcretteXL-TRIAL-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "./fonts/ConcretteXL-TRIAL-Heavy.ttf", weight: "900", style: "normal" },
    { path: "./fonts/ConcretteXL-TRIAL-HeavyItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-concrette",
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
  title: "SkillSmith | Craft Skills for your Workflows",
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
        className={`${palanquin.className} ${palanquin.variable} ${concretteXL.variable} ${jetbrains.variable} bg-[#0a0a0a]`}
      >
        <PostHogProvider>{children}</PostHogProvider>
        <Analytics />
        <SpeedInsights />
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src="https://analytics.umami.is/script.js"
            data-website-id="38f21c1a-7561-48ee-8a45-c8d184ca2c96"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
