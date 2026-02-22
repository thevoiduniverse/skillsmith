import Link from "next/link";

import { DotCanvas } from "@/components/ui/dot-canvas";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      {/* Interactive dot canvas background */}
      <DotCanvas accentColor="#BFFF00" className="fixed inset-0 z-0" showGlow={false} />

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 flex justify-center pt-6 px-4">
        <div className="relative flex items-center justify-center w-full max-w-md h-[84px] bg-[rgba(17,17,17,0.45)] backdrop-blur-2xl rounded-[40px] px-10">
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
          <Link href="/" className="flex items-baseline">
            <span className="font-asgardFat text-[#bfff00] text-[21px] leading-[1.2]">
              SKILL
            </span>
            <span className="font-asgardFat text-white text-[21px] leading-[1.2]">
              SMITH
            </span>
          </Link>
        </div>
      </nav>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4" style={{ minHeight: "calc(100vh - 100px)" }}>
        {children}
      </div>
    </div>
  );
}
