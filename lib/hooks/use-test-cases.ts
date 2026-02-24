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

const LOCAL_TEST_CASES_KEY = "skillsmith-try-test-cases";

function getLocalTestCases(): TestCase[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_TEST_CASES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalTestCases(cases: TestCase[]) {
  localStorage.setItem(LOCAL_TEST_CASES_KEY, JSON.stringify(cases));
}

/** localStorage-backed version for try mode */
function useLocalTestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestCases = useCallback(async () => {
    setLoading(true);
    setTestCases(getLocalTestCases());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTestCases();
  }, [fetchTestCases]);

  const addTestCase = useCallback(async (prompt: string, expectedBehavior: string) => {
    const newCase: TestCase = {
      id: crypto.randomUUID(),
      skill_id: "try-local",
      prompt,
      expected_behavior: expectedBehavior,
      last_result_with_skill: null,
      last_result_without_skill: null,
      last_score: null,
      last_reasoning: null,
      last_run_at: null,
      created_at: new Date().toISOString(),
    };
    setTestCases((prev) => {
      const next = [...prev, newCase];
      saveLocalTestCases(next);
      return next;
    });
    return newCase;
  }, []);

  const updateTestCase = useCallback(async (id: string, updates: Partial<TestCase>) => {
    let updated: TestCase | null = null;
    setTestCases((prev) => {
      const next = prev.map((tc) => {
        if (tc.id === id) {
          updated = { ...tc, ...updates };
          return updated;
        }
        return tc;
      });
      saveLocalTestCases(next);
      return next;
    });
    return updated;
  }, []);

  const deleteTestCase = useCallback(async (id: string) => {
    setTestCases((prev) => {
      const next = prev.filter((tc) => tc.id !== id);
      saveLocalTestCases(next);
      return next;
    });
  }, []);

  return { testCases, loading, addTestCase, updateTestCase, deleteTestCase, refetch: fetchTestCases };
}

/** API-backed version for authenticated users */
function useApiTestCases(skillId: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const skip = skillId === "__noop__";

  const fetchTestCases = useCallback(async () => {
    if (skip) { setLoading(false); return; }
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
  }, [skillId, skip]);

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

export function useTestCases(skillId: string) {
  const isLocal = skillId === "try-local";
  // Both hooks are always called (React rules), but only one is used
  const local = useLocalTestCases();
  const api = useApiTestCases(isLocal ? "__noop__" : skillId);

  return isLocal ? local : api;
}
