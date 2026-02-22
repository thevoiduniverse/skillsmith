"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { DotCanvas } from "@/components/ui/dot-canvas";

const cards = [
  {
    title: "Share &\nFork",
    description:
      "Send the same prompt with and without your skill applied. Compare responses side by side and auto-score against expected behaviour.",
    gradient:
      "linear-gradient(135.21deg, rgba(255,255,255,0.5) 0%, rgba(191,255,0,0) 51.08%), linear-gradient(90deg, rgba(191,255,0,0.6) 0%, rgba(191,255,0,0.6) 100%)",
    dark: false,
  },
  {
    title: "AI-Assisted\nEditor",
    description:
      "Describe what you want in one sentence. Claude generates a complete, structured skill file - then refine it with guided editing or raw markdown.",
    gradient:
      "linear-gradient(135.21deg, rgba(191,255,0,0.2) 0%, rgba(0,0,0,0) 51.08%), linear-gradient(90deg, rgba(25,25,25,0.8) 0%, rgba(25,25,25,0.8) 100%)",
    dark: false,
  },
  {
    title: "Split-Pane\nTesting",
    description:
      "Send the same prompt with and without your skill applied. Compare responses side by side and auto-score against expected behaviour.",
    gradient:
      "linear-gradient(135.21deg, rgba(191,255,0,0.8) 0%, rgba(255,255,255,0) 51.08%), linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 100%)",
    dark: true,
  },
];

const stackedVariants = [
  { rotate: 15, x: 0, zIndex: 2 },   // green — middle
  { rotate: 0, x: 0, zIndex: 3 },     // black — front
  { rotate: -15, x: 0, zIndex: 1 },   // white — back
];

const spreadVariants = [
  { rotate: 0, x: -460 },
  { rotate: 0, x: 0 },
  { rotate: 0, x: 460 },
];

const springTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};

const rotatingWords = [
  { text: "Claude", color: "#E8855B" },
  { text: "Broking", color: "#00C805" },
  { text: "Google Sheets", color: "#34A853" },
  { text: "Research", color: "#7B61FF" },
  { text: "Code Review", color: "#F78166" },
  { text: "Data Analysis", color: "#4285F4" },
  { text: "Writing", color: "#FF6B6B" },
  { text: "Customer Support", color: "#00B8D9" },
  { text: "Sales", color: "#00A1E0" },
  { text: "Marketing", color: "#FF4081" },
  { text: "Slack", color: "#E01E5A" },
  { text: "Notion", color: "#E0E0E0" },
  { text: "ChatGPT", color: "#10A37F" },
  { text: "Copywriting", color: "#F5A623" },
  { text: "SQL Queries", color: "#CC6699" },
  { text: "Summarisation", color: "#36CFC9" },
  { text: "Legal Review", color: "#8C8CFF" },
  { text: "Figma", color: "#A259FF" },
  { text: "Onboarding", color: "#52C41A" },
  { text: "Debugging", color: "#FF4D4F" },
];

export function LandingHero() {
  const [isSpread, setIsSpread] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [textColor, setTextColor] = useState(rotatingWords[0].color);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let idx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const { text: word, color } = rotatingWords[idx];

      if (!deleting) {
        if (charIdx === 0) {
          setTextColor(color);
        }
        charIdx++;
        setDisplayText(word.slice(0, charIdx));
        if (charIdx === word.length) {
          timeout = setTimeout(() => { deleting = true; tick(); }, 1500);
          return;
        }
        timeout = setTimeout(tick, 80 + Math.random() * 40);
      } else {
        charIdx--;
        setDisplayText(word.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          idx = (idx + 1) % rotatingWords.length;
          timeout = setTimeout(tick, 300);
          return;
        }
        timeout = setTimeout(tick, 40);
      }
    };

    tick();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-x-clip">
      <DotCanvas
        accentColor={textColor}
        height={1320}
        className="absolute inset-0"
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex justify-center pt-6 px-6">
        <div className="relative flex items-center justify-between w-full max-w-[1160px] bg-[rgba(17,17,17,0.45)] backdrop-blur-2xl rounded-[40px] pl-10 pr-5 py-5">
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
          <Link href="/" className="flex items-baseline">
            <span className="font-asgardFat text-[#bfff00] text-[21px] leading-[1.2]">
              SKILL
            </span>
            <span className="font-asgardFat text-white text-[21px] leading-[1.2]">
              SMITH
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-white text-sm font-sans hover:text-white/80 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[#bfff00] text-[#0a0a0a] font-sans font-bold text-sm rounded-[40px] p-3 flex items-center justify-center hover:brightness-110 transition-all"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
        <h1 className="text-[60px] font-sans font-normal text-white leading-[1.15]">
          Build your{" "}
          <span className="font-asgardFat text-[#bfff00]">SKILLS</span> for
          <br />
          <span className="inline-block" style={{ color: textColor }}>
            {displayText}
            <span
              className="inline-block w-[3px] h-[50px] align-middle ml-1 rounded-sm"
              style={{ opacity: showCursor ? 1 : 0, backgroundColor: textColor }}
            />
          </span>
        </h1>
        <p className="mt-6 text-[20px] text-[rgba(255,255,255,0.6)] leading-[1.6] max-w-2xl mx-auto font-sans">
          Create, test, and share custom SKILL.md files with an AI-assisted
          editor and split-pane testing playground.
        </p>
        <div className="mt-10 flex items-center justify-center gap-5">
          <Link
            href="/templates"
            className="relative bg-[rgba(17,17,17,0.9)] backdrop-blur-2xl text-white font-sans font-bold text-sm rounded-[40px] px-10 py-5 hover:bg-[rgba(30,30,30,0.9)] transition-colors"
          >
            <div
              className="absolute inset-0 rounded-[40px] pointer-events-none"
              style={{
                padding: 1,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.03))",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
              }}
            />
            BROWSE TEMPLATES
          </Link>
          <Link
            href="/signup"
            className="relative bg-[rgba(191,255,0,0.2)] backdrop-blur-2xl text-[#bfff00] font-sans font-bold text-sm rounded-[40px] px-10 py-5 hover:bg-[rgba(191,255,0,0.3)] transition-colors"
          >
            <div
              className="absolute inset-0 rounded-[40px] pointer-events-none"
              style={{
                padding: 1,
                background: "linear-gradient(to bottom, rgba(191,255,0,0.4), rgba(191,255,0,0.05))",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
              }}
            />
            GET STARTED
          </Link>
        </div>
      </section>

      {/* Cards section */}
      <section className="relative z-10 pb-32">
        <div
          className="relative flex items-center justify-center"
          style={{ height: 440 }}
          onMouseEnter={() => setIsSpread(true)}
          onMouseLeave={() => setIsSpread(false)}
        >
          {cards.map((card, i) => {
            const stacked = stackedVariants[i];
            const spread = spreadVariants[i];
            return (
              <motion.div
                key={card.title}
                className="absolute w-[420px] h-[400px] rounded-[40px] px-8 py-10 flex flex-col gap-8"
                style={{
                  background: card.gradient,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  zIndex: stacked.zIndex,
                }}
                animate={{
                  rotate: isSpread ? spread.rotate : stacked.rotate,
                  x: isSpread ? spread.x : stacked.x,
                }}
                transition={springTransition}
              >
                {/* Placeholder icon */}
                <div className="w-[94px] h-[94px] bg-white/10 shrink-0" />
                <div className="flex flex-col gap-[11px]">
                  <h3
                    className={`font-sans font-bold text-[28px] leading-[1.6] whitespace-pre-line ${
                      card.dark ? "text-[#0a0a0a]" : "text-white"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-[16px] leading-[1.6] font-sans ${
                      card.dark
                        ? "text-[rgba(10,10,10,0.6)]"
                        : "text-[rgba(255,255,255,0.6)]"
                    }`}
                  >
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#2a2a2a] py-8 text-center">
        <p className="text-[rgba(255,255,255,0.6)] text-sm font-sans">
          Built for{" "}
          <span className="font-bold text-[#cb8058]">Claude</span> by makers
          who care about the craft
        </p>
      </footer>
    </div>
  );
}
