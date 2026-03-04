"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TransitionText } from "@/components/ui/transition-text";
import { parseSkillMarkdown } from "@/lib/skill-parser/parse";
import { getTagColors } from "@/lib/tag-colors";
import Link from "next/link";

interface TemplatePreviewProps {
  template: {
    title: string;
    description: string | null;
    content: string;
    category: string | null;
    tags: string[];
  };
  onClose: () => void;
  onUseTemplate?: () => void;
  forking: boolean;
  publicMode?: boolean;
}

export function TemplatePreview({
  template,
  onClose,
  onUseTemplate,
  forking,
  publicMode,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-5"
      onClick={onClose}
    >
      <div
        className="relative rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-gradient-to-b from-[rgba(30,30,30,0.78)] to-[rgba(18,18,18,0.68)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass gradient border */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none z-0"
          style={{
            padding: 1,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 50%, transparent)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        />
        {/* Top shine */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none z-0"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>

        {/* Header */}
        <div className="p-6 pb-0 pr-14">
          <h2 className="font-display text-lg font-semibold text-white">{template.title}</h2>
          {template.description && (
            <p className="text-sm text-[rgba(255,255,255,0.5)] mt-0.5">{template.description}</p>
          )}
        </div>

        <div className="mx-6 mt-6 border-t border-[rgba(255,255,255,0.06)]" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {parsed.instructions && (
            <div>
              <h3 className="font-sans text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Instructions</h3>
              <p className="text-sm text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">{parsed.instructions}</p>
            </div>
          )}
          {parsed.instructions && parsed.edgeCases && (
            <div className="border-t border-[rgba(255,255,255,0.06)]" />
          )}
          {parsed.edgeCases && (
            <div>
              <h3 className="font-sans text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Edge Cases</h3>
              <p className="text-sm text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">{parsed.edgeCases}</p>
            </div>
          )}
          {(parsed.instructions || parsed.edgeCases) && parsed.examples.length > 0 && (
            <div className="border-t border-[rgba(255,255,255,0.06)]" />
          )}
          {parsed.examples.length > 0 && (
            <div>
              <h3 className="font-sans text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Examples ({parsed.examples.length})</h3>
              <div className="space-y-3">
                {parsed.examples.map((ex, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 space-y-2">
                    <div>
                      <span className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase">User</span>
                      <p className="text-sm text-[rgba(255,255,255,0.7)] mt-0.5">{ex.input}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase">Claude</span>
                      <p className="text-sm text-[rgba(255,255,255,0.7)] mt-0.5">{ex.output}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-6 border-t border-[rgba(255,255,255,0.06)]" />

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-6 pb-6 pt-4">
          <div className="flex gap-1.5 justify-center sm:justify-start">
            {template.category && (
              <span
                className="inline-flex items-center rounded-full px-2.5 text-xs font-medium leading-none pt-[4px] pb-[6px]"
                style={{ backgroundColor: getTagColors(template.category).bg, color: getTagColors(template.category).text }}
              >
                {template.category}
              </span>
            )}
            {template.tags?.slice(0, 2).map((tag) => {
              const colors = getTagColors(tag);
              return (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full px-2.5 text-xs font-medium leading-none pt-[4px] pb-[6px]"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
          {publicMode ? (
            <Link
              href="/signup"
              className="inline-flex items-center justify-center font-bold rounded-[40px] text-sm px-5 py-2.5 bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] hover:brightness-105 transition-all whitespace-nowrap"
            >
              Sign up to use this skill
            </Link>
          ) : (
            <Button onClick={onUseTemplate} disabled={forking} size="md">
              <TransitionText active={forking} idle="Use Template" activeText="Forking..." />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
