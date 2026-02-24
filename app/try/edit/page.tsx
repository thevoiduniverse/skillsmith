"use client";

import { useEffect, useState } from "react";
import { EditorShell } from "@/components/editor/editor-shell";
import Link from "next/link";

const TRY_STORAGE_KEY = "skillsmith-try-skill";

interface TrySkillData {
  title: string;
  content: string;
  category: string | null;
  description: string;
}

export default function TryEditPage() {
  const [skillData, setSkillData] = useState<TrySkillData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRY_STORAGE_KEY);
      if (!raw) {
        setNotFound(true);
        return;
      }
      const data = JSON.parse(raw) as TrySkillData;
      setSkillData(data);
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
            It looks like you haven&apos;t created a skill yet, or your browser data was cleared.
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

  if (!skillData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brand-loader" />
      </div>
    );
  }

  return (
    <EditorShell
      skillId="try-local"
      initialContent={skillData.content}
      initialTitle={skillData.title}
      tryMode
    />
  );
}
