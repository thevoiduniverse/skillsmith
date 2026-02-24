"use client";

import { motion } from "framer-motion";
import { IconPlus, IconChevronLeft, IconChevronRight, IconSparkles, IconCircleCheckFilled, IconPlayerPlayFilled, IconDice3 } from "@tabler/icons-react";
import { type SkillStructure } from "@/lib/skill-parser/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TransitionText } from "@/components/ui/transition-text";
import { Card } from "@/components/ui/card";
import { ExamplePair } from "./example-pair";

/* ─── Constants ────────────────────────────────── */

const CARD_HEIGHT = 480;
const TOTAL_STEPS = 5;

const springTransition = {
  type: "spring" as const,
  stiffness: 170,
  damping: 22,
};

function getStackStyles(cardIndex: number, activeStep: number) {
  const offset = cardIndex - activeStep;

  if (offset === 0) {
    return { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", zIndex: 30 };
  }
  if (offset === 1) {
    return { scale: 0.95, y: 40, opacity: 0.7, filter: "blur(0px)", zIndex: 20 };
  }
  if (offset === 2) {
    return { scale: 0.9, y: 72, opacity: 0.4, filter: "blur(0px)", zIndex: 10 };
  }
  if (offset >= 3) {
    return { scale: 0.85, y: 96, opacity: 0.2, filter: "blur(0px)", zIndex: 0 };
  }
  // Completed
  return { scale: 0.98, y: 12, opacity: 0, filter: "blur(12px)", zIndex: 40 };
}

const cardTransition = {
  ...springTransition,
  opacity: { duration: 0.3, ease: "easeOut" as const },
  filter: { duration: 0.35, ease: "easeOut" as const },
  zIndex: { duration: 0 },
};

const stepLabels = ["Identity", "Instructions", "Edge Cases", "Examples", "Done"];

/* ─── Component ────────────────────────────────── */

interface GuidedEditorProps {
  structure: SkillStructure;
  onUpdate: (updater: (prev: SkillStructure) => SkillStructure) => void;
  onAiSuggest?: (section: string) => void;
  aiLoadingSection?: string | null;
  activeStep: number;
  onStepChange: (step: number) => void;
  onTest?: () => void;
  onEditMarkdown?: () => void;
  onDashboard?: () => void;
}

export function GuidedEditor({
  structure,
  onUpdate,
  onAiSuggest,
  aiLoadingSection,
  activeStep,
  onStepChange,
  onTest,
  onEditMarkdown,
  onDashboard,
}: GuidedEditorProps) {
  function goNext() {
    if (activeStep < TOTAL_STEPS - 1) onStepChange(activeStep + 1);
  }

  function goBack() {
    if (activeStep > 0) onStepChange(activeStep - 1);
  }

  /* ─── Step renderers ───────────────────────── */

  function renderStep0() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <Label>Skill Name</Label>
            <div className="relative">
              <Input
                value={structure.name}
                onChange={(e) =>
                  onUpdate((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Code Reviewer, Email Writer..."
                className="pr-32"
              />
              {onAiSuggest && (
                <button
                  onClick={() => onAiSuggest("name")}
                  disabled={aiLoadingSection === "name" || !structure.description.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-[#bfff00] hover:text-[#d4ff4d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <IconDice3 size={14} />
                  <TransitionText active={aiLoadingSection === "name"} idle="Randomise" activeText="Generating..." />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <Label>Trigger Description</Label>
                <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">
                  When should this skill activate?
                </p>
              </div>
            </div>
            <Textarea
              value={structure.description}
              onChange={(e) =>
                onUpdate((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="e.g., Use when the user asks for a code review on a pull request..."
              rows={3}
              className="text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-end mt-auto pt-6">
          <Button onClick={goNext} size="md">
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
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <Label>Instructions</Label>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">
                What should Claude do when this skill is active?
              </p>
            </div>
            {onAiSuggest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAiSuggest("instructions")}
                disabled={aiLoadingSection === "instructions"}
                className="shrink-0 text-[#bfff00]"
              >
                <IconSparkles size={14} />
                <TransitionText active={aiLoadingSection === "instructions"} idle="AI Suggest" activeText="Thinking..." />
              </Button>
            )}
          </div>
          <Textarea
            value={structure.instructions}
            onChange={(e) =>
              onUpdate((prev) => ({ ...prev, instructions: e.target.value }))
            }
            placeholder="Describe the behavior, tone, format, and any rules Claude should follow..."
            rows={8}
            className="text-sm"
          />
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
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <Label>Edge Cases</Label>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">
                What tricky situations should Claude handle? What should it avoid?
              </p>
            </div>
            {onAiSuggest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAiSuggest("edgeCases")}
                disabled={aiLoadingSection === "edgeCases"}
                className="shrink-0 text-[#bfff00]"
              >
                <IconSparkles size={14} />
                <TransitionText active={aiLoadingSection === "edgeCases"} idle="AI Suggest" activeText="Thinking..." />
              </Button>
            )}
          </div>
          <Textarea
            value={structure.edgeCases}
            onChange={(e) =>
              onUpdate((prev) => ({ ...prev, edgeCases: e.target.value }))
            }
            placeholder="List edge cases, things to watch out for, or behaviors to avoid..."
            rows={8}
            className="text-sm"
          />
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

  function renderStep3() {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Examples</Label>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">
                Show Claude what good input/output looks like
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                onUpdate((prev) => ({
                  ...prev,
                  examples: [...prev.examples, { input: "", output: "" }],
                }))
              }
            >
              <IconPlus size={14} />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {structure.examples.map((example, i) => (
              <ExamplePair
                key={i}
                index={i}
                input={example.input}
                output={example.output}
                onInputChange={(val) =>
                  onUpdate((prev) => ({
                    ...prev,
                    examples: prev.examples.map((ex, j) =>
                      j === i ? { ...ex, input: val } : ex
                    ),
                  }))
                }
                onOutputChange={(val) =>
                  onUpdate((prev) => ({
                    ...prev,
                    examples: prev.examples.map((ex, j) =>
                      j === i ? { ...ex, output: val } : ex
                    ),
                  }))
                }
                onRemove={() =>
                  onUpdate((prev) => ({
                    ...prev,
                    examples: prev.examples.filter((_, j) => j !== i),
                  }))
                }
              />
            ))}
            {structure.examples.length === 0 && (
              <div className="text-center py-8 text-[rgba(255,255,255,0.4)] text-sm border border-dashed border-[rgba(255,255,255,0.08)] rounded-2xl">
                No examples yet. Add one to help Claude understand the expected behavior.
              </div>
            )}
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

  function renderStep4() {
    const exampleCount = structure.examples.filter(
      (ex) => ex.input.trim() || ex.output.trim()
    ).length;
    const hasInstructions = structure.instructions.trim().length > 0;
    const hasEdgeCases = structure.edgeCases.trim().length > 0;

    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[rgba(191,255,0,0.12)] flex items-center justify-center">
            <IconCircleCheckFilled size={32} className="text-[#bfff00]" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            Your skill is ready!
          </h2>
          <p className="text-sm text-text-secondary max-w-sm">
            {structure.name ? (
              <>
                <span className="font-medium text-text-primary">{structure.name}</span>
                {" is ready to go. "}
              </>
            ) : (
              "Your skill is ready to go. "
            )}
            {(() => {
              const parts: string[] = [];
              if (hasInstructions) parts.push("instructions");
              if (hasEdgeCases) parts.push("edge cases");
              if (exampleCount > 0) parts.push(`${exampleCount} example${exampleCount !== 1 ? "s" : ""}`);
              return parts.length > 0
                ? `Includes ${parts.join(", ")}.`
                : "Add content in the editor to get started.";
            })()}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs mt-auto pt-6">
          {onTest && (
            <Button onClick={onTest} size="md" className="w-full">
              <IconPlayerPlayFilled size={16} />
              Test it
            </Button>
          )}
          {onEditMarkdown && (
            <Button
              variant="secondary"
              onClick={onEditMarkdown}
              size="md"
              className="w-full"
            >
              Edit Markdown
            </Button>
          )}
          {onDashboard && (
            <Button
              variant="secondary"
              onClick={onDashboard}
              size="md"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  /* ─── Render ───────────────────────────────── */

  return (
    <div>
      {/* Step indicator dots */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            animate={{
              width: i === activeStep ? 16 : 5,
              backgroundColor:
                i === activeStep ? "#bfff00" : "rgba(255,255,255,0.15)",
            }}
            transition={springTransition}
          />
        ))}
        <span className="ml-3 text-xs text-[rgba(255,255,255,0.4)]">
          {stepLabels[activeStep]}
        </span>
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
