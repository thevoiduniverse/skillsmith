"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ skillCount }: { skillCount: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Your Skills
        </h1>
        {skillCount > 0 && (
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            {skillCount} skill{skillCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <Link href="/skills/new">
        <Button>
          <Plus weight="bold" className="w-4 h-4" />
          New Skill
        </Button>
      </Link>
    </div>
  );
}
