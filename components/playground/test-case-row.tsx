"use client";

import { useState } from "react";
import { Play, Trash, CaretDown, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "./score-badge";
import { cn } from "@/lib/utils";

interface TestCaseRowProps {
  testCase: {
    id: string;
    prompt: string;
    expected_behavior: string;
    last_score: number | null;
    last_reasoning: string | null;
    last_result_with_skill: string | null;
    last_result_without_skill: string | null;
    last_run_at: string | null;
  };
  onRun: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  running?: boolean;
}

export function TestCaseRow({ testCase, onRun, onDelete, running }: TestCaseRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-alt transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="text-text-secondary">
          {expanded ? (
            <CaretDown weight="fill" className="w-4 h-4" />
          ) : (
            <CaretRight weight="fill" className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary truncate">{testCase.prompt}</p>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            Expected: {testCase.expected_behavior}
          </p>
        </div>

        <ScoreBadge score={testCase.last_score} size="sm" />

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRun(testCase.id)}
            disabled={running}
          >
            <Play weight="fill" className={cn("w-3.5 h-3.5", running && "animate-pulse")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(testCase.id)}
            className="text-text-secondary hover:text-error"
          >
            <Trash weight="fill" className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-3 bg-surface">
          {testCase.last_reasoning && (
            <div>
              <span className="text-xs font-medium text-text-secondary">Reasoning</span>
              <p className="text-sm text-text-primary mt-1">{testCase.last_reasoning}</p>
            </div>
          )}
          {testCase.last_result_with_skill && (
            <div>
              <span className="text-xs font-medium text-accent">With Skill</span>
              <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                {testCase.last_result_with_skill}
              </p>
            </div>
          )}
          {testCase.last_result_without_skill && (
            <div>
              <span className="text-xs font-medium text-text-secondary">Without Skill</span>
              <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                {testCase.last_result_without_skill}
              </p>
            </div>
          )}
          {!testCase.last_run_at && (
            <p className="text-xs text-text-secondary italic">Not yet run</p>
          )}
        </div>
      )}
    </div>
  );
}
