"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

        {/* Logo — centered */}
        <Link href="/dashboard" className="flex items-center justify-center -mt-5 -mb-8">
          <AnimatedLogo size={120} />
        </Link>

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
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-[rgba(255,100,100,0.5)] hover:text-[rgba(255,100,100,0.8)] transition-colors z-10 w-full"
            >
              <IconLogout size={18} className="relative z-10 shrink-0" />
              <span className="relative z-10">Log out</span>
            </button>
          </nav>
        </LayoutGroup>
      </div>

      {/* Logout confirmation modal — portalled to body */}
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
              {/* Top shine */}
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
    </aside>
  );
}
