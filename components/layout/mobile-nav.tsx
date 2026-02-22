"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Plus,
  BookBookmark,
  GearSix,
  List,
  X,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/skills/new", label: "New Skill", icon: Plus },
  { href: "/templates", label: "Templates", icon: BookBookmark },
  { href: "/settings", label: "Settings", icon: GearSix },
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
        <List weight="bold" className="w-5 h-5" />
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
                <Sparkle weight="fill" className="w-5 h-5 text-accent" />
                <span className="text-lg font-bold text-text-primary tracking-tight">
                  <span className="font-asgardFat text-accent">SKILL</span>SMITH
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <X weight="bold" className="w-5 h-5" />
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
                    <Icon weight="fill" className="w-4 h-4 shrink-0" />
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
