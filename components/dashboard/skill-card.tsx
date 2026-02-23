"use client";

import { useRouter } from "next/navigation";
import { IconWorld, IconGitFork, IconTrashFilled } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
}

export function SkillCard({
  skill,
  selectable,
  selected,
  onSelect,
  onDelete,
}: SkillCardProps) {
  const router = useRouter();

  function handleCardClick() {
    if (selectable) {
      onSelect?.(skill.id);
    } else {
      router.push(`/skills/${skill.id}/edit`);
    }
  }

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "p-5 hover:border-[rgba(191,255,0,0.3)] transition-all duration-200 cursor-pointer group h-full flex flex-col",
        selected && "border-[rgba(191,255,0,0.5)] bg-[rgba(191,255,0,0.03)]"
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
          <h3 className="font-bold text-base text-white group-hover:text-[#bfff00] transition-colors line-clamp-1">
            {skill.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {skill.fork_of && (
            <IconGitFork size={14} className="text-[rgba(255,255,255,0.6)]" />
          )}
          {skill.visibility === "public" && (
            <IconWorld size={14} className="text-[rgba(255,255,255,0.6)]" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(skill.id);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(255,255,255,0.3)] hover:text-red-400 hover:bg-[rgba(255,0,0,0.08)] transition-colors opacity-0 group-hover:opacity-100"
          >
            <IconTrashFilled size={14} />
          </button>
        </div>
      </div>

      {skill.description && (
        <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {skill.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {skill.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[11px]">
              {tag}
            </Badge>
          ))}
          {skill.category && skill.tags.length === 0 && (
            <Badge variant="outline" className="text-[11px]">
              {skill.category}
            </Badge>
          )}
        </div>
        <span className="text-[rgba(255,255,255,0.6)] text-xs whitespace-nowrap">
          {formatRelativeTime(skill.updated_at)}
        </span>
      </div>
    </Card>
  );
}
