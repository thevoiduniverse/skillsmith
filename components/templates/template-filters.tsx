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
  sort: string;
  onSortChange: (value: string) => void;
}

const categories = ["All", ...SKILL_CATEGORIES];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most Used" },
  { value: "newest", label: "Newest" },
];

export function TemplateFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}: TemplateFiltersProps) {

  return (
    <div className="space-y-6">
      <div className="relative">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] z-10" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="pl-10 backdrop-blur-xl"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
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
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="shrink-0 bg-[rgba(25,25,25,0.8)] border border-[rgba(255,255,255,0.08)] text-white text-xs font-medium rounded-full px-3 py-1.5 pr-7 focus:border-[#bfff00] focus:outline-none appearance-none bg-no-repeat bg-[length:12px] bg-[right_8px_center]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
    </div>
  );
}
