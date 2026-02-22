"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none p-5 overflow-y-auto h-full
      prose-headings:text-text-primary prose-headings:font-bold
      prose-h1:text-2xl prose-h2:text-lg prose-h3:text-base
      prose-p:text-text-secondary prose-p:leading-relaxed
      prose-strong:text-text-primary prose-strong:font-semibold
      prose-code:text-accent prose-code:bg-surface-alt prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
      prose-pre:bg-surface-alt prose-pre:border prose-pre:border-border prose-pre:rounded-2xl
      prose-li:text-text-secondary
      prose-hr:border-border
    ">
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      ) : (
        <p className="text-text-secondary/50 italic">
          Your skill preview will appear here...
        </p>
      )}
    </div>
  );
}
