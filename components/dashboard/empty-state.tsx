"use client";

import Link from "next/link";
import { IconSparklesFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 text-center">
      <h2 className="font-display text-xl md:text-3xl font-bold text-white mb-2">
        No skills yet
      </h2>
      <p className="text-text-secondary max-w-md mb-8">
        <span className="hidden md:inline">Create your first skill to teach Claude new behaviors. Describe what you
        want and our AI will generate a complete SKILL.md file for you.</span>
        <span className="md:hidden">Create your first skill to teach Claude new behaviors.</span>
      </p>
      <div className="flex flex-col md:flex-row items-center gap-3">
        <Link href="/skills/new">
          <Button size="lg">
            <IconSparklesFilled size={16} />
            <span className="hidden md:inline">Create Your First Skill</span>
            <span className="md:hidden">Create Skill</span>
          </Button>
        </Link>
        <Link href="/templates">
          <Button variant="secondary" size="lg">
            <span className="hidden md:inline">Browse Templates</span>
            <span className="md:hidden">Templates</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
