"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { IconWorld, IconGitFork, IconTrashFilled, IconPlus, IconX } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getTagColors } from "@/lib/tag-colors";

export interface SkillCardSkill {
  id: string;
  title: string;
  description: string | null;
  visibility: "private" | "public";
  category: string | null;
  tags: string[];
  fork_of: string | null;
  updated_at: string;
}

interface SkillCardProps {
  skill: SkillCardSkill;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
}

const MAX_TAGS = 5;

export function SkillCard({
  skill,
  selectable,
  selected,
  onSelect,
  onDelete,
  onUpdateTags,
}: SkillCardProps) {
  const router = useRouter();
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCardClick() {
    if (selectable) {
      onSelect?.(skill.id);
    } else {
      router.push(`/skills/${skill.id}/edit`);
    }
  }

  function openTagEditor(e: React.MouseEvent) {
    e.stopPropagation();
    setShowTagEditor(true);
    setTagInput("");
  }

  function closeTagEditor() {
    setShowTagEditor(false);
    setTagInput("");
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || skill.tags.includes(tag) || skill.tags.length >= MAX_TAGS) return;
    onUpdateTags?.(skill.id, [...skill.tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    onUpdateTags?.(skill.id, skill.tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Escape") {
      closeTagEditor();
    }
  }

  // Auto-focus input when modal opens
  useEffect(() => {
    if (showTagEditor) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [showTagEditor]);

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "px-5 pt-5 pb-2 hover:bg-[rgba(26,26,26,0.6)] transition-all duration-200 cursor-pointer group h-full flex flex-col",
        selected && "ring-1 ring-[rgba(191,255,0,0.5)] bg-[rgba(191,255,0,0.03)]"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {selectable && (
            <div
              className={cn(
                "w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors",
                selected
                  ? "bg-[#bfff00] border-[#bfff00]"
                  : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
              )}
            >
              {selected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          )}
          <h3 className="font-bold text-base text-white group-hover:text-white transition-colors line-clamp-1">
            {skill.title}
          </h3>
        </div>
        <div className="flex items-center shrink-0">
          <div className="overflow-hidden w-0 group-hover:w-7 transition-all duration-200 ease-out">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(skill.id);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(255,255,255,0.3)] hover:text-red-400 hover:bg-[rgba(255,0,0,0.08)] transition-colors"
            >
              <IconTrashFilled size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 transition-transform duration-200 ease-out">
            {skill.fork_of && (
              <IconGitFork size={14} className="text-[rgba(255,255,255,0.6)]" />
            )}
            {skill.visibility === "public" && (
              <IconWorld size={14} className="text-[rgba(255,255,255,0.6)]" />
            )}
          </div>
        </div>
      </div>

      {skill.description && (
        <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {skill.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-5 pb-3 border-t border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {skill.tags.slice(0, 2).map((tag) => {
            const colors = getTagColors(tag);
            return (
              <span
                key={tag}
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {tag}
              </span>
            );
          })}
          {skill.tags.length > 2 && (
            <span className="text-[11px] text-[rgba(255,255,255,0.4)]">
              +{skill.tags.length - 2}
            </span>
          )}
          {skill.category && skill.tags.length === 0 && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: getTagColors(skill.category).bg,
                color: getTagColors(skill.category).text,
              }}
            >
              {skill.category}
            </span>
          )}
          {onUpdateTags && !selectable && (
            <button
              onClick={openTagEditor}
              className="w-5 h-5 flex items-center justify-center rounded text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.06)] transition-colors opacity-0 group-hover:opacity-100"
            >
              <IconPlus size={12} />
            </button>
          )}
        </div>
        <span className="text-[rgba(255,255,255,0.6)] text-xs whitespace-nowrap">
          {formatRelativeTime(skill.updated_at)}
        </span>

      </div>

      {/* Tag editor modal — portaled to body to escape Card's backdrop-blur stacking context */}
      {showTagEditor && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeTagEditor}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">Edit Tags</h3>
            <p className="text-sm text-text-secondary mb-6">
              {skill.tags.length >= MAX_TAGS
                ? "Maximum 5 tags reached. Remove one to add more."
                : "Type a tag and press Enter to add it."}
            </p>
            <input
              ref={inputRef}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={skill.tags.length >= MAX_TAGS ? "Max 5 tags" : "Add a tag..."}
              disabled={skill.tags.length >= MAX_TAGS}
              maxLength={24}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-text-secondary outline-none focus:border-[rgba(191,255,0,0.4)] transition-colors disabled:opacity-40 mb-4"
            />
            {skill.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] rounded-full pl-2.5 pr-1.5 py-1 text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.12)] hover:text-white transition-colors"
                    >
                      <IconX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary mb-6">No tags yet.</p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={closeTagEditor}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => { addTag(); closeTagEditor(); }}
                className="bg-accent hover:bg-accent-hover text-black"
              >
                Done
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </Card>
  );
}
