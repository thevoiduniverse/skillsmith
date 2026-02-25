"use client";

import { useState, useEffect } from "react";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateFilters } from "@/components/templates/template-filters";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");

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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Template Library
        </h1>
        <p className="text-[rgba(255,255,255,0.6)] mt-2">
          Start from a proven skill template. Fork it and make it your own.
        </p>
      </div>

      <TemplateFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[rgba(255,255,255,0.08)] p-5 flex flex-col">
                <Skeleton className="h-4 w-3/4 rounded mb-3" />
                <Skeleton className="h-3 w-full rounded mb-1.5" />
                <Skeleton className="h-3 w-full rounded mb-1.5" />
                <Skeleton className="h-3 w-2/3 rounded mb-5" />
                <div className="flex gap-1.5 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="border-t border-[rgba(255,255,255,0.04)] pt-3 mt-auto flex justify-end">
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </div>
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
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
