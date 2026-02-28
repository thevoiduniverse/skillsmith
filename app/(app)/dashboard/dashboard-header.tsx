"use client";

import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ skillCount }: { skillCount: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">
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
          <IconPlus size={16} />
          New Skill
        </Button>
      </Link>
    </div>
  );
}
