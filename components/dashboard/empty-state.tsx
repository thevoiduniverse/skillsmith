"use client";

import Link from "next/link";
import { IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <IconSparkles size={32} className="text-accent" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        No skills yet
      </h2>
      <p className="text-text-secondary max-w-md mb-8">
        Create your first skill to teach Claude new behaviors. Describe what you
        want and our AI will generate a complete SKILL.md file for you.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/skills/new">
          <Button size="lg">
            <IconSparkles size={16} />
            Create Your First Skill
          </Button>
        </Link>
        <Link href="/templates">
          <Button variant="secondary" size="lg">
            Browse Templates
          </Button>
        </Link>
      </div>
    </div>
  );
}
