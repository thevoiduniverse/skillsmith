"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

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
      router.push(`/skills/${fork.id}/edit`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleFork} disabled={loading}>
      <GitFork weight="fill" className="w-4 h-4" />
      {loading ? "Forking..." : "Fork"}
    </Button>
  );
}
