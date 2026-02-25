"use client";

import { IconGitFork } from "@tabler/icons-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTagColors } from "@/lib/tag-colors";
import { TransitionText } from "@/components/ui/transition-text";
import { TemplatePreview } from "./template-preview";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string | null;
    content: string;
    category: string | null;
    tags: string[];
    usage_count: number;
    featured: boolean;
    profiles?: { display_name: string } | null;
  };
  publicMode?: boolean;
}

export function TemplateCard({ template, publicMode }: TemplateCardProps) {
  const router = useRouter();
  const [forking, setForking] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
    <>
      <Card className="p-5 flex flex-col h-full hover:bg-[rgba(26,26,26,0.6)] transition-all duration-200">
        <div
          className="cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <h3 className="font-bold text-base text-white line-clamp-1 mb-2">
            {template.title}
          </h3>

          {template.description && (
            <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
              {template.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {template.category && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: getTagColors(template.category).bg, color: getTagColors(template.category).text }}
            >
              {template.category}
            </span>
          )}
          {template.tags.slice(0, 2).map((tag) => {
            const colors = getTagColors(tag);
            return (
              <span
                key={tag}
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {tag}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-end pt-5 border-t border-[rgba(255,255,255,0.04)] mt-auto">
          {publicMode ? (
            <Link
              href="/signup"
              className="inline-flex items-center justify-center font-bold rounded-[40px] text-xs px-3 py-1.5 bg-[#bfff00] text-[#0a0a0a] hover:brightness-110 transition-all"
            >
              Login to use
            </Link>
          ) : (
            <Button size="sm" onClick={handleFork} disabled={forking}>
              <IconGitFork size={14} />
              <TransitionText active={forking} idle="Use Template" activeText="Forking..." />
            </Button>
          )}
        </div>
      </Card>

      {showPreview && (
        <TemplatePreview
          template={template}
          onClose={() => setShowPreview(false)}
          onUseTemplate={publicMode ? undefined : handleFork}
          forking={forking}
          publicMode={publicMode}
        />
      )}
    </>
  );
}
