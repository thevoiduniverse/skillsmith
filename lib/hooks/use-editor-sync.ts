"use client";

import { useState, useCallback, useRef } from "react";
import { type SkillStructure, createEmptySkill } from "@/lib/skill-parser/schema";
import { parseSkillMarkdown } from "@/lib/skill-parser/parse";
import { serializeSkillMarkdown } from "@/lib/skill-parser/serialize";

type EditorMode = "guided" | "markdown";

interface UseEditorSyncOptions {
  initialMarkdown?: string;
  onAutoSave?: (markdown: string) => void;
}

export function useEditorSync(options: UseEditorSyncOptions = {}) {
  const [structure, setStructure] = useState<SkillStructure>(() =>
    options.initialMarkdown
      ? parseSkillMarkdown(options.initialMarkdown)
      : createEmptySkill()
  );
  const [markdown, setMarkdown] = useState(
    () => options.initialMarkdown || serializeSkillMarkdown(createEmptySkill())
  );
  const [activeMode, setActiveMode] = useState<EditorMode>("guided");
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const scheduleAutoSave = useCallback(
    (md: string) => {
      setIsDirty(true);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        options.onAutoSave?.(md);
        setIsDirty(false);
      }, 30000);
    },
    [options]
  );

  // Update from guided mode — serialize to markdown
  const updateStructure = useCallback(
    (updater: (prev: SkillStructure) => SkillStructure) => {
      setStructure((prev) => {
        const next = updater(prev);
        const md = serializeSkillMarkdown(next);
        setMarkdown(md);
        scheduleAutoSave(md);
        return next;
      });
    },
    [scheduleAutoSave]
  );

  // Update from markdown mode — parse to structure
  const updateMarkdown = useCallback(
    (md: string) => {
      setMarkdown(md);
      const parsed = parseSkillMarkdown(md);
      setStructure(parsed);
      scheduleAutoSave(md);
    },
    [scheduleAutoSave]
  );

  // Switch modes
  const switchMode = useCallback(
    (mode: EditorMode) => {
      if (mode === "markdown" && activeMode === "guided") {
        // Leaving guided mode — ensure markdown is up to date
        setMarkdown(serializeSkillMarkdown(structure));
      } else if (mode === "guided" && activeMode === "markdown") {
        // Leaving markdown mode — parse markdown into structure
        setStructure(parseSkillMarkdown(markdown));
      }
      setActiveMode(mode);
    },
    [activeMode, structure, markdown]
  );

  // Get current markdown (always fresh)
  const getCurrentMarkdown = useCallback(() => {
    return activeMode === "guided" ? serializeSkillMarkdown(structure) : markdown;
  }, [activeMode, structure, markdown]);

  return {
    structure,
    markdown,
    activeMode,
    isDirty,
    updateStructure,
    updateMarkdown,
    switchMode,
    getCurrentMarkdown,
    setStructure,
  };
}
