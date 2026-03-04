"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  IconSparklesFilled,
  IconPencil,
  IconTestPipe,
  IconWorld,
  IconArrowRight,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Create a Skill",
    description:
      "Describe what you want Claude to do and let AI generate a complete skill draft. Or start from a template, or build from scratch.",
    icon: IconSparklesFilled,
    details: [
      "Describe your use case in plain English",
      "AI generates instructions, edge cases & examples",
      "Choose a category to organize your work",
    ],
  },
  {
    number: "02",
    title: "Edit & Refine",
    description:
      "Shape your skill with a guided editor or drop into raw markdown. AI suggestions help you strengthen each section.",
    icon: IconPencil,
    details: [
      "Guided mode: structured form for each section",
      "Markdown mode: full control with Monaco editor",
      "AI-powered suggestions per section",
    ],
  },
  {
    number: "03",
    title: "Test & Validate",
    description:
      "Run prompts side-by-side — with and without your skill applied. Build test suites to measure quality automatically.",
    icon: IconTestPipe,
    details: [
      "Split-pane comparison of Claude responses",
      "Create test cases with expected behavior",
      "AI scoring tells you how well the skill performs",
    ],
  },
  {
    number: "04",
    title: "Share & Fork",
    description:
      "Publish skills to the template library for others to discover and fork. Build on the community's work.",
    icon: IconWorld,
    details: [
      "Toggle between private and public",
      "Public skills appear in the template library",
      "Fork any template and make it your own",
    ],
  },
];

const usageSteps = [
  {
    title: "Copy Your Skill",
    description:
      "Hit the copy button on any skill to grab its full markdown prompt, ready to paste anywhere.",
  },
  {
    title: "Add to Claude Projects",
    description:
      "Paste the skill into a Claude Project as a custom instruction. Every conversation in that project will use it automatically.",
  },
  {
    title: "Use via the API",
    description:
      "Pass the skill as a system prompt in the Anthropic API or any tool that supports custom system instructions.",
  },
];

const CARD_HEIGHT = 340;

function getStackStyles(cardIndex: number, activeStep: number) {
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

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const cardTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
  mass: 0.8,
};

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="max-w-xl mx-auto flex flex-col justify-center min-h-[calc(100vh-10rem)] gap-3 pt-8">
      <div>
      <div className="text-center mb-6">
        <h1 className="font-display text-xl md:text-3xl font-bold text-white">
          How it{" "}
          <span className="text-[#bfff00]">Works</span>
        </h1>
        <p className="text-[rgba(255,255,255,0.5)] mt-2 text-base">
          From idea to production-ready skill in four steps.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-0">
            <button onClick={() => setActiveStep(i)} className="flex items-center gap-2 cursor-pointer">
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ paddingBottom: 2 }}
                animate={{
                  backgroundColor: activeStep >= i ? "#bfff00" : "rgba(255,255,255,0.08)",
                  color: activeStep >= i ? "#0a0a0a" : "rgba(255,255,255,0.3)",
                }}
                transition={springTransition}
              >
                {i + 1}
              </motion.div>
              <motion.span
                className="text-xs font-medium hidden sm:block"
                animate={{ color: activeStep === i ? "#bfff00" : "rgba(255,255,255,0.3)" }}
                transition={springTransition}
              >
                {step.title.split(" ")[0]}
              </motion.span>
            </button>
            {i < steps.length - 1 && (
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
                  animate={{ pathLength: activeStep > i ? 1 : 0, opacity: activeStep > i ? 1 : 0 }}
                  transition={springTransition}
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Stacked cards */}
      <div className="relative" style={{ height: CARD_HEIGHT + 90 }}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              className="absolute inset-x-0 top-0 origin-top rounded-[32px] overflow-hidden"
              animate={getStackStyles(i, activeStep)}
              transition={cardTransition}
              style={{
                height: CARD_HEIGHT,
                pointerEvents: i === activeStep ? "auto" : "none",
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

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono font-bold text-[#bfff00] opacity-60">
                    {step.number}
                  </span>
                  <Icon size={16} className="text-[rgba(255,255,255,0.6)]" />
                  <h3 className="font-display text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                <ul className="space-y-2 mb-auto">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-[rgba(255,255,255,0.5)]"
                    >
                      <IconArrowRight
                        size={14}
                        className="shrink-0 mt-[3px] text-[#bfff00] opacity-50"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="text-xs text-[rgba(255,255,255,0.3)]">
                    Step {i + 1} of {steps.length}
                  </span>
                  {i < steps.length - 1 && (
                    <Button
                      onClick={() => setActiveStep((s) => s + 1)}
                      size="md"
                    >
                      Next
                      <IconChevronRight size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>

      {/* Using your skill */}
      <div>
        <div className="text-center mb-6 md:mb-10">
          <h2 className="font-display text-xl md:text-3xl font-bold text-white">
            Using Your{" "}
            <span className="text-[#bfff00]">Skill</span>
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] mt-2 text-base">
            Once generated, here&apos;s how to put it to work.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {usageSteps.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-[20px] overflow-hidden bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)] px-5 py-5 md:px-7 md:py-6"
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

                <div className="relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-[#bfff00] opacity-60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-base font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
