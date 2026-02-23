"use client";

import { IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TransitionText } from "@/components/ui/transition-text";

interface AiToolbarProps {
  onDraft: () => void;
  loading?: string | null;
  disabled?: boolean;
}

export function AiToolbar({
  onDraft,
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
        <IconSparkles size={14} />
        <TransitionText active={loading === "draft"} idle="Draft with AI" activeText="Drafting..." />
      </Button>
    </div>
  );
}
