"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateFilters } from "@/components/templates/template-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface Template {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  tags: string[];
  usage_count: number;
  featured: boolean;
  profiles?: { display_name: string } | null;
}

export function ExploreTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      params.set("sort", sort);

      try {
        const res = await fetch(`/api/templates?${params}`);
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      } catch {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(debounce);
  }, [search, category, sort]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Fixed filters */}
      <div className="shrink-0">
        <TemplateFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {/* Scrollable grid area */}
      <div className="relative flex-1 min-h-0 mt-10">
        {/* Top gradient fade mask — only visible after scrolling */}
        <div
          className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-10 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, transparent, rgba(10,10,10,0.9))",
            opacity: scrolled ? 1 : 0,
          }}
        />

        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto pt-2">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5 flex flex-col">
                  <Skeleton className="h-4 w-3/4 rounded mb-2" />
                  <Skeleton className="h-3 w-full rounded mb-1.5" />
                  <Skeleton className="h-3 w-full rounded mb-1.5" />
                  <Skeleton className="h-3 w-2/3 rounded mb-4" />
                  <div className="flex gap-1.5 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                  <div className="border-t border-[rgba(255,255,255,0.04)] pt-5 mt-auto flex justify-end">
                    <Skeleton className="h-7 w-28 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16 text-[rgba(255,255,255,0.6)]">
              {search || category
                ? "No templates match your filters."
                : "No templates available yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} publicMode />
              ))}
            </div>
          )}
        </div>

        {/* Bottom gradient fade mask */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(10,10,10,1))" }}
        />
      </div>
    </div>
  );
}
