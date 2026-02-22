"use client";

import { MarkdownPreview } from "./markdown-mode/markdown-preview";

interface PreviewPanelProps {
  markdown: string;
}

export function PreviewPanel({ markdown }: PreviewPanelProps) {
  return (
    <div className="bg-surface border border-border rounded-xl h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          SKILL.md Preview
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MarkdownPreview content={markdown} />
      </div>
    </div>
  );
}
