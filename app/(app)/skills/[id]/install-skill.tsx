"use client";

import { useState, useEffect } from "react";
import { IconDownload, IconCopy, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface InstallSkillProps {
  skillId: string;
  skillTitle: string;
  content: string;
}

export function InstallSkill({ skillId, skillTitle, content }: InstallSkillProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const filename = skillTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    const origin = window.location.origin;
    const command = `curl -sL ${origin}/api/skills/${skillId}/raw -o .claude/skills/${filename}.md`;
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <Button variant="secondary" size="sm" onClick={handleDownload}>
        <IconDownload size={15} />
        Download SKILL.md
      </Button>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)] px-3.5 py-2">
          <code className="text-xs text-[rgba(255,255,255,0.5)] block truncate">
            curl -sL {origin}/api/skills/{skillId}/raw -o .claude/skills/{filename}.md
          </code>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
          {copied ? <IconCheck size={14} className="text-[#bfff00]" /> : <IconCopy size={14} />}
        </Button>
      </div>
    </div>
  );
}
