"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSparklesFilled,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconBookmarkFilled,
  IconPlus,
  IconDice3Filled,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TemplateCard } from "@/components/templates/template-card";
import { TransitionText } from "@/components/ui/transition-text";
import { SKILL_CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { track } from "@/lib/analytics";

/* ─── Types ───────────────────────────────────── */

interface Template {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  tags: string[];
  usage_count: number;
  featured: boolean;
  profiles?: { display_name: string } | null;
}

/* ─── Constants ────────────────────────────────── */

const CARD_HEIGHT_DESKTOP = 520;
const CARD_HEIGHT_MOBILE = 460;
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
  const isMobile = useIsMobile();
  const CARD_HEIGHT = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP;

  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState<"idle" | "generating" | "creating">("idle");
  const [description, setDescription] = useState("");
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creationPath, setCreationPath] = useState<"ai" | "template" | "blank">("ai");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [randomising, setRandomising] = useState(false);

  /* ─── Fetch templates when template path selected ─── */

  useEffect(() => {
    if (creationPath !== "template") return;
    setTemplateLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => toast.error("Failed to load templates"))
      .finally(() => setTemplateLoading(false));
  }, [creationPath]);

  /* ─── Navigation ───────────────────────────── */

  function canProceed(step: number) {
    if (step === 0) {
      if (creationPath === "ai") return description.trim().length > 0;
      return true; // blank path always can proceed
    }
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
      // Generate draft FIRST — no DB record yet
      const draftRes = await fetch("/api/claude/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          name: skillName.trim() || undefined,
          category: category || undefined,
        }),
      });
      if (!draftRes.ok) throw new Error("Draft generation failed");
      const draft = await draftRes.json();

      // Now create the skill WITH the content in a single request
      const createRes = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.parsed?.name || skillName.trim() || description.slice(0, 60),
          description,
          category,
          content: draft.content || "",
        }),
      });
      if (!createRes.ok) throw new Error("Skill creation failed");
      const skill = await createRes.json();

      track("skill_created", { method: "ai", category: category ?? undefined });
      router.push(`/skills/${skill.id}/edit`);
    } catch {
      toast.error("Failed to generate skill. Please try again.");
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
        body: JSON.stringify({
          title: skillName.trim() || "Untitled Skill",
          category: category || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const skill = await res.json();
      track("skill_created", { method: "blank", category: category ?? undefined });
      router.push(`/skills/${skill.id}/edit`);
    } catch {
      toast.error("Failed to create skill. Please try again.");
      setMode("idle");
      setLoading(false);
    }
  }

  async function handleRandomiseName() {
    setRandomising(true);
    try {
      const res = await fetch("/api/claude/suggest-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.name) {
        setSkillName(data.name.trim());
        track("skill_name_randomised");
      }
    } catch {
      toast.error("Failed to generate name. Please try again.");
    } finally {
      setRandomising(false);
    }
  }

  /* ─── Step content renderers ───────────────── */

  function renderStep0() {
    return (
      <div className="flex flex-col h-full">
        {/* Path selector tabs */}
        <div className="flex justify-center gap-1 mb-4 md:gap-2 md:mb-6">
          {([
            { key: "ai" as const, label: "AI", labelFull: "Describe with AI", icon: IconSparklesFilled },
            { key: "template" as const, label: "Template", labelFull: "From Template", icon: IconBookmarkFilled },
            { key: "blank" as const, label: "Blank", labelFull: "Start Blank", icon: IconPlus },
          ]).map(({ key, label, labelFull, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setCreationPath(key); track("creation_path_selected", { path: key }); }}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] md:px-4 md:py-2.5 md:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap flex-1 md:flex-1",
                creationPath === key
                  ? "bg-gradient-to-b from-[rgba(191,255,0,0.18)] to-[rgba(191,255,0,0.08)] text-[#bfff00] shadow-[inset_0_1px_0_rgba(191,255,0,0.3),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.4),0_0_12px_rgba(191,255,0,0.08)] border border-[rgba(191,255,0,0.2)]"
                  : "bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.5)] hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)]"
              )}
            >
              <Icon size={14} className="shrink-0" />
              <span className="md:hidden">{label}</span>
              <span className="hidden md:inline">{labelFull}</span>
            </button>
          ))}
        </div>

        {/* Dynamic content based on path */}
        <div className="flex-1 min-h-0 flex flex-col">
          {creationPath === "ai" && (
            <div className="space-y-3">
              <label className="block text-sm text-[rgba(255,255,255,0.6)]">
                What should this skill do?
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Review code and provide feedback focusing on security vulnerabilities, performance issues, and best practices."
                rows={4}
                className="text-base"
              />
            </div>
          )}

          {creationPath === "template" && (
            <div className="flex flex-col flex-1 min-h-0">
              <Input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="text-sm shrink-0"
              />
              <div className="relative flex-1 min-h-0 mt-6 -mb-5 md:-mb-8">
                <div className="h-full overflow-y-auto px-5 md:px-8 -mx-5 md:-mx-8 pb-14">
                  {templateLoading ? (
                    <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">Loading templates...</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {templates
                        .filter((t) =>
                          t.title.toLowerCase().includes(templateSearch.toLowerCase())
                        )
                        .map((t) => (
                          <TemplateCard key={t.id} template={t} compact />
                        ))}
                    </div>
                  )}
                  {!templateLoading && templates.length === 0 && (
                    <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No templates available</p>
                  )}
                </div>
                {/* Gradient fade mask at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(16,16,16,0.9))" }}
                />
              </div>
            </div>
          )}

          {creationPath === "blank" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[rgba(255,255,255,0.5)]">
                You&apos;ll set up the name and category next, then start with a blank editor.
              </p>
            </div>
          )}
        </div>

        {/* Footer — only show Next for AI and Blank paths */}
        {creationPath !== "template" && (
          <div className="flex items-center justify-end mt-auto pt-4">
            <Button onClick={goNext} disabled={!canProceed(0)} size="md">
              Next
              <IconChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  function renderStep1() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm text-[rgba(255,255,255,0.6)]">
              Skill name
            </label>
            <div className="relative">
              <Input
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Leave blank to let AI name it"
                className="pr-24 md:pr-32"
              />
              <button
                onClick={handleRandomiseName}
                disabled={randomising}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-[#bfff00] hover:text-[#d4ff4d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <IconDice3Filled size={14} />
                <span className="hidden sm:inline"><TransitionText active={randomising} idle="Randomise" activeText="Generating..." /></span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[rgba(255,255,255,0.6)]">
              Category
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const isSelecting = category !== cat;
                    setCategory(isSelecting ? cat : null);
                    if (isSelecting) track("category_selected", { category: cat });
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                    category === cat
                      ? "bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)]"
                      : "bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.5)] hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)]"
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
                {creationPath === "blank" ? (
                  <>
                    {/* Description input for blank flow */}
                    <div className="space-y-3">
                      <label className="block text-sm text-[rgba(255,255,255,0.6)]">
                        Describe your skill <span className="text-[rgba(255,255,255,0.3)]">(optional)</span>
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., A code reviewer that focuses on security vulnerabilities..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>

                    {/* Primary: Generate with AI (when description present) or Create Blank */}
                    {description.trim() ? (
                      <Button
                        onClick={handleCreateWithAI}
                        disabled={loading}
                        size="lg"
                        className="w-full"
                      >
                        <IconSparklesFilled size={16} />
                        Generate with AI
                        <IconArrowRight size={16} />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCreateBlank}
                        disabled={loading}
                        size="lg"
                        className="w-full"
                      >
                        <IconPlus size={16} />
                        Create Blank Skill
                        <IconArrowRight size={16} />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Summary block for AI flow */}
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
                    <Button
                      onClick={handleCreateWithAI}
                      disabled={loading}
                      size="lg"
                      className="w-full"
                    >
                      <IconSparklesFilled size={16} />
                      Generate with AI
                      <IconArrowRight size={16} />
                    </Button>
                  </>
                )}
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
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-0 md:py-12">
      {/* Header */}
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">
          Create a New Skill
        </h1>
        <p className="text-[rgba(255,255,255,0.5)] text-base mt-2">
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
              backdropFilter: "blur(80px)",
              WebkitBackdropFilter: "blur(80px)",
            }}
          >
            <Card className="h-full p-5 md:p-8 flex flex-col overflow-hidden !from-[rgba(28,28,28,0.72)] !to-[rgba(16,16,16,0.62)]">
              <div className="absolute inset-0 rounded-[20px] pointer-events-none z-0" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.015), transparent 40%)" }} />
              {stepRenderers[i]()}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
