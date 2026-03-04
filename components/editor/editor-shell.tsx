"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceFloppy, IconPlayerPlayFilled, IconDownload, IconChevronDown, IconTrashFilled, IconTerminal2, IconCheck, IconWorld, IconLockFilled, IconSparklesFilled, IconWand, IconCode } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEditorSync } from "@/lib/hooks/use-editor-sync";
import type { SkillStructure } from "@/lib/skill-parser/schema";
import { Button } from "@/components/ui/button";
import { GuidedEditor } from "./guided-mode/guided-editor";
import { MonacoMarkdownEditor } from "./markdown-mode/monaco-editor";
import { TransitionText } from "@/components/ui/transition-text";

import { track } from "@/lib/analytics";

interface EditorShellProps {
  skillId: string;
  initialContent: string;
  initialTitle: string;
  initialVisibility?: string;
  tryMode?: boolean;
}

const TRY_STORAGE_KEY = "skillsmith-try-skill";

export function EditorShell({ skillId, initialContent, initialTitle, initialVisibility, tryMode }: EditorShellProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [visibility, setVisibility] = useState(initialVisibility || "private");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [hasBeenDrafted, setHasBeenDrafted] = useState(!!initialContent.trim());
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
    track("ai_draft_triggered");
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
        setHasBeenDrafted(true);
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
    track("ai_suggest_triggered", { section });
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
    track("skill_exported");
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

  async function handleToggleVisibility() {
    if (tryMode) return;
    const newVisibility = visibility === "public" ? "private" : "public";
    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility }),
      });
      if (!res.ok) throw new Error();
      setVisibility(newVisibility);
      track("visibility_toggled", { visibility: newVisibility });
      toast.success(newVisibility === "public" ? "Skill is now public" : "Skill is now private");
    } catch {
      toast.error("Failed to update visibility");
    }
  }

  function handleCopyInstallCommand() {
    if (visibility !== "public") {
      toast.error("Make your skill public first — private skills can't be installed via curl.");
      setShowExport(false);
      return;
    }
    const filename = (title || "skill")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const command = `curl -sL ${window.location.origin}/api/skills/${skillId}/raw -o .claude/skills/${filename}.md`;
    navigator.clipboard.writeText(command);
    track("install_command_copied");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
    setShowExport(false);
    toast.success("Install command copied to clipboard");
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
    track("skill_deleted");
    try {
      await fetch(`/api/skills/${skillId}`, { method: "DELETE" });
    } catch {
      // Best-effort delete
    }
    router.push("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Centered hero title */}
      <div className="mb-3 md:mb-4 text-center">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Skill"
          className="w-full text-center font-display text-xl md:text-3xl font-bold bg-transparent border-none outline-none text-white placeholder:text-[rgba(255,255,255,0.25)] focus:outline-none"
        />
      </div>

      {/* Mode segmented control */}
      <div className="flex justify-center pb-4">
        <div className="relative flex items-center bg-[rgba(0,0,0,0.3)] rounded-full p-1">
          {(["guided", "markdown"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                switchMode(mode);
                track("editor_mode_switched", { mode });
              }}
              className={cn(
                "relative flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-colors z-10",
                activeMode === mode
                  ? "text-[#bfff00]"
                  : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
              )}
            >
              {activeMode === mode && (
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] border border-[rgba(255,255,255,0.02)]"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.4)",
                  }}
                />
              )}
              {mode === "markdown" && <IconCode size={13} className="relative z-10" />}
              <span className="relative z-10">{mode === "guided" ? "Guided" : "Markdown"}</span>
            </button>
          ))}
        </div>
      </div>

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
        <div className="max-w-[1160px] mx-auto">
          <MonacoMarkdownEditor value={markdown} onChange={updateMarkdown} />
        </div>
      )}

      {/* Floating bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-3xl px-4 pb-6">
          <div className="relative bg-gradient-to-b from-[rgba(28,28,28,0.75)] to-[rgba(16,16,16,0.65)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_8px_32px_rgba(0,0,0,0.5)] px-4 py-2.5">
            {/* Glass gradient border */}
            <div
              className="absolute inset-0 pointer-events-none z-0 rounded-full"
              style={{
                padding: 1,
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02) 50%, transparent)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
              }}
            />

            <div className="relative z-10 flex items-center justify-between gap-2">
              {/* Left: AI Draft / Regenerate */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAiDraft}
                disabled={aiLoading === "draft"}
              >
                {hasBeenDrafted ? <IconWand size={14} /> : <IconSparklesFilled size={14} />}
                <TransitionText
                  active={aiLoading === "draft"}
                  idle={hasBeenDrafted ? "Regenerate" : "Draft with AI"}
                  activeText="Drafting..."
                />
              </Button>

              {/* Right: Discard, Visibility, Export, Save, Test */}
              <div className="flex items-center gap-1.5">
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
                  className="text-text-secondary hover:text-red-400"
                >
                  <IconTrashFilled size={14} />
                </Button>

                {!tryMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleVisibility}
                  >
                    {visibility === "public" ? <IconWorld size={14} className="text-[#bfff00]" /> : <IconLockFilled size={14} />}
                    <span className="hidden sm:inline">{visibility === "public" ? "Public" : "Private"}</span>
                  </Button>
                )}

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExport(!showExport)}
                  >
                    <IconDownload size={14} />
                    <IconChevronDown size={10} />
                  </Button>
                  {showExport && (
                    <div className="absolute right-0 bottom-full mb-2 bg-[rgba(24,24,24,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl z-20 py-1 min-w-[200px]">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-[rgba(255,255,255,0.06)] transition-colors flex items-center gap-2"
                        onClick={handleExportMarkdown}
                      >
                        <IconDownload size={14} />
                        Download SKILL.md
                      </button>
                      {!tryMode && (
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-[rgba(255,255,255,0.06)] transition-colors flex items-center gap-2"
                          onClick={handleCopyInstallCommand}
                        >
                          {copiedInstall ? <IconCheck size={14} className="text-[#bfff00]" /> : <IconTerminal2 size={14} />}
                          Copy install command
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    if (tryMode) {
                      saveToLocalStorage();
                      toast.success("Saved locally");
                    } else {
                      track("skill_saved");
                      await saveSkill();
                      router.push("/dashboard");
                    }
                  }}
                  disabled={saving}
                >
                  <IconDeviceFloppy size={14} />
                  <span className="hidden sm:inline">{tryMode
                    ? "Save Locally"
                    : saving
                      ? "Saving..."
                      : isDirty
                        ? "Save*"
                        : "Save"}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    track("skill_tested");
                    if (tryMode) {
                      saveToLocalStorage();
                      router.push("/try/test");
                    } else {
                      router.push(`/skills/${skillId}/test`);
                    }
                  }}
                >
                  <IconPlayerPlayFilled size={14} />
                  <span className="hidden sm:inline">Test</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <h3 className="font-display text-lg font-semibold text-text-primary mb-2">Discard this skill?</h3>
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
