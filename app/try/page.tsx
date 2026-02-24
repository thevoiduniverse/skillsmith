"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSparkles,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconBookmarkFilled,
  IconPlus,
  IconDice3,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TransitionText } from "@/components/ui/transition-text";
import { SKILL_CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

/* ─── Types ───────────────────────────────────── */

interface Template {
  id: string;
  title: string;
  description: string;
  content: string;
}

/* ─── Constants ────────────────────────────────── */

const CARD_HEIGHT_DESKTOP = 420;
const CARD_HEIGHT_MOBILE = 380;
const TOTAL_STEPS = 3;
const TRY_STORAGE_KEY = "skillsmith-try-skill";

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

export default function TryPage() {
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

  /* ─── localStorage persistence ───────────── */

  function saveToLocal(data: { title: string; content: string; category: string | null; description: string }) {
    localStorage.setItem(TRY_STORAGE_KEY, JSON.stringify(data));
  }

  /* ─── API handlers ─────────────────────────── */

  async function handleCreateWithAI() {
    if (!description.trim()) return;
    setActiveStep(2);
    setMode("generating");
    setLoading(true);

    try {
      const draftRes = await fetch("/api/claude/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          name: skillName.trim() || undefined,
          category: category || undefined,
        }),
      });
      if (!draftRes.ok) {
        const err = await draftRes.json().catch(() => ({}));
        throw new Error(err.error || "Draft generation failed");
      }
      const draft = await draftRes.json();

      const title = draft.parsed?.name || skillName.trim() || description.slice(0, 60);
      saveToLocal({
        title,
        content: draft.content || "",
        category,
        description,
      });

      router.push("/try/edit");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate skill. Please try again.");
      setMode("idle");
      setLoading(false);
    }
  }

  function handleCreateBlank() {
    setActiveStep(2);
    setMode("creating");
    setLoading(true);

    const title = skillName.trim() || "Untitled Skill";
    saveToLocal({
      title,
      content: "",
      category,
      description: "",
    });

    router.push("/try/edit");
  }

  function handleUseTemplate(template: Template) {
    setLoading(true);
    setMode("creating");
    setActiveStep(2);

    saveToLocal({
      title: template.title,
      content: template.content,
      category: null,
      description: template.description || "",
    });

    router.push("/try/edit");
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
        <div className="flex flex-wrap justify-center gap-1.5 mb-4 md:gap-2 md:mb-6">
          {([
            { key: "ai" as const, label: "Describe with AI", icon: IconSparkles },
            { key: "template" as const, label: "From Template", icon: IconBookmarkFilled },
            { key: "blank" as const, label: "Start Blank", icon: IconPlus },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCreationPath(key)}
              className={cn(
                "flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap md:flex-1",
                creationPath === key
                  ? "bg-[rgba(191,255,0,0.12)] text-[#bfff00] border border-[rgba(191,255,0,0.25)]"
                  : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] hover:text-white border border-transparent"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Dynamic content based on path */}
        <div className="flex-1">
          {creationPath === "ai" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[rgba(255,255,255,0.6)]">
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
            <div className="space-y-3">
              <Input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="text-sm"
              />
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {templateLoading ? (
                  <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">Loading templates...</p>
                ) : templates
                    .filter((t) =>
                      t.title.toLowerCase().includes(templateSearch.toLowerCase())
                    )
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleUseTemplate(t)}
                        disabled={loading}
                        className="w-full text-left p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.06)] transition-colors"
                      >
                        <div className="font-medium text-sm text-white">{t.title}</div>
                        <div className="text-xs text-[rgba(255,255,255,0.5)] line-clamp-1 mt-0.5">
                          {t.description}
                        </div>
                      </button>
                    ))}
                {!templateLoading && templates.length === 0 && (
                  <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No templates available</p>
                )}
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.6)]">
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
                <IconDice3 size={14} />
                <span className="hidden sm:inline"><TransitionText active={randomising} idle="Randomise" activeText="Generating..." /></span>
              </button>
            </div>
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
                {creationPath === "blank" ? (
                  <>
                    {/* Description input for blank flow */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[rgba(255,255,255,0.6)]">
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
                        <IconSparkles size={16} />
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
                      <IconSparkles size={16} />
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
  /* Identical to app/(app)/skills/new/page.tsx return JSX */

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-0 md:py-12">
      {/* Header */}
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
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
            <Card className="h-full p-5 md:p-8 flex flex-col overflow-hidden !bg-[#111111]">
              {stepRenderers[i]()}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
