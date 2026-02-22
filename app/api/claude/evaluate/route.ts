import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
import { EVALUATE_SYSTEM_PROMPT } from "@/lib/claude/prompts";
import { checkRateLimit, recordUsage } from "@/lib/claude/rate-limiter";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await checkRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429 }
    );
  }

  const { prompt, response: testResponse, expectedBehavior } = await request.json();
  if (!prompt || !testResponse || !expectedBehavior) {
    return NextResponse.json(
      { error: "prompt, response, and expectedBehavior are required" },
      { status: 400 }
    );
  }

  try {
    const ai = getAIClient();
    const userMessage = `Test prompt: ${prompt}\n\nModel's response (with skill):\n${testResponse}\n\nExpected behavior:\n${expectedBehavior}`;

    const res = await ai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 500,
      messages: [
        { role: "system", content: EVALUATE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const text = res.choices[0]?.message?.content || "{}";

    await recordUsage(
      user.id,
      "evaluate",
      res.usage?.prompt_tokens || 0,
      res.usage?.completion_tokens || 0
    );

    try {
      const evaluation = JSON.parse(text);
      return NextResponse.json(evaluation);
    } catch {
      return NextResponse.json({
        score: 0,
        reasoning: "Failed to parse evaluation response",
        pass: false,
      });
    }
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to evaluate" },
      { status: 500 }
    );
  }
}
