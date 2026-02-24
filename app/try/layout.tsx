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
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 min-h-[56px] py-2 border-b border-border pt-[calc(env(safe-area-inset-top,0px)+8px)]">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              <span className="hidden sm:inline">Back to home</span>
            </Link>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SkillSmith" className="h-[20px] md:h-[24px] w-auto" />
            </Link>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center font-bold rounded-[40px] text-xs px-4 py-2 bg-accent text-[#0a0a0a] hover:brightness-110 transition-all whitespace-nowrap"
          >
            Sign Up Free
          </Link>
        </div>

        <main className="flex-1 px-4 pt-8 pb-4 md:px-6 md:pt-12 md:pb-6">{children}</main>
      </div>
      <ToastProvider />
    </div>
  );
}
