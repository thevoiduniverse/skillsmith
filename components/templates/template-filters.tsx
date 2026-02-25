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
    <div className="space-y-4">
      <div className="relative">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="pl-10"
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
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  isActive
                    ? "bg-[#bfff00] text-[#0a0a0a]"
                    : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:text-white"
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
