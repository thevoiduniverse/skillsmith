"use client";

import Link from "next/link";
import { IconWorld, IconLockFilled, IconGitFork } from "@tabler/icons-react";
import { formatRelativeTime } from "@/lib/utils";
import { getTagColors } from "@/lib/tag-colors";

interface SkillListItemProps {
  skill: {
    id: string;
    title: string;
    description: string | null;
    visibility: "private" | "public";
    tags: string[];
    fork_of: string | null;
    updated_at: string;
  };
}

export function SkillListItem({ skill }: SkillListItemProps) {
  return (
    <Link
      href={`/skills/${skill.id}/edit`}
      className="flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-surface-alt transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
            {skill.title}
          </h3>
          {skill.fork_of && (
            <IconGitFork size={12} className="text-text-secondary shrink-0" />
          )}
        </div>
        {skill.description && (
          <p className="text-text-secondary text-xs truncate mt-0.5">
            {skill.description}
          </p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-1.5">
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
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-text-secondary text-xs">
          {formatRelativeTime(skill.updated_at)}
        </span>
        {skill.visibility === "public" ? (
          <IconWorld size={14} className="text-text-secondary" />
        ) : (
          <IconLockFilled size={14} className="text-text-secondary" />
        )}
      </div>
    </Link>
  );
}
