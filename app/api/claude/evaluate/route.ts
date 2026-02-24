import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
import { EVALUATE_SYSTEM_PROMPT } from "@/lib/claude/prompts";
import { checkRateLimit, recordUsage } from "@/lib/claude/rate-limiter";
import { headers } from "next/headers";

/* ─── Simple in-memory rate limiter for anonymous users ─── */
const anonBuckets = new Map<string, { count: number; resetAt: number }>();
const ANON_HOURLY_LIMIT = 10;

function checkAnonRateLimit(ip: string): { allowed: boolean; resetAt: Date | null } {
  const now = Date.now();
  const bucket = anonBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    anonBuckets.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return { allowed: true, resetAt: null };
  }

  if (bucket.count >= ANON_HOURLY_LIMIT) {
    return { allowed: false, resetAt: new Date(bucket.resetAt) };
  }

  bucket.count++;
  return { allowed: true, resetAt: null };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Rate limiting: DB-backed for authed users, in-memory for anonymous
  if (user) {
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
        { status: 429 }
      );
    }
  } else {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const anonLimit = checkAnonRateLimit(ip);
    if (!anonLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Sign up for higher limits!", resetAt: anonLimit.resetAt },
        { status: 429 }
      );
    }
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

    // Only record usage for authenticated users
    if (user) {
      await recordUsage(
        user.id,
        "evaluate",
        res.usage?.prompt_tokens || 0,
        res.usage?.completion_tokens || 0
      );
    }

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
