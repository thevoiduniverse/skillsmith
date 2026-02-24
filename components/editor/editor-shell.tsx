"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceFloppy, IconPlayerPlayFilled, IconShare, IconDownload, IconChevronDown, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEditorSync } from "@/lib/hooks/use-editor-sync";
import type { SkillStructure } from "@/lib/skill-parser/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuidedEditor } from "./guided-mode/guided-editor";
import { MonacoMarkdownEditor } from "./markdown-mode/monaco-editor";
import { AiToolbar } from "./ai-toolbar";
import Link from "next/link";

interface EditorShellProps {
  skillId: string;
  initialContent: string;
  initialTitle: string;
  tryMode?: boolean;
}

const TRY_STORAGE_KEY = "skillsmith-try-skill";

export function EditorShell({ skillId, initialContent, initialTitle, tryMode }: EditorShellProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const structureSnapshot = useRef<SkillStructure | null>(null);

  const {
    structure,
    markdown,
    activeMode,
    isDirty,
    updateStructure,
    updateMarkdown,
    switchMode,
    getCurrentMarkdown,
  } = useEditorSync({
    initialMarkdown: initialContent,
    onAutoSave: async (md) => {
      if (tryMode) {
        saveToLocalStorage(md);
      } else {
        await saveSkill(md);
      }
    },
  });

  function saveToLocalStorage(content?: string) {
    const md = content || getCurrentMarkdown();
    try {
      const existing = JSON.parse(localStorage.getItem(TRY_STORAGE_KEY) || "{}");
      localStorage.setItem(TRY_STORAGE_KEY, JSON.stringify({
        ...existing,
        title,
        content: md,
      }));
    } catch {
      // localStorage may be full or unavailable
    }
  }

  const saveSkill = useCallback(async (content?: string) => {
    if (tryMode) {
      saveToLocalStorage(content);
      return;
    }
    setSaving(true);
    try {
      const md = content || getCurrentMarkdown();
      const res = await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: md }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId, title, getCurrentMarkdown, tryMode]);

  // Cmd+S save handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (tryMode) {
          saveToLocalStorage();
          toast.success("Saved locally");
        } else {
          saveSkill();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSkill, tryMode]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function handleAiDraft() {
    if (!structure.description && !structure.name) return;
    setAiLoading("draft");
    structureSnapshot.current = { ...structure, examples: [...structure.examples] };
    try {
      const res = await fetch("/api/claude/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: structure.description || structure.name,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.content) {
        updateMarkdown(data.content);
        if (data.parsed?.name && !title) {
          setTitle(data.parsed.name);
        }
        toast("AI draft applied", {
          action: {
            label: "Undo",
            onClick: () => {
              if (structureSnapshot.current) {
                updateStructure(() => structureSnapshot.current!);
              }
            },
          },
          duration: 10000,
        });
      }
    } catch {
      toast.error("AI draft generation failed. Please try again.");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleAiSuggest(section: string) {
    setAiLoading(section);
    structureSnapshot.current = { ...structure, examples: [...structure.examples] };
    try {
      const res = await fetch("/api/claude/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillContent: getCurrentMarkdown(),
          section,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.suggestion) {
        updateStructure((prev) => ({
          ...prev,
          [section]: data.suggestion,
        }));
        toast("AI suggestion applied", {
          action: {
            label: "Undo",
            onClick: () => {
              if (structureSnapshot.current) {
                updateStructure(() => structureSnapshot.current!);
              }
            },
          },
          duration: 10000,
        });
      }
    } catch {
      toast.error("AI suggestion failed. Please try again.");
    } finally {
      setAiLoading(null);
    }
  }

  function handleExportMarkdown() {
    const md = getCurrentMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "skill"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  }

  function hasAnyContent() {
    return !!(
      title.trim() ||
      structure.name.trim() ||
      structure.description.trim() ||
      structure.instructions.trim() ||
      structure.edgeCases.trim() ||
      structure.examples.some((e) => e.input.trim() || e.output.trim())
    );
  }

  async function handleDiscard() {
    if (tryMode) {
      localStorage.removeItem(TRY_STORAGE_KEY);
      router.push("/try");
      return;
    }
    try {
      await fetch(`/api/skills/${skillId}`, { method: "DELETE" });
    } catch {
      // Best-effort delete
    }
    router.push("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Try mode banner */}
      {tryMode && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-[rgba(191,255,0,0.08)] border border-[rgba(191,255,0,0.2)] rounded-2xl px-5 py-3">
          <p className="text-sm text-[rgba(255,255,255,0.7)]">
            You&apos;re editing locally.{" "}
            <span className="text-[#bfff00] font-medium">Sign up to save your work permanently.</span>
          </p>
          <Link
            href="/signup"
            className="shrink-0 inline-flex items-center justify-center font-bold rounded-[40px] text-xs px-4 py-2 bg-[#bfff00] text-[#0a0a0a] hover:brightness-110 transition-all"
          >
            Sign Up
          </Link>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Skill"
          className="text-lg font-bold bg-transparent border-none focus:ring-0 px-0 max-w-md"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (hasAnyContent()) {
                setShowDiscardConfirm(true);
              } else {
                handleDiscard();
              }
            }}
            className="text-text-secondary hover:text-error"
          >
            <IconTrash size={14} />
            Discard
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              if (tryMode) {
                saveToLocalStorage();
                toast.success("Saved locally");
              } else {
                await saveSkill();
                router.push("/dashboard");
              }
            }}
            disabled={saving}
          >
            <IconDeviceFloppy size={14} />
            {tryMode
              ? "Save Locally"
              : saving
                ? "Saving..."
                : isDirty
                  ? "Save*"
                  : "Save"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (tryMode) {
                saveToLocalStorage();
                router.push("/try/test");
              } else {
                router.push(`/skills/${skillId}/test`);
              }
            }}
          >
            <IconPlayerPlayFilled size={14} />
            Test
          </Button>
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowExport(!showExport)}
            >
              <IconShare size={14} />
              <IconChevronDown size={12} />
            </Button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-2xl shadow-xl z-20 py-1 min-w-[160px]">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-alt transition-colors flex items-center gap-2"
                  onClick={handleExportMarkdown}
                >
                  <IconDownload size={14} />
                  Export .md
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center border-b border-border mb-4">
        {(["guided", "markdown"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => switchMode(mode)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeMode === mode
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {mode === "guided" ? "Guided" : "Markdown"}
          </button>
        ))}
      </div>

      {/* AI Toolbar */}
      <AiToolbar
        onDraft={handleAiDraft}
        loading={aiLoading}
      />

      {/* Editor content */}
      {activeMode === "guided" ? (
        <div className="max-w-2xl mx-auto">
          <GuidedEditor
            structure={structure}
            onUpdate={updateStructure}
            onAiSuggest={handleAiSuggest}
            aiLoadingSection={aiLoading}
            activeStep={guidedStep}
            onStepChange={setGuidedStep}
            onTest={() => {
              if (tryMode) {
                saveToLocalStorage();
                router.push("/try/test");
              } else {
                saveSkill();
                router.push(`/skills/${skillId}/test`);
              }
            }}
            onEditMarkdown={() => {
              if (!tryMode) saveSkill();
              switchMode("markdown");
            }}
            onDashboard={tryMode ? undefined : async () => {
              await saveSkill();
              router.push("/dashboard");
            }}
          />
        </div>
      ) : (
        <div>
          <MonacoMarkdownEditor value={markdown} onChange={updateMarkdown} />
        </div>
      )}

      {/* Discard confirmation modal */}
      {showDiscardConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDiscardConfirm(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">Discard this skill?</h3>
            <p className="text-sm text-text-secondary mb-6">
              {tryMode
                ? "Your local changes will be permanently lost. This action cannot be undone."
                : "You have unsaved content that will be permanently lost. This action cannot be undone."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDiscard}
                className="bg-error hover:bg-error/80 text-white"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
