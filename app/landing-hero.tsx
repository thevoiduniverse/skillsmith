"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

import { DotCanvas } from "@/components/ui/dot-canvas";
import { SplashScreen } from "@/components/splash-screen";
import { LiquidMetal } from "@paper-design/shaders-react";

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
  if (offset === 0) {
    return { scale: 1, y: 0, opacity: 1, filter: "blur(0px) brightness(1)", zIndex: 30 };
  }
  if (offset === 1) {
    return { scale: 0.95, y: 36, opacity: 1, filter: "blur(0px) brightness(0.85)", zIndex: 20 };
  }
  if (offset === 2) {
    return { scale: 0.9, y: 64, opacity: 1, filter: "blur(0px) brightness(0.7)", zIndex: 10 };
  }
  if (offset === 3) {
    return { scale: 0.85, y: 84, opacity: 1, filter: "blur(0px) brightness(0.55)", zIndex: 5 };
  }
  return { scale: 0.98, y: 12, opacity: 0, filter: "blur(12px) brightness(1)", zIndex: 40 };
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
    image: "/card-share.png?v=2",
  },
  {
    title: "One-Line\nBuilder",
    description:
      "Describe what you want in one sentence. Claude generates a complete, structured skill file — then refine it with guided editing or raw markdown.",
    image: "/card-editor.png?v=2",
  },
  {
    title: "Side-by-Side\nPlayground",
    description:
      "Send the same prompt with and without your skill applied. Compare responses side by side and auto-score against expected behaviour.",
    image: "/card-testing.png?v=2",
  },
];

const stackedVariants = [
  { rotate: 15, x: 0, zIndex: 2 },   // green — middle
  { rotate: 0, x: 0, zIndex: 3 },     // black — front
  { rotate: -15, x: 0, zIndex: 1 },   // white — back
];

const spreadVariants = [
  { rotate: 0, x: -440 },
  { rotate: 0, x: 0 },
  { rotate: 0, x: 440 },
];

const springTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};

const rotatingWords = [
  // AI Tools
  { text: "Claude", color: "#E8855B" },
  { text: "ChatGPT", color: "#10A37F" },
  { text: "Gemini", color: "#4285F4" },
  { text: "Cursor", color: "#00D1FF" },
  { text: "Copilot", color: "#6CC644" },
  { text: "Perplexity", color: "#20B8CD" },
  // SaaS & Tools
  { text: "Google Sheets", color: "#34A853" },
  { text: "Slack", color: "#E01E5A" },
  { text: "Notion", color: "#E0E0E0" },
  { text: "Figma", color: "#A259FF" },
  { text: "Jira", color: "#0052CC" },
  { text: "Linear", color: "#5E6AD2" },
  { text: "Airtable", color: "#18BFFF" },
  { text: "HubSpot", color: "#FF7A59" },
  { text: "Salesforce", color: "#00A1E0" },
  { text: "Excel", color: "#217346" },
  { text: "Zapier", color: "#FF4F00" },
  // Domains
  { text: "Sales", color: "#00A1E0" },
  { text: "Marketing", color: "#FF4081" },
  { text: "Finance", color: "#00C805" },
  { text: "HR", color: "#52C41A" },
  { text: "Legal Review", color: "#8C8CFF" },
  { text: "Customer Support", color: "#00B8D9" },
  { text: "Product", color: "#F57C00" },
  { text: "Engineering", color: "#78909C" },
  { text: "Design", color: "#E040FB" },
  { text: "Operations", color: "#26A69A" },
  // Tasks & Workflows
  { text: "Research", color: "#7B61FF" },
  { text: "Code Review", color: "#F78166" },
  { text: "Data Analysis", color: "#4285F4" },
  { text: "Writing", color: "#FF6B6B" },
  { text: "Copywriting", color: "#F5A623" },
  { text: "SQL Queries", color: "#CC6699" },
  { text: "Summaries", color: "#36CFC9" },
  { text: "Debugging", color: "#FF4D4F" },
  { text: "Documentation", color: "#90A4AE" },
  { text: "Email Drafts", color: "#EA4335" },
  { text: "Proposals", color: "#AB47BC" },
  { text: "Automation", color: "#FFB300" },
  { text: "Reports", color: "#5C6BC0" },
  { text: "Testing", color: "#66BB6A" },
];

export function LandingHero() {
  const [splashDone, setSplashDone] = useState(false);
  const [isSpread, setIsSpread] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [textColor, setTextColor] = useState(rotatingWords[0].color);
  const [showCursor, setShowCursor] = useState(true);
  const [howStep, setHowStep] = useState(0);
  const [logoAnimated, setLogoAnimated] = useState(false);
  const isMobile = useIsMobile();
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  // After 4s from splash completion, transition the nav logo to the animated S
  useEffect(() => {
    if (!splashDone) return;
    const timer = setTimeout(() => setLogoAnimated(true), 4000);
    return () => clearTimeout(timer);
  }, [splashDone]);

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
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      {/* Canvas sits outside the clipping container so it extends behind the iOS notch */}
      <DotCanvas
        accentColor={textColor}
        height={isMobile ? 900 : 1320}
        className="fixed inset-0 z-0"
      />
    <div className="min-h-screen bg-transparent relative overflow-x-clip z-[1]">

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex justify-center pt-[calc(env(safe-area-inset-top,0px)+24px)] px-6">
        <div className="relative flex items-center justify-between w-full max-w-[1160px] bg-gradient-to-b from-[rgba(28,28,28,0.85)] to-[rgba(18,18,18,0.75)] backdrop-blur-2xl rounded-[40px] pl-4 pr-3 py-3 md:pl-10 md:pr-5 md:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_4px_20px_rgba(0,0,0,0.4)]">
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
          <Link href="/" className="relative flex items-center -ml-2 md:-ml-3" style={{ height: isMobile ? 28 : 36 }}>
            {/* Full logo — fades out */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SkillSmith"
              className="h-[34px] md:h-[44px] w-auto transition-all duration-700 ease-out"
              style={{
                opacity: logoAnimated ? 0 : 1,
                filter: logoAnimated ? "blur(12px)" : "blur(0px)",
              }}
            />
            {/* Animated S — fades in, positioned to align with the S in the full logo */}
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-lg overflow-hidden transition-all duration-700 ease-out"
              style={{
                opacity: logoAnimated ? 1 : 0,
                filter: logoAnimated ? "blur(0px)" : "blur(12px)",
                left: isMobile ? -10 : -16,
                width: isMobile ? 56 : 72,
                height: isMobile ? 56 : 72,
                WebkitMaskImage: "url(/logo-shape.svg)",
                maskImage: "url(/logo-shape.svg)",
                WebkitMaskSize: "70% 70%",
                maskSize: "70% 70%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            >
              <LiquidMetal
                width={isMobile ? 56 : 72}
                height={isMobile ? 56 : 72}
                colorBack="#3a5a00"
                colorTint="#d4ff4d"
                image="/logo-shape.svg"
                shape="none"
                repetition={2}
                softness={0.15}
                shiftRed={0.1}
                shiftBlue={0.1}
                distortion={0.1}
                contour={0.6}
                angle={70}
                speed={1}
                scale={0.8}
              />
            </div>
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
              Sign Up
            </Link>
            {process.env.NODE_ENV === "development" && (
              <>
                <Link
                  href="/dashboard"
                  className="text-[rgba(255,255,255,0.3)] text-xs font-mono hover:text-white transition-colors"
                >
                  DEV
                </Link>
                <button
                  onClick={() => setLogoAnimated((v) => !v)}
                  className="text-[rgba(255,255,255,0.3)] text-xs font-mono hover:text-white transition-colors"
                >
                  LOGO
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-10 pb-10 md:pt-20 md:pb-20 text-center">
        <h1 className="text-[36px] md:text-[60px] font-display font-semibold text-white leading-[1.45]">
          Craft your{" "}
          <span
              className="inline-block align-middle relative -top-[8px] md:-top-[10px]"
              style={{
                width: isMobile ? 148 : 230,
                height: isMobile ? 41 : 65,
                WebkitMaskImage: "url(/skills-shape.svg)",
                maskImage: "url(/skills-shape.svg)",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            >
              <LiquidMetal
                width={isMobile ? 148 : 230}
                height={isMobile ? 41 : 65}
                colorBack="#000000"
                colorTint="#ffffff"
                image="/skills-shape.svg"
                shape="none"
                repetition={3}
                softness={0.3}
                shiftRed={0.2}
                shiftBlue={0.2}
                distortion={0.15}
                contour={0.4}
                angle={70}
                speed={0.5}
                scale={1}
              />
            </span>{" "}for
          <br />
          <span className="inline-block" style={{ color: textColor }}>
            {displayText}
            <span
              className="inline-block align-middle ml-1"
              style={{ opacity: showCursor ? 1 : 0, color: textColor }}
            >
              <svg className="w-[3px] h-[28px] md:w-[4px] md:h-[50px]" viewBox="0 0 4 50" fill="currentColor">
                <rect x="0" y="0" width="4" height="2" rx="0.5" />
                <rect x="1" y="2" width="2" height="46" />
                <rect x="0" y="48" width="4" height="2" rx="0.5" />
              </svg>
            </span>
          </span>
        </h1>
        <p className="mt-6 text-base md:text-[20px] text-[rgba(255,255,255,0.6)] leading-[1.6] max-w-2xl mx-auto font-sans">
          Create, test, and share custom SKILL.md files with an AI-assisted
          editor and split-pane testing playground.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-5">
          <Link
            href="/explore"
            className="whitespace-nowrap w-1/2 sm:w-auto bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.06)] text-white font-sans font-bold text-sm rounded-[40px] px-6 py-3.5 md:px-10 md:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.4)] hover:from-[rgba(255,255,255,0.12)] hover:to-[rgba(255,255,255,0.04)] transition-all text-center"
          >
            Browse Templates
          </Link>
          <Link
            href="/try"
            className="whitespace-nowrap w-1/2 sm:w-auto bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] font-sans font-bold text-sm rounded-[40px] px-6 py-3.5 md:px-10 md:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] hover:brightness-105 transition-all text-center"
          >
            Build Now
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
                className="relative w-full rounded-[40px] px-6 py-8 flex flex-col overflow-hidden bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] border border-[rgba(255,255,255,0.02)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)]"
                style={{
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                {/* Glass gradient border */}
                <div
                  className="absolute inset-0 rounded-[40px] pointer-events-none z-0"
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
                  className="absolute inset-0 rounded-[40px] pointer-events-none z-0"
                  style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.image} alt="" className="w-[120px] h-[120px] object-contain shrink-0 pointer-events-none mx-auto" />
                <div className="flex flex-col gap-[11px] mt-auto pt-4 text-center items-center">
                  <h3 className="font-display font-semibold text-xl leading-[1.6] whitespace-pre-line text-white">
                    {card.title}
                  </h3>
                  <p className="text-[14px] leading-[1.6] font-sans text-[rgba(255,255,255,0.6)]">
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
                  className="absolute w-[420px] h-[460px] rounded-[40px] px-8 py-10 flex flex-col overflow-hidden bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] border border-[rgba(255,255,255,0.02)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)]"
                  style={{
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    zIndex: stacked.zIndex,
                  }}
                  animate={{
                    rotate: isSpread ? spread.rotate : stacked.rotate,
                    x: isSpread ? spread.x : stacked.x,
                  }}
                  transition={springTransition}
                >
                  {/* Glass gradient border */}
                  <div
                    className="absolute inset-0 rounded-[40px] pointer-events-none z-0"
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
                    className="absolute inset-0 rounded-[40px] pointer-events-none z-0"
                    style={{
                      background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt="" className="w-[160px] h-[160px] object-contain shrink-0 pointer-events-none mx-auto" />
                  <div className="flex flex-col gap-[11px] mt-auto pt-4 text-center items-center">
                    <h3 className="font-display font-semibold text-[28px] leading-[1.6] whitespace-pre-line text-white">
                      {card.title}
                    </h3>
                    <p className="text-[16px] leading-[1.6] font-sans text-[rgba(255,255,255,0.6)]">
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
          <h2 className="text-[28px] md:text-[40px] font-display font-semibold text-white leading-[1.15]">
            How it{" "}
            <span className="text-[#bfff00]">Works</span>
          </h2>
          <p className="mt-4 text-[rgba(255,255,255,0.6)] text-base font-sans">
            From idea to production-ready skill in four steps.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {HOW_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-0">
              <button onClick={() => setHowStep(i)} className="flex items-center gap-2 cursor-pointer">
                <motion.div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ paddingBottom: 2 }}
                  animate={{
                    backgroundColor: howStep >= i ? "#bfff00" : "rgba(255,255,255,0.08)",
                    color: howStep >= i ? "#0a0a0a" : "rgba(255,255,255,0.3)",
                  }}
                  transition={springTransition}
                >
                  {i + 1}
                </motion.div>
                <motion.span
                  className="text-xs font-medium hidden sm:block"
                  animate={{ color: howStep === i ? "#bfff00" : "rgba(255,255,255,0.3)" }}
                  transition={springTransition}
                >
                  {step.title.split(" ")[0]}
                </motion.span>
              </button>
              {i < HOW_STEPS.length - 1 && (
                <svg width="52" height="16" viewBox="-2 -2 52 16" className="mx-3" fill="none">
                  <path
                    d="M0 6 Q6 0,12 6 Q18 12,24 6 Q30 0,36 6 Q42 12,48 6"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <motion.path
                    d="M0 6 Q6 0,12 6 Q18 12,24 6 Q30 0,36 6 Q42 12,48 6"
                    stroke="#bfff00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: howStep > i ? 1 : 0, opacity: howStep > i ? 1 : 0 }}
                    transition={springTransition}
                  />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Stacked cards */}
        <div className="relative" style={{ height: HOW_CARD_HEIGHT + 90 }}>
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="absolute inset-x-0 top-0 origin-top rounded-[32px] overflow-hidden"
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
                className="relative h-full rounded-[32px] bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] hover:from-[rgba(32,32,32,0.80)] hover:to-[rgba(20,20,20,0.72)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px] px-5 py-6 md:px-8 md:py-8 flex flex-col overflow-hidden transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)]"
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
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-mono font-bold text-[#bfff00] opacity-60">
                    {step.number}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-white">
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
                  {i < HOW_STEPS.length - 1 ? (
                    <Button
                      onClick={() => setHowStep((s) => s + 1)}
                      size="md"
                    >
                      Next
                      <IconChevronRight size={16} />
                    </Button>
                  ) : (
                    <Link
                      href="/try"
                      className="inline-flex items-center justify-center font-bold rounded-[40px] transition-all text-sm px-5 py-2.5 gap-2 bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] hover:from-[#dbff66] hover:to-[#b3f000]"
                    >
                      Let&apos;s start building
                      <IconChevronRight size={16} />
                    </Link>
                  )}
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
