"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseSkillMarkdown } from "@/lib/skill-parser/parse";

interface TemplatePreviewProps {
  template: {
    title: string;
    description: string | null;
    content: string;
    category: string | null;
    tags: string[];
  };
  onClose: () => void;
  onUseTemplate: () => void;
  forking: boolean;
}

export function TemplatePreview({
  template,
  onClose,
  onUseTemplate,
  forking,
}: TemplatePreviewProps) {
  const parsed = parseSkillMarkdown(template.content || "");

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-white">{template.title}</h2>
            {template.description && (
              <p className="text-sm text-[rgba(255,255,255,0.5)] mt-0.5">{template.description}</p>
            )}
          </div>
          <button onClick={onClose} className="text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {parsed.instructions && (
            <div>
              <h3 className="text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Instructions</h3>
              <p className="text-sm text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">{parsed.instructions}</p>
            </div>
          )}
          {parsed.edgeCases && (
            <div>
              <h3 className="text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Edge Cases</h3>
              <p className="text-sm text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">{parsed.edgeCases}</p>
            </div>
          )}
          {parsed.examples.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Examples ({parsed.examples.length})</h3>
              <div className="space-y-3">
                {parsed.examples.map((ex, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-[rgba(255,255,255,0.4)] uppercase">User</span>
                      <p className="text-sm text-[rgba(255,255,255,0.7)] mt-0.5">{ex.input}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-[rgba(255,255,255,0.4)] uppercase">Claude</span>
                      <p className="text-sm text-[rgba(255,255,255,0.7)] mt-0.5">{ex.output}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex gap-1.5">
            {template.category && <Badge>{template.category}</Badge>}
            {template.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <Button onClick={onUseTemplate} disabled={forking} size="md">
            {forking ? "Forking..." : "Use Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
