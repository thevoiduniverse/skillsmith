"use client";

import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES } from "@/lib/constants";

interface TemplateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string | null;
  onCategoryChange: (value: string | null) => void;
  sort?: string;
  onSortChange?: (value: string) => void;
}

const categories = ["All", ...SKILL_CATEGORIES];

export function TemplateFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: TemplateFiltersProps) {

  return (
    <div className="space-y-6">
      <div className="relative max-w-[592px] mx-auto">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] z-10" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="pl-10 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl"
        />
      </div>

      <div className="flex items-center gap-x-1.5 gap-y-3 md:gap-1.5 flex-wrap justify-center">
          {categories.map((cat) => {
            const isActive = cat === "All" ? !category : category === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat === "All" ? null : cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 backdrop-blur-xl",
                  isActive
                    ? "bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)]"
                    : "bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.5)] hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)]"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
    </div>
  );
}
