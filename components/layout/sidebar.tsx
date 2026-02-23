"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  IconLayoutGrid,
  IconPlus,
  IconBookmarkFilled,
  IconSettingsFilled,
  IconInfoCircleFilled,
  IconLogout,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutGrid },
  { href: "/skills/new", label: "New Skill", icon: IconPlus },
  { href: "/templates", label: "Templates", icon: IconBookmarkFilled },
  { href: "/settings", label: "Settings", icon: IconSettingsFilled },
  { href: "/how-it-works", label: "How it Works", icon: IconInfoCircleFilled },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="h-screen sticky top-0 w-64 flex flex-col px-5 py-4">
      {/* Floating glass card */}
      <div className="relative flex flex-col gap-6 w-full rounded-[20px] bg-[rgba(17,17,17,0.45)] backdrop-blur-[4px] py-6 px-5">
        {/* Gradient border overlay — matches landing/auth header */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            padding: 1,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.03))",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        />

        {/* Logo — centered, matching landing/auth pages */}
        <Link href="/dashboard" className="flex items-baseline justify-center">
          <span className="font-asgardFat text-[#bfff00] text-[17px] leading-[1.2]">
            SKILL
          </span>
          <span className="font-asgardFat text-white text-[17px] leading-[1.2]">
            SMITH
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[40px] text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[rgba(191,255,0,0.08)] text-[#bfff00]"
                    : "text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.8)]"
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-[rgba(255,255,255,0.08)]" />

        {/* User actions — icon-only */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={handleSignOut}
            className="p-2 rounded-[40px] text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] transition-colors"
          >
            <IconLogout size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
