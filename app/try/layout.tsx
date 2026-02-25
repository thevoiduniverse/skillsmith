import { ToastProvider } from "@/components/ui/toast-provider";
import Link from "next/link";

export default function TryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-[#0a0a0a]">
      {/* Main content area — mirrors (app) layout structure */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header — glassmorphic sticky nav matching home/explore */}
        <nav className="sticky top-0 z-50 flex justify-center pt-[calc(env(safe-area-inset-top,0px)+24px)] px-6">
          <div className="relative flex items-center justify-between w-full max-w-[1160px] bg-[rgba(22,22,22,0.75)] backdrop-blur-2xl rounded-[40px] pl-4 pr-3 py-3 md:pl-10 md:pr-5 md:py-5">
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
                href="/explore"
                className="hidden md:block text-white text-sm font-sans font-medium hover:text-white/80 transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/signup"
                className="bg-[#bfff00] text-[#0a0a0a] font-sans font-bold text-sm rounded-[40px] px-4 py-2.5 md:px-7 md:py-3 flex items-center justify-center hover:brightness-110 transition-all"
              >
                <span className="hidden md:inline">SIGN UP / SIGN IN</span>
                <span className="md:hidden">SIGN UP</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1 px-4 pt-8 pb-4 md:px-6 md:pt-12 md:pb-6">{children}</main>
      </div>
      <ToastProvider />
    </div>
  );
}
