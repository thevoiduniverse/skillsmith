"use client";

import { useState } from "react";
import { IconSend2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatPane } from "./chat-pane";
import { track } from "@/lib/analytics";

interface SplitComparisonProps {
  skillContent: string;
}

export function SplitComparison({ skillContent }: SplitComparisonProps) {
  const [prompt, setPrompt] = useState("");
  const [sentPrompt, setSentPrompt] = useState("");
  const [withSkill, setWithSkill] = useState<string | null>(null);
  const [withoutSkill, setWithoutSkill] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!prompt.trim() || loading) return;
    track("split_comparison_run");
    const currentPrompt = prompt.trim();
    setSentPrompt(currentPrompt);
    setPrompt("");
    setWithSkill(null);
    setWithoutSkill(null);
    setLoading(true);

    try {
      const res = await fetch("/api/claude/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillContent, prompt: currentPrompt }),
      });
      const data = await res.json();
      setWithSkill(data.withSkill || "No response");
      setWithoutSkill(data.withoutSkill || "No response");
    } catch {
      setWithSkill("Error: Failed to get response");
      setWithoutSkill("Error: Failed to get response");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
        <ChatPane
          title="With Skill"
          variant="with-skill"
          prompt={sentPrompt}
          response={withSkill}
          loading={loading}
        />
        <ChatPane
          title="Without Skill"
          variant="without-skill"
          prompt={sentPrompt}
          response={withoutSkill}
          loading={loading}
        />
      </div>

      <div className="flex gap-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a test prompt... (Cmd+Enter to send)"
          rows={2}
          className="flex-1 text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!prompt.trim() || loading}
          className="self-end"
        >
          <IconSend2 size={16} />
        </Button>
      </div>
    </div>
  );
}
