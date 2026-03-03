"use client";

import { useState, useEffect } from "react";
import {
  IconDownload,
  IconCopy,
  IconCheck,
  IconTerminal2,
  IconFolder,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InstallSkillProps {
  skillId: string;
  skillTitle: string;
  content: string;
}

type Tab = "terminal" | "manual";

export function InstallSkill({ skillId, skillTitle, content }: InstallSkillProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [tab, setTab] = useState<Tab>("terminal");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const filename = skillTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const curlCommand = `curl -sL ${origin}/api/skills/${skillId}/raw -o .claude/skills/${filename}.md`;

  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="inline-flex rounded-full bg-[rgba(0,0,0,0.3)] p-1 gap-0.5">
        <button
          onClick={() => setTab("terminal")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
            tab === "terminal"
              ? "bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.3)]"
              : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
          )}
        >
          <IconTerminal2 size={13} />
          Terminal
        </button>
        <button
          onClick={() => setTab("manual")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
            tab === "manual"
              ? "bg-gradient-to-b from-[rgba(28,28,28,0.72)] to-[rgba(16,16,16,0.62)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.3)]"
              : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
          )}
        >
          <IconFolder size={13} />
          Manual
        </button>
      </div>

      {tab === "terminal" ? (
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#bfff00] text-[#0a0a0a] text-[11px] font-bold flex items-center justify-center mt-0.5">
              1
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[rgba(255,255,255,0.7)] mb-2">
                Run this in your <span className="text-white font-medium">project root</span> directory:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)] px-3.5 py-2.5">
                  <code className="text-xs text-[rgba(255,255,255,0.5)] block truncate">
                    {curlCommand}
                  </code>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(curlCommand)} className="shrink-0">
                  {copied ? <IconCheck size={14} className="text-[#bfff00]" /> : <IconCopy size={14} />}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#bfff00] text-[#0a0a0a] text-[11px] font-bold flex items-center justify-center mt-0.5">
              2
            </span>
            <div className="flex-1">
              <p className="text-sm text-[rgba(255,255,255,0.7)]">
                Open <span className="text-white font-medium">Claude Code</span> in the same project and use the skill:
              </p>
              <div className="mt-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)] px-3.5 py-2.5">
                <code className="text-xs text-[rgba(255,255,255,0.5)]">
                  /{filename}
                </code>
              </div>
            </div>
          </div>

          {/* Result preview */}
          <div className="ml-8 mt-1 rounded-xl bg-[rgba(191,255,0,0.03)] border border-[rgba(191,255,0,0.08)] px-3.5 py-2.5">
            <p className="text-xs text-[rgba(255,255,255,0.4)]">
              Your project structure will look like:
            </p>
            <pre className="text-xs text-[rgba(255,255,255,0.3)] mt-1.5 font-mono leading-relaxed">
{`your-project/
├── .claude/
│   └── skills/
│       └── ${filename}.md
├── src/
└── ...`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#bfff00] text-[#0a0a0a] text-[11px] font-bold flex items-center justify-center mt-0.5">
              1
            </span>
            <div className="flex-1">
              <p className="text-sm text-[rgba(255,255,255,0.7)] mb-2">
                Download the skill file:
              </p>
              <Button variant="secondary" size="sm" onClick={handleDownload}>
                <IconDownload size={15} />
                Download {filename}.md
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#bfff00] text-[#0a0a0a] text-[11px] font-bold flex items-center justify-center mt-0.5">
              2
            </span>
            <div className="flex-1">
              <p className="text-sm text-[rgba(255,255,255,0.7)]">
                Move it to your project&apos;s <code className="text-white bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded text-xs">.claude/skills/</code> folder:
              </p>
              <div className="mt-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)] px-3.5 py-2.5">
                <pre className="text-xs text-[rgba(255,255,255,0.3)] font-mono leading-relaxed">
{`your-project/
├── .claude/
│   └── skills/
│       └── ${filename}.md   ← place here
├── src/
└── ...`}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#bfff00] text-[#0a0a0a] text-[11px] font-bold flex items-center justify-center mt-0.5">
              3
            </span>
            <div className="flex-1">
              <p className="text-sm text-[rgba(255,255,255,0.7)]">
                Open <span className="text-white font-medium">Claude Code</span> in your project and use it:
              </p>
              <div className="mt-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)] px-3.5 py-2.5">
                <code className="text-xs text-[rgba(255,255,255,0.5)]">
                  /{filename}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tip */}
      <p className="text-[11px] text-[rgba(255,255,255,0.25)] ml-8">
        Claude Code automatically discovers skills in <code className="text-[rgba(255,255,255,0.35)]">.claude/skills/</code> — no config needed.
      </p>
    </div>
  );
}
