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
    <div className="max-w-xl mx-auto flex flex-col justify-center min-h-[calc(100vh-10rem)]">
      <div className="text-center mb-6 md:mb-10">
        <h1 className="font-display text-xl md:text-3xl font-bold text-white tracking-tight">
          How it{" "}
          <span className="text-[#bfff00]">Works</span>
        </h1>
        <p className="text-[rgba(255,255,255,0.5)] mt-2 text-base">
          From idea to production-ready skill in four steps.
        </p>
      </div>

      {/* Step indicator dots */}
      <div className="flex items-center justify-center gap-1.5 mb-8">
        {steps.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveStep(i)}
            className="h-1 rounded-full cursor-pointer"
            animate={{
              width: i === activeStep ? 20 : 6,
              backgroundColor:
                i === activeStep ? "#bfff00" : "rgba(255,255,255,0.15)",
            }}
            transition={springTransition}
          />
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
  );
}
