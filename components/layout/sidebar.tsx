"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import {
  IconLayoutGridFilled,
  IconPlus,
  IconBookmarkFilled,
  IconUserFilled,
  IconChartBar,
  IconInfoCircleFilled,
  IconLogout,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { AnimatedLogo } from "@/components/ui/animated-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutGridFilled },
  { href: "/skills/new", label: "New Skill", icon: IconPlus },
  { href: "/templates", label: "Templates", icon: IconBookmarkFilled },
  { href: "/settings", label: "Profile", icon: IconUserFilled },
  { href: "/usage", label: "Usage", icon: IconChartBar },
  { href: "/how-it-works", label: "How it Works", icon: IconInfoCircleFilled },
];

export function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  async function handleSignOut() {
    track("logout");
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <aside className="h-screen sticky top-0 w-64 flex flex-col justify-center px-5 py-4">
      {/* Floating glass card */}
      <div className="relative flex flex-col gap-6 w-full rounded-[32px] bg-gradient-to-b from-[rgba(28,28,28,0.65)] to-[rgba(16,16,16,0.55)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)] py-6 px-5">
        {/* Glass gradient border */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none z-0"
          style={{
            padding: 1,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 50%, transparent)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        />
        {/* Top shine */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none z-0"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
          }}
        />

        {/* Logo — centered, matching landing page S position */}
        <div className="flex justify-center">
          <Link href="/dashboard" className="relative flex items-center -ml-2" style={{ height: 32 }}>
            <div
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: -10 }}
            >
              <AnimatedLogo size={56} />
            </div>
          </Link>
        </div>

        {/* Navigation — segmented control */}
        <LayoutGroup>
          <nav className="flex flex-col gap-1 rounded-[24px] p-1.5 -mx-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-colors z-10",
                    isActive
                      ? "text-[#bfff00]"
                      : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-seg"
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] border border-[rgba(255,255,255,0.02)]"
                      style={{
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.4)",
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <Icon size={18} className="relative z-10 shrink-0" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>

        {/* Divider */}
        <div className="h-px bg-[rgba(255,255,255,0.03)]" />

        {/* User actions — icon-only */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={handleSignOut}
            className="p-2 rounded-[40px] text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <IconLogout size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
