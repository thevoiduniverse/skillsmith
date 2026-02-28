import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

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

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors mb-8"
          >
            <IconArrowLeft size={14} />
            Back to home
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
