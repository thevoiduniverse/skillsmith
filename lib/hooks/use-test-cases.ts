"use client";

import { useState, useEffect, useCallback } from "react";

interface TestCase {
  id: string;
  skill_id: string;
  prompt: string;
  expected_behavior: string;
  last_result_with_skill: string | null;
  last_result_without_skill: string | null;
  last_score: number | null;
  last_reasoning: string | null;
  last_run_at: string | null;
  created_at: string;
}

export function useTestCases(skillId: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/test-cases?skill_id=${skillId}`);
      if (!res.ok) throw new Error("Failed to fetch test cases");
      const data = await res.json();
      setTestCases(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchTestCases();
  }, [fetchTestCases]);

  const addTestCase = useCallback(
    async (prompt: string, expectedBehavior: string) => {
      const res = await fetch("/api/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_id: skillId,
          prompt,
          expected_behavior: expectedBehavior,
        }),
      });
      if (!res.ok) throw new Error("Failed to create test case");
      const data = await res.json();
      setTestCases((prev) => [...prev, data]);
      return data;
    },
    [skillId]
  );

  const updateTestCase = useCallback(async (id: string, updates: Partial<TestCase>) => {
    const res = await fetch(`/api/test-cases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update test case");
    const data = await res.json();
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? data : tc)));
    return data;
  }, []);

  const deleteTestCase = useCallback(async (id: string) => {
    const res = await fetch(`/api/test-cases/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete test case");
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  }, []);

  return { testCases, loading, addTestCase, updateTestCase, deleteTestCase, refetch: fetchTestCases };
}
