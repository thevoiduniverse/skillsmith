"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TemplateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string | null;
  onCategoryChange: (value: string | null) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

const categories = [
  "All",
  "Writing",
  "Code",
  "Business",
  "Education",
  "Productivity",
];

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
        <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(255,255,255,0.6)]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="pl-10"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
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
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-[rgba(25,25,25,0.8)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-[40px] px-4 py-2 focus:border-[#bfff00] focus:outline-none"
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
