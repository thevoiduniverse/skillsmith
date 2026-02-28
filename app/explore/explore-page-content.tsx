"use client";

import Link from "next/link";
import { DotCanvas } from "@/components/ui/dot-canvas";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { ExploreTemplates } from "./explore-templates";

export function ExplorePageContent() {
  const isMobile = useIsMobile();

  return (
    <>
      <DotCanvas
        accentColor="#bfff00"
        height={isMobile ? 900 : 1320}
        className="fixed inset-0 z-0"
      />
      <div className="min-h-screen bg-transparent text-white relative overflow-x-clip z-10">
        <nav className="sticky top-0 z-50 flex justify-center pt-[calc(env(safe-area-inset-top,0px)+24px)] px-6">
          <div className="relative flex items-center justify-between w-full max-w-[1160px] bg-gradient-to-b from-[rgba(28,28,28,0.85)] to-[rgba(18,18,18,0.75)] backdrop-blur-2xl rounded-[40px] pl-4 pr-3 py-3 md:pl-10 md:pr-5 md:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_4px_20px_rgba(0,0,0,0.4)]">
            {/* Gradient border overlay */}
            <div
              className="absolute inset-0 rounded-[40px] pointer-events-none"
              style={{
                padding: 1,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.03))",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
              }}
            />
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SkillSmith" className="h-[22px] md:h-[28px] w-auto" />
            </Link>
            <div className="flex items-center gap-3 md:gap-5">
              <Link
                href="/try"
                className="hidden md:block text-white text-sm font-sans font-medium hover:text-white/80 transition-colors"
              >
                Build now
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] font-sans font-bold text-sm rounded-[40px] px-4 py-2.5 md:px-7 md:py-3 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] hover:brightness-105 transition-all"
              >
                <span className="hidden md:inline">SIGN UP / SIGN IN</span>
                <span className="md:hidden">SIGN UP</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-16">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Templates
            </h1>
            <p className="text-[rgba(255,255,255,0.5)] mt-2 text-base">
              Browse proven skill templates built by the community. Sign up to fork and customize.
            </p>
          </div>

          <ExploreTemplates />
        </main>
      </div>
    </>
  );
}
