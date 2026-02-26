"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

import { DotCanvas } from "@/components/ui/dot-canvas";

/* ─── How it Works steps ──────────────────────── */

const HOW_STEPS = [
  {
    number: "01",
    title: "Create a Skill",
    description:
      "Describe what you want Claude to do in plain English. AI generates a complete, structured skill file — instructions, edge cases, and examples.",
  },
  {
    number: "02",
    title: "Edit & Refine",
    description:
      "Shape your skill with a guided editor or drop into raw markdown. AI suggestions help you strengthen every section until it's production-ready.",
  },
  {
    number: "03",
    title: "Test & Validate",
    description:
      "Run prompts side-by-side — with and without your skill. Build test suites and let AI score how well the skill performs against expectations.",
  },
  {
    number: "04",
    title: "Share & Fork",
    description:
      "Publish to the template library for others to discover and fork. Build on the community's best work and make it your own.",
  },
];

const HOW_CARD_HEIGHT = 280;

function getHowStackStyles(cardIndex: number, activeStep: number) {
  const offset = cardIndex - activeStep;
  // Keep opacity at 1 for visible cards so backdrop-filter works correctly
  if (offset === 0) {
    return { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", zIndex: 30 };
  }
  if (offset === 1) {
    return { scale: 0.95, y: 36, opacity: 1, filter: "blur(0px)", zIndex: 20 };
  }
  if (offset === 2) {
    return { scale: 0.9, y: 64, opacity: 1, filter: "blur(0px)", zIndex: 10 };
  }
  if (offset === 3) {
    return { scale: 0.85, y: 84, opacity: 1, filter: "blur(0px)", zIndex: 5 };
  }
  return { scale: 0.98, y: 12, opacity: 0, filter: "blur(12px)", zIndex: 40 };
}

const howCardTransition = {
  type: "spring" as const,
  stiffness: 170,
  damping: 22,
  opacity: { duration: 0.3, ease: "easeOut" as const },
  filter: { duration: 0.35, ease: "easeOut" as const },
  zIndex: { duration: 0 },
};

const cards = [
  {
    title: "Community\nTemplates",
    description:
      "Publish your skills to the template library for anyone to discover. Fork what others have built, remix it, and make it your own.",
    gradient:
      "linear-gradient(135.21deg, rgba(255,255,255,0.5) 0%, rgba(191,255,0,0) 51.08%), linear-gradient(90deg, rgba(191,255,0,0.6) 0%, rgba(191,255,0,0.6) 100%)",
    dark: false,
    image: "/card-share.png",
  },
  {
    title: "One-Line\nBuilder",
    description:
      "Describe what you want in one sentence. Claude generates a complete, structured skill file — then refine it with guided editing or raw markdown.",
    gradient:
      "linear-gradient(135.21deg, rgba(191,255,0,0.2) 0%, rgba(0,0,0,0) 51.08%), linear-gradient(90deg, rgba(25,25,25,0.8) 0%, rgba(25,25,25,0.8) 100%)",
    dark: false,
    image: "/card-editor.png",
  },
  {
    title: "Side-by-Side\nPlayground",
    description:
      "Send the same prompt with and without your skill applied. Compare responses side by side and auto-score against expected behaviour.",
    gradient:
      "linear-gradient(135.21deg, rgba(191,255,0,0.8) 0%, rgba(255,255,255,0) 51.08%), linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 100%)",
    dark: true,
    image: "/card-testing.png",
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
  const [howStep, setHowStep] = useState(0);
  const isMobile = useIsMobile();

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
    <>
      {/* Canvas sits outside the clipping container so it extends behind the iOS notch */}
      <DotCanvas
        accentColor={textColor}
        height={isMobile ? 900 : 1320}
        className="fixed inset-0 z-0"
      />
    <div className="min-h-screen bg-transparent relative overflow-x-clip z-[1]">

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex justify-center pt-[calc(env(safe-area-inset-top,0px)+24px)] px-6">
        <div className="relative flex items-center justify-between w-full max-w-[1160px] bg-[rgba(22,22,22,0.75)] backdrop-blur-2xl rounded-[40px] pl-4 pr-3 py-3 md:pl-10 md:pr-5 md:py-5">
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
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="SkillSmith" className="h-[22px] md:h-[28px] w-auto" />
          </Link>
          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/try"
              className="hidden md:block text-white text-sm font-sans font-medium hover:text-white/80 transition-colors"
            >
              Build now
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] font-sans font-bold text-sm rounded-[40px] px-4 py-2.5 md:px-7 md:py-3 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] hover:brightness-105 transition-all"
            >
              <span className="hidden md:inline">SIGN UP / SIGN IN</span>
              <span className="md:hidden">SIGN UP</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-10 pb-10 md:pt-28 md:pb-20 text-center">
        <h1 className="text-[28px] md:text-[60px] font-sans font-normal text-white leading-[1.15]">
          Build your{" "}
          <span className="font-asgardFat text-[#bfff00]">SKILLS</span> for
          <br />
          <span className="inline-block" style={{ color: textColor }}>
            {displayText}
            <span
              className="inline-block w-[3px] h-[28px] md:h-[50px] align-middle ml-1 rounded-sm"
              style={{ opacity: showCursor ? 1 : 0, backgroundColor: textColor }}
            />
          </span>
        </h1>
        <p className="mt-6 text-base md:text-[20px] text-[rgba(255,255,255,0.6)] leading-[1.6] max-w-2xl mx-auto font-sans">
          Create, test, and share custom SKILL.md files with an AI-assisted
          editor and split-pane testing playground.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5">
          <Link
            href="/explore"
            className="w-full sm:w-auto bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.06)] text-white font-sans font-bold text-sm rounded-[40px] px-6 py-3.5 md:px-10 md:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.4)] hover:from-[rgba(255,255,255,0.12)] hover:to-[rgba(255,255,255,0.04)] transition-all text-center"
          >
            BROWSE TEMPLATES
          </Link>
          <Link
            href="/try"
            className="w-full sm:w-auto bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] font-sans font-bold text-sm rounded-[40px] px-6 py-3.5 md:px-10 md:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] hover:brightness-105 transition-all text-center"
          >
            BUILD NOW
          </Link>
        </div>
      </section>

      {/* Cards section */}
      <section className="relative z-10 pb-20 md:pb-52">
        {isMobile ? (
          /* Mobile: vertical stack, always show description — AI-Assisted Editor first */
          <div className="flex flex-col items-center gap-6 px-5">
            {[cards[1], cards[0], cards[2]].map((card) => (
              <div
                key={card.title}
                className="w-full rounded-[40px] px-6 py-8 flex flex-col overflow-hidden"
                style={{
                  background: card.gradient,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.image} alt="" className="w-[120px] h-[120px] object-contain shrink-0 pointer-events-none" />
                <div className="flex flex-col gap-[11px] mt-auto pt-4">
                  <h3
                    className={`font-sans font-bold text-xl leading-[1.6] whitespace-pre-line ${
                      card.dark ? "text-[#0a0a0a]" : "text-white"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-[14px] leading-[1.6] font-sans ${
                      card.dark
                        ? "text-[rgba(10,10,10,0.6)]"
                        : "text-[rgba(255,255,255,0.6)]"
                    }`}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: absolute positioned with spread animation on hover */
          <div
            className="relative flex items-center justify-center"
            style={{ height: 500 }}
            onMouseEnter={() => setIsSpread(true)}
            onMouseLeave={() => setIsSpread(false)}
          >
            {cards.map((card, i) => {
              const stacked = stackedVariants[i];
              const spread = spreadVariants[i];
              return (
                <motion.div
                  key={card.title}
                  className="absolute w-[420px] h-[460px] rounded-[40px] px-8 py-10 flex flex-col overflow-hidden"
                  style={{
                    background: card.gradient,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: `1px solid rgba(255,255,255,${i === 1 ? 0.04 : 0.08})`,
                    zIndex: stacked.zIndex,
                  }}
                  animate={{
                    rotate: isSpread ? spread.rotate : stacked.rotate,
                    x: isSpread ? spread.x : stacked.x,
                  }}
                  transition={springTransition}
                >
                  {i === 1 && (
                    <>
                      <div
                        className="absolute inset-0 rounded-[40px] pointer-events-none z-0"
                        style={{
                          padding: 1,
                          background: "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.06) 50%, transparent)",
                          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                          WebkitMaskComposite: "xor",
                          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                          maskComposite: "exclude",
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-[40px] pointer-events-none z-0"
                        style={{
                          background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 40%)",
                        }}
                      />
                    </>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt="" className="w-[160px] h-[160px] object-contain shrink-0 pointer-events-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]" />
                  <div className="flex flex-col gap-[11px] mt-auto pt-4">
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
        )}
      </section>

      {/* How it Works */}
      <section className="relative z-10 max-w-xl mx-auto px-6 pb-32">
        <div className="text-center mb-10">
          <h2 className="text-[28px] md:text-[40px] font-sans font-normal text-white leading-[1.15]">
            How it{" "}
            <span className="font-asgardFat text-[#bfff00]">WORKS</span>
          </h2>
          <p className="mt-4 text-[rgba(255,255,255,0.6)] text-base font-sans">
            From idea to production-ready skill in four steps.
          </p>
        </div>

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {HOW_STEPS.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setHowStep(i)}
              className="h-1 rounded-full cursor-pointer"
              animate={{
                width: i === howStep ? 20 : 6,
                backgroundColor:
                  i === howStep ? "#bfff00" : "rgba(255,255,255,0.15)",
              }}
              transition={springTransition}
            />
          ))}
        </div>

        {/* Stacked cards */}
        <div className="relative" style={{ height: HOW_CARD_HEIGHT + 90 }}>
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="absolute inset-x-0 top-0 origin-top rounded-[20px]"
              animate={getHowStackStyles(i, howStep)}
              transition={howCardTransition}
              style={{
                height: HOW_CARD_HEIGHT,
                pointerEvents: i === howStep ? "auto" : "none",
                backdropFilter: "blur(80px)",
                WebkitBackdropFilter: "blur(80px)",
              }}
            >
              <div
                className="relative h-full rounded-[20px] bg-[rgba(22,22,22,0.50)] hover:bg-[rgba(26,26,26,0.6)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px] px-5 py-6 md:px-8 md:py-8 flex flex-col overflow-hidden transition-colors"
              >
                {/* Glass gradient border */}
                <div
                  className="absolute inset-0 rounded-[20px] pointer-events-none z-0"
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
                  className="absolute inset-0 rounded-[20px] pointer-events-none z-0"
                  style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
                  }}
                />
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-mono font-bold text-[#bfff00] opacity-60">
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[rgba(255,255,255,0.6)] text-base leading-[1.7] font-sans flex-1">
                  {step.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="text-xs text-[rgba(255,255,255,0.3)]">
                    Step {i + 1} of {HOW_STEPS.length}
                  </span>
                  <Button
                    onClick={() => setHowStep((s) => (s + 1) % HOW_STEPS.length)}
                    size="md"
                  >
                    {i < HOW_STEPS.length - 1 ? "Next" : "Back to Start"}
                    <IconChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
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
    </>
  );
}
