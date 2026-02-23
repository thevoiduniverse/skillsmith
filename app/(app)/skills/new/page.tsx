"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSparkles,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES } from "@/lib/constants";

/* ─── Constants ────────────────────────────────── */

const CARD_HEIGHT = 420;
const TOTAL_STEPS = 3;

const springTransition = {
  type: "spring" as const,
  stiffness: 170,
  damping: 22,
};

/* ─── Stack positioning ────────────────────────── */

function getStackStyles(cardIndex: number, activeStep: number) {
  const offset = cardIndex - activeStep;

  // Active — front and center, sharp
  if (offset === 0) {
    return { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", zIndex: 30 };
  }
  // +1 behind — peeking below
  if (offset === 1) {
    return { scale: 0.95, y: 40, opacity: 0.7, filter: "blur(0px)", zIndex: 20 };
  }
  // +2 behind — deeper peek
  if (offset === 2) {
    return { scale: 0.9, y: 72, opacity: 0.4, filter: "blur(0px)", zIndex: 10 };
  }
  // Completed — fades out with blur
  return { scale: 0.98, y: 12, opacity: 0, filter: "blur(12px)", zIndex: 40 };
}

const cardTransition = {
  ...springTransition,
  opacity: { duration: 0.3, ease: "easeOut" as const },
  filter: { duration: 0.35, ease: "easeOut" as const },
  zIndex: { duration: 0 },
};

/* ─── Page ─────────────────────────────────────── */

export default function NewSkillPage() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState<"idle" | "generating" | "creating">("idle");
  const [description, setDescription] = useState("");
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ─── Navigation ───────────────────────────── */

  function canProceed(step: number) {
    if (step === 0) return description.trim().length > 0;
    return true;
  }

  function goNext() {
    if (activeStep < TOTAL_STEPS - 1 && canProceed(activeStep)) {
      setActiveStep((s) => s + 1);
    }
  }

  function goBack() {
    if (activeStep > 0) {
      setActiveStep((s) => s - 1);
    }
  }

  /* ─── API handlers ─────────────────────────── */

  async function handleCreateWithAI() {
    if (!description.trim()) return;
    setActiveStep(2);
    setMode("generating");
    setLoading(true);

    try {
      const createRes = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: skillName.trim() || description.slice(0, 60),
          description,
          category,
        }),
      });
      const skill = await createRes.json();

      const draftRes = await fetch("/api/claude/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          name: skillName.trim() || undefined,
          category: category || undefined,
        }),
      });
      const draft = await draftRes.json();

      if (draft.content) {
        await fetch(`/api/skills/${skill.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: draft.content,
            title: draft.parsed?.name || skillName.trim() || description.slice(0, 60),
          }),
        });
      }

      router.push(`/skills/${skill.id}/edit`);
    } catch {
      setMode("idle");
      setLoading(false);
    }
  }

  async function handleCreateBlank() {
    setActiveStep(2);
    setMode("creating");
    setLoading(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: skillName.trim() || "Untitled Skill" }),
      });
      const skill = await res.json();
      router.push(`/skills/${skill.id}/edit`);
    } catch {
      setMode("idle");
      setLoading(false);
    }
  }

  /* ─── Step content renderers ───────────────── */

  function renderStep0() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4">
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.6)]">
            What should this skill do?
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Review code and provide feedback focusing on security vulnerabilities, performance issues, and best practices. Use a constructive tone and provide specific suggestions."
            rows={4}
            className="text-base"
          />
        </div>

        <div className="flex items-center justify-between mt-auto pt-6">
          <button
            onClick={handleCreateBlank}
            disabled={loading}
            className="text-sm text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
          >
            Start from scratch &rarr;
          </button>
          <Button
            onClick={goNext}
            disabled={!canProceed(0)}
            size="md"
          >
            Next
            <IconChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  function renderStep1() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.6)]">
              Skill name
            </label>
            <Input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Leave blank to let AI name it"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.6)]">
              Category
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setCategory(category === cat ? null : cat)
                  }
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                    category === cat
                      ? "bg-[#bfff00] text-[#0a0a0a]"
                      : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-6">
          <Button variant="secondary" onClick={goBack} size="md">
            <IconChevronLeft size={16} />
            Back
          </Button>
          <Button onClick={goNext} size="md">
            Next
            <IconChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="flex flex-col h-full">
        <AnimatePresence mode="wait">
          {mode === "idle" ? (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 space-y-5">
                {/* Summary block */}
                <div className="bg-[rgba(255,255,255,0.05)] rounded-2xl p-4 space-y-2">
                  <p className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed line-clamp-3">
                    {description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-[rgba(255,255,255,0.4)]">
                      {skillName.trim() || "AI will name this"}
                    </span>
                    {category && (
                      <span className="bg-[#bfff00] text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary action */}
                <Button
                  onClick={handleCreateWithAI}
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  <IconSparkles size={16} />
                  Generate with AI
                  <IconArrowRight size={16} />
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[rgba(255,255,255,0.08)]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-[rgba(17,17,17,0.45)] px-3 text-[rgba(255,255,255,0.6)]">
                      or
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCreateBlank}
                  disabled={loading}
                  className="w-full text-center text-sm text-[rgba(255,255,255,0.6)] hover:text-white transition-colors py-1"
                >
                  Start from scratch &rarr;
                </button>
              </div>

              <div className="mt-auto pt-4">
                <Button variant="secondary" onClick={goBack} size="md">
                  <IconChevronLeft size={16} />
                  Back
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="creating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="brand-loader mb-6" />
              <h2 className="text-xl font-medium text-white mb-2">
                {mode === "generating"
                  ? "Generating your skill..."
                  : "Creating your skill..."}
              </h2>
              <p className="text-[rgba(255,255,255,0.6)] text-sm">
                {mode === "generating"
                  ? "Claude is drafting instructions, edge cases, and examples based on your description."
                  : "Setting up your blank skill workspace."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2];

  /* ─── Render ───────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Create a New Skill
        </h1>
        <p className="text-[rgba(255,255,255,0.6)] mt-2">
          Describe what you want Claude to do, and AI will generate a skill for
          you.
        </p>
      </div>

      {/* Step indicator dots */}
      <div
        className="flex items-center justify-center gap-1 mb-8 transition-opacity duration-300"
        style={{ opacity: mode !== "idle" ? 0.3 : 1 }}
      >
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            animate={{
              width: i === activeStep ? 16 : 5,
              backgroundColor:
                i === activeStep
                  ? "#bfff00"
                  : "rgba(255,255,255,0.15)",
            }}
            transition={springTransition}
          />
        ))}
      </div>

      {/* Card stack */}
      <div className="relative" style={{ height: CARD_HEIGHT }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-x-0 top-0 origin-top rounded-[20px]"
            animate={getStackStyles(i, activeStep)}
            transition={cardTransition}
            style={{
              height: CARD_HEIGHT,
              pointerEvents: i === activeStep ? "auto" : "none",
              backdropFilter: i === activeStep ? "blur(80px)" : "none",
              WebkitBackdropFilter: i === activeStep ? "blur(80px)" : "none",
            }}
          >
            <Card className="h-full p-8 flex flex-col overflow-hidden">
              {stepRenderers[i]()}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
