"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconGitFork } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TransitionText } from "@/components/ui/transition-text";
import { track } from "@/lib/analytics";

export function ForkButton({ skillId }: { skillId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleFork() {
    setLoading(true);
    try {
      const res = await fetch(`/api/skills/${skillId}/fork`, {
        method: "POST",
      });
      const fork = await res.json();
      track("skill_forked", { source_skill_id: skillId });
      router.push(`/skills/${fork.id}/edit`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleFork} disabled={loading}>
      <IconGitFork size={16} />
      <TransitionText active={loading} idle="Fork" activeText="Forking..." />
    </Button>
  );
}
