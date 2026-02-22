"use client";

import { Sparkle, MagicWand, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface AiToolbarProps {
  onDraft: () => void;
  onImprove: () => void;
  onAddEdgeCases: () => void;
  loading?: string | null;
  disabled?: boolean;
}

export function AiToolbar({
  onDraft,
  onImprove,
  onAddEdgeCases,
  loading,
  disabled,
}: AiToolbarProps) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-6 px-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={onDraft}
        disabled={disabled || loading === "draft"}
      >
        <Sparkle weight="fill" className="w-3.5 h-3.5" />
        {loading === "draft" ? "Drafting..." : "Draft with AI"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onImprove}
        disabled={disabled || loading === "improve"}
      >
        <MagicWand weight="fill" className="w-3.5 h-3.5" />
        {loading === "improve" ? "Improving..." : "Improve"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onAddEdgeCases}
        disabled={disabled || loading === "edgeCases"}
      >
        <Warning weight="fill" className="w-3.5 h-3.5" />
        {loading === "edgeCases" ? "Thinking..." : "Add Edge Cases"}
      </Button>
    </div>
  );
}
