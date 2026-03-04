"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutGridFilled,
  IconPlus,
  IconBookmarkFilled,
  IconUserFilled,
  IconChartBar,
  IconInfoCircleFilled,
  IconLogout,
} from "@tabler/icons-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import { AnimatedLogo } from "@/components/ui/animated-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutGridFilled },
  { href: "/skills/new", label: "New", icon: IconPlus },
  { href: "/templates", label: "Templates", icon: IconBookmarkFilled },
  { href: "/settings", label: "Profile", icon: IconUserFilled },
  { href: "/usage", label: "Usage", icon: IconChartBar },
  { href: "/how-it-works", label: "Info", icon: IconInfoCircleFilled },
];

export function MobileHeader() {
  const pathname = usePathname();
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleSignOut() {
    track("logout");
    await supabase.auth.signOut();
    window.location.href = "/";
  }

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

        {/* Animated S logo */}
        <Link href="/dashboard" className="relative shrink-0 flex items-center mr-[36px]" style={{ height: 28 }}>
          <div className="absolute top-1/2 -translate-y-1/2" style={{ left: -6 }}>
            <AnimatedLogo size={44} />
          </div>
        </Link>

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
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shrink-0 text-[rgba(255,100,100,0.5)]"
            >
              <IconLogout size={16} className="relative z-10 shrink-0" />
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </LayoutGroup>
      </div>

      {/* Logout confirmation modal */}
      {createPortal(
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xl p-5"
              onClick={() => setShowLogoutConfirm(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="relative rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col bg-gradient-to-b from-[rgba(30,30,30,0.78)] to-[rgba(18,18,18,0.68)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)]"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Glass gradient border */}
                <div
                  className="absolute inset-0 rounded-[32px] pointer-events-none z-0"
                  style={{
                    padding: 1,
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 50%, transparent)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-[32px] pointer-events-none z-0"
                  style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
                  }}
                />

                <div className="px-6 pt-6 pb-3 text-center">
                  <h2 className="font-display text-lg font-semibold text-white mb-1">Log out?</h2>
                  <p className="text-sm text-[rgba(255,255,255,0.5)]">
                    Are you sure you want to log out of SkillSmith?
                  </p>
                </div>

                <div className="flex items-center gap-3 px-6 pb-6 pt-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-[rgba(255,255,255,0.5)] hover:text-white bg-gradient-to-b from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] hover:from-[rgba(255,255,255,0.08)] hover:to-[rgba(255,255,255,0.03)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-b from-[rgba(239,68,68,0.8)] to-[rgba(220,38,38,0.7)] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.4)] hover:brightness-110 transition-all"
                  >
                    Log out
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
}
