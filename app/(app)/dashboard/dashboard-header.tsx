"use client";

import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ skillCount }: { skillCount: number }) {
  return (
    <div className="relative mb-8 text-center">
      <h1 className="font-display text-xl md:text-3xl font-bold text-white tracking-tight">
        Your Skills
      </h1>
      {skillCount > 0 && (
        <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
          {skillCount} skill{skillCount !== 1 ? "s" : ""}
        </p>
      )}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <Link href="/skills/new">
          <Button size="sm" className="!p-2 !rounded-full">
            <IconPlus size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
