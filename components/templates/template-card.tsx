"use client";

import { IconGitFork, IconStarFilled, IconUsers } from "@tabler/icons-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    tags: string[];
    usage_count: number;
    featured: boolean;
    profiles?: { display_name: string } | null;
  };
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();
  const [forking, setForking] = useState(false);

  async function handleFork() {
    setForking(true);
    try {
      const res = await fetch(`/api/skills/${template.id}/fork`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const fork = await res.json();
      router.push(`/skills/${fork.id}/edit`);
    } catch {
      toast.error("Failed to fork template. Please try again.");
    } finally {
      setForking(false);
    }
  }

  return (
    <Card className="p-5 flex flex-col h-full hover:border-[rgba(191,255,0,0.3)] transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-base text-white line-clamp-1">
          {template.title}
        </h3>
        {template.featured && (
          <IconStarFilled size={16} className="text-accent shrink-0" />
        )}
      </div>

      {template.description && (
        <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {template.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {template.category && (
          <Badge variant="accent">{template.category}</Badge>
        )}
        {template.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.08)] mt-auto">
        <div className="flex items-center gap-3 text-xs text-[rgba(255,255,255,0.6)]">
          {template.profiles?.display_name && (
            <span>{template.profiles.display_name}</span>
          )}
          {template.usage_count > 0 && (
            <span className="flex items-center gap-1">
              <IconUsers size={12} />
              {template.usage_count}
            </span>
          )}
        </div>
        <Button size="sm" onClick={handleFork} disabled={forking}>
          <IconGitFork size={14} />
          {forking ? "Forking..." : "Use Template"}
        </Button>
      </div>
    </Card>
  );
}
