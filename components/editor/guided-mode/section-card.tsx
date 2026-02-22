"use client";

import { Sparkle } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface SectionCardProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onAiSuggest?: () => void;
  aiLoading?: boolean;
  placeholder?: string;
  minRows?: number;
}

export function SectionCard({
  title,
  description,
  value,
  onChange,
  onAiSuggest,
  aiLoading,
  placeholder,
  minRows = 4,
}: SectionCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        </div>
        {onAiSuggest && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAiSuggest}
            disabled={aiLoading}
            className="shrink-0 text-accent"
          >
            <Sparkle weight="fill" className="w-3.5 h-3.5" />
            {aiLoading ? "Thinking..." : "AI Suggest"}
          </Button>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        className="text-sm"
      />
    </Card>
  );
}
