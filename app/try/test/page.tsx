"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SplitComparison } from "@/components/playground/split-comparison";
import { TestSuitePanel } from "@/components/playground/test-suite-panel";

const TRY_STORAGE_KEY = "skillsmith-try-skill";

export default function TryTestPage() {
  const [skillContent, setSkillContent] = useState<string | null>(null);
  const [skillTitle, setSkillTitle] = useState("Untitled Skill");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRY_STORAGE_KEY);
      if (!raw) {
        setNotFound(true);
        return;
      }
      const data = JSON.parse(raw);
      setSkillContent(data.content || "");
      setSkillTitle(data.title || "Untitled Skill");
    } catch {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3">No skill found</h1>
          <p className="text-[rgba(255,255,255,0.5)] mb-6">
            Create a skill first before testing it.
          </p>
          <Link
            href="/try"
            className="inline-flex items-center justify-center font-bold rounded-[40px] text-sm px-6 py-3 bg-[#bfff00] text-[#0a0a0a] hover:brightness-110 transition-all"
          >
            Create a Skill
          </Link>
        </div>
      </div>
    );
  }

  if (skillContent === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brand-loader" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/try/edit">
          <Button variant="ghost" size="sm" className="mb-3">
            <IconArrowLeft size={16} />
            Back to Editor
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Test: {skillTitle}
        </h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Compare Claude&apos;s responses with and without your skill
        </p>
      </div>

      <SplitComparison skillContent={skillContent} />

      <div className="border-t border-border pt-8">
        <TestSuitePanel skillId="try-local" skillContent={skillContent} />
      </div>
    </div>
  );
}
