"use client";

import { useState } from "react";
import { GlIllustration } from "@/components/ui/gl-illustration";
import { motion } from "framer-motion";

const tabs = [
  { label: "Braces", key: "braces", text: "{ }" },
  { label: "Saturn", key: "saturn", shape: "saturn" },
  { label: "Infinity", key: "infinity", shape: "infinity" },
];

export default function GLPage() {
  const [active, setActive] = useState("braces");
  const activeTab = tabs.find((t) => t.key === active)!;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8">
      {/* Segmented control */}
      <div className="relative flex items-center rounded-full p-1 bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] border border-[rgba(255,255,255,0.02)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.4)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className="relative z-10 px-5 py-2 text-sm font-medium transition-colors"
            style={{
              color: active === tab.key ? "#bfff00" : "rgba(255,255,255,0.4)",
            }}
          >
            {active === tab.key && (
              <motion.div
                layoutId="gl-seg"
                className="absolute inset-0 rounded-full bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] border border-[rgba(255,255,255,0.02)]"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.4)",
                }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <GlIllustration text={activeTab.text} shape={activeTab.shape} className="w-[350px] h-[275px]" />
    </div>
  );
}
