"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutGridFilled,
  IconPlus,
  IconBookmarkFilled,
  IconSettingsFilled,
  IconInfoCircleFilled,
} from "@tabler/icons-react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutGridFilled },
  { href: "/skills/new", label: "New", icon: IconPlus },
  { href: "/templates", label: "Templates", icon: IconBookmarkFilled },
  { href: "/settings", label: "Settings", icon: IconSettingsFilled },
  { href: "/how-it-works", label: "Info", icon: IconInfoCircleFilled },
];

export function MobileHeader() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [checkScroll]);

  const maskImage = useMemo(() => {
    if (canScrollLeft && canScrollRight) {
      return "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)";
    }
    if (canScrollLeft) {
      return "linear-gradient(to right, transparent, black 20px)";
    }
    if (canScrollRight) {
      return "linear-gradient(to right, black calc(100% - 20px), transparent)";
    }
    return "none";
  }, [canScrollLeft, canScrollRight]);

  return (
    <nav className="sticky top-0 z-50 flex justify-center pt-[calc(env(safe-area-inset-top,0px)+20px)] px-4 md:hidden">
      <div className="relative flex items-center w-full bg-gradient-to-b from-[rgba(28,28,28,0.85)] to-[rgba(18,18,18,0.75)] backdrop-blur-2xl rounded-[40px] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden">
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

        {/* Scrollable nav tabs with CSS mask fade */}
        <LayoutGroup>
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-0.5 overflow-x-auto w-full"
            style={{
              maskImage,
              WebkitMaskImage: maskImage,
            }}
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shrink-0",
                    isActive
                      ? "text-[#bfff00]"
                      : "text-[rgba(255,255,255,0.45)]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-tab"
                      className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.06)]"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.3)",
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <Icon size={16} className="relative z-10 shrink-0" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </nav>
  );
}
