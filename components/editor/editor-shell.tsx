"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FloppyDisk, Play, ShareNetwork, DownloadSimple, CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useEditorSync } from "@/lib/hooks/use-editor-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuidedEditor } from "./guided-mode/guided-editor";
import { MonacoMarkdownEditor } from "./markdown-mode/monaco-editor";
import { AiToolbar } from "./ai-toolbar";

interface EditorShellProps {
  skillId: string;
  initialContent: string;
  initialTitle: string;
}

export function EditorShell({ skillId, initialContent, initialTitle }: EditorShellProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

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
      await saveSkill(md);
    },
  });

  const saveSkill = useCallback(async (content?: string) => {
    setSaving(true);
    try {
      const md = content || getCurrentMarkdown();
      await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: md }),
      });
    } finally {
      setSaving(false);
    }
  }, [skillId, title, getCurrentMarkdown]);

  // Cmd+S save handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveSkill();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveSkill]);

  async function handleAiDraft() {
    if (!structure.description && !structure.name) return;
    setAiLoading("draft");
    try {
      const res = await fetch("/api/claude/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: structure.description || structure.name,
        }),
      });
      const data = await res.json();
      if (data.content) {
        updateMarkdown(data.content);
        if (data.parsed?.name && !title) {
          setTitle(data.parsed.name);
        }
      }
    } finally {
      setAiLoading(null);
    }
  }

  async function handleAiSuggest(section: string) {
    setAiLoading(section);
    try {
      const res = await fetch("/api/claude/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillContent: getCurrentMarkdown(),
          section,
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        updateStructure((prev) => ({
          ...prev,
          [section]: data.suggestion,
        }));
      }
    } finally {
      setAiLoading(null);
    }
  }

  async function handleAiImprove() {
    setAiLoading("improve");
    try {
      const res = await fetch("/api/claude/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillContent: getCurrentMarkdown(),
          section: "instructions",
          context: "Improve the overall quality and clarity of all sections.",
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        updateStructure((prev) => ({
          ...prev,
          instructions: data.suggestion,
        }));
      }
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

  return (
    <div className="max-w-7xl mx-auto">
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
            variant="secondary"
            size="sm"
            onClick={() => saveSkill()}
            disabled={saving}
          >
            <FloppyDisk weight="fill" className="w-3.5 h-3.5" />
            {saving ? "Saving..." : isDirty ? "Save*" : "Save"}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/skills/${skillId}/test`)}
          >
            <Play weight="fill" className="w-3.5 h-3.5" />
            Test
          </Button>
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowExport(!showExport)}
            >
              <ShareNetwork weight="fill" className="w-3.5 h-3.5" />
              <CaretDown weight="fill" className="w-3 h-3" />
            </Button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-2xl shadow-xl z-20 py-1 min-w-[160px]">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-alt transition-colors flex items-center gap-2"
                  onClick={handleExportMarkdown}
                >
                  <DownloadSimple weight="fill" className="w-3.5 h-3.5" />
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
        onImprove={handleAiImprove}
        onAddEdgeCases={() => handleAiSuggest("edgeCases")}
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
            onDone={() => {
              saveSkill();
              switchMode("markdown");
            }}
          />
        </div>
      ) : (
        <div>
          <MonacoMarkdownEditor value={markdown} onChange={updateMarkdown} />
        </div>
      )}
    </div>
  );
}
