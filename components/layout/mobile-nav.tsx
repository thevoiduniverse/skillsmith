"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutGrid,
  IconPlus,
  IconBookmarkFilled,
  IconSettingsFilled,
  IconInfoCircleFilled,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutGrid },
  { href: "/skills/new", label: "New Skill", icon: IconPlus },
  { href: "/templates", label: "Templates", icon: IconBookmarkFilled },
  { href: "/settings", label: "Settings", icon: IconSettingsFilled },
  { href: "/how-it-works", label: "How it Works", icon: IconInfoCircleFilled },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-text-secondary hover:text-text-primary"
      >
        <IconMenu2 size={20} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border z-50 flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="SkillSmith" className="h-[20px] w-auto" />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <IconX size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
