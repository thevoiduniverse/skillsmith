"use client";

import { useState } from "react";
import { IconPlayerPlayFilled, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TransitionText } from "@/components/ui/transition-text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { TestCaseRow } from "./test-case-row";
import { useTestCases } from "@/lib/hooks/use-test-cases";
import { track } from "@/lib/analytics";

interface TestSuitePanelProps {
  skillId: string;
  skillContent: string;
}

export function TestSuitePanel({ skillId, skillContent }: TestSuitePanelProps) {
  const { testCases, loading, addTestCase, updateTestCase, deleteTestCase } =
    useTestCases(skillId);
  const [newPrompt, setNewPrompt] = useState("");
  const [newExpected, setNewExpected] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  async function handleAdd() {
    if (!newPrompt.trim() || !newExpected.trim()) return;
    await addTestCase(newPrompt.trim(), newExpected.trim());
    track("test_case_added");
    setNewPrompt("");
    setNewExpected("");
    setShowForm(false);
  }

  async function runSingleTest(testCaseId: string) {
    track("test_run_single");
    setRunningId(testCaseId);
    const tc = testCases.find((t) => t.id === testCaseId);
    if (!tc) return;

    try {
      // Run the test
      const testRes = await fetch("/api/claude/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillContent, prompt: tc.prompt }),
      });
      const testData = await testRes.json();

      // Evaluate the result
      const evalRes = await fetch("/api/claude/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: tc.prompt,
          response: testData.withSkill,
          expectedBehavior: tc.expected_behavior,
        }),
      });
      const evalData = await evalRes.json();

      // Update the test case with results
      await updateTestCase(testCaseId, {
        last_result_with_skill: testData.withSkill,
        last_result_without_skill: testData.withoutSkill,
        last_score: evalData.score,
        last_reasoning: evalData.reasoning,
        last_run_at: new Date().toISOString(),
      });
    } catch {
      // silent fail — the UI shows no result
    } finally {
      setRunningId(null);
    }
  }

  async function runAllTests() {
    track("test_run_all", { count: testCases.length });
    setRunningAll(true);
    for (const tc of testCases) {
      await runSingleTest(tc.id);
    }
    setRunningAll(false);
  }

  const avgScore =
    testCases.filter((tc) => tc.last_score !== null).length > 0
      ? Math.round(
          testCases
            .filter((tc) => tc.last_score !== null)
            .reduce((sum, tc) => sum + (tc.last_score || 0), 0) /
            testCases.filter((tc) => tc.last_score !== null).length
        )
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Test Suite
          </h3>
          {avgScore !== null && (
            <span className="text-xs text-text-secondary">
              Avg score: <span className="font-mono font-bold text-text-primary">{avgScore}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <IconPlus size={14} />
            Add Test
          </Button>
          {testCases.length > 0 && (
            <Button
              size="sm"
              onClick={runAllTests}
              disabled={runningAll || !!runningId}
            >
              <IconPlayerPlayFilled size={14} />
              <TransitionText active={runningAll} idle="Run All" activeText="Running..." />
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <Input
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Test prompt — what to send to Claude"
          />
          <Textarea
            value={newExpected}
            onChange={(e) => setNewExpected(e.target.value)}
            placeholder="Expected behavior — what a good response looks like"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newPrompt.trim() || !newExpected.trim()}
            >
              Add Test Case
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          Loading test cases...
        </div>
      ) : testCases.length === 0 && !showForm ? (
        <div className="text-center py-8 text-text-secondary text-sm border border-dashed border-border rounded-2xl">
          No test cases yet. Add one to start evaluating your skill.
        </div>
      ) : (
        <div className="space-y-2">
          {testCases.map((tc) => (
            <TestCaseRow
              key={tc.id}
              testCase={tc}
              onRun={runSingleTest}
              onDelete={deleteTestCase}
              running={runningId === tc.id || runningAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}
