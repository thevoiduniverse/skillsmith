"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatPaneProps {
  title: string;
  variant: "with-skill" | "without-skill";
  prompt: string;
  response: string | null;
  loading?: boolean;
}

export function ChatPane({ title, variant, prompt, response, loading }: ChatPaneProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <Badge variant={variant === "with-skill" ? "accent" : "default"}>
          {variant === "with-skill" ? "Skill ON" : "Baseline"}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {prompt && (
          <div className="flex justify-end">
            <div className="bg-surface-alt rounded-xl rounded-tr-sm px-4 py-3 max-w-[85%]">
              <p className="text-sm text-text-primary whitespace-pre-wrap">{prompt}</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3">
              <div className="brand-loader brand-loader-sm" />
            </div>
          </div>
        )}
        {response && !loading && (
          <div className="flex justify-start">
            <div className="bg-surface-alt rounded-xl rounded-tl-sm px-4 py-3 max-w-[85%] prose prose-invert prose-sm max-w-none prose-p:text-text-secondary prose-strong:text-text-primary prose-code:text-accent prose-code:bg-background prose-code:px-1 prose-code:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
            </div>
          </div>
        )}
        {!prompt && !response && !loading && (
          <div className="flex items-center justify-center h-full text-text-secondary text-sm">
            Send a prompt to see the response
          </div>
        )}
      </div>
    </Card>
  );
}
