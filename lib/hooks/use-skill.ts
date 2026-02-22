"use client";

import { useState, useEffect, useCallback } from "react";

interface Skill {
  id: string;
  title: string;
  description: string | null;
  content: string;
  author_id: string;
  visibility: "private" | "public";
  category: string | null;
  tags: string[];
  fork_of: string | null;
  is_template: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export function useSkill(id: string) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkill = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/skills/${id}`);
      if (!res.ok) throw new Error("Failed to fetch skill");
      const data = await res.json();
      setSkill(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSkill();
  }, [fetchSkill]);

  const updateSkill = useCallback(
    async (updates: Partial<Skill>) => {
      const res = await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update skill");
      const data = await res.json();
      setSkill(data);
      return data;
    },
    [id]
  );

  const deleteSkill = useCallback(async () => {
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete skill");
  }, [id]);

  return { skill, loading, error, updateSkill, deleteSkill, refetch: fetchSkill };
}
