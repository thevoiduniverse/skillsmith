import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
import { SUGGEST_SYSTEM_PROMPT } from "@/lib/claude/prompts";
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

  const { skillContent, section, context, testFailures } = await request.json();
  if (!skillContent || !section) {
    return NextResponse.json({ error: "skillContent and section are required" }, { status: 400 });
  }

  try {
    const ai = getAIClient();
    let testFailureContext = "";
    if (testFailures && Array.isArray(testFailures) && testFailures.length > 0) {
      const formatted = testFailures
        .map(
          (f: { prompt: string; response: string; expectedBehavior: string; score: number; reasoning: string }, i: number) =>
            `Failure ${i + 1}:\n  Prompt: ${f.prompt}\n  Response: ${f.response}\n  Expected: ${f.expectedBehavior}\n  Score: ${f.score}\n  Reasoning: ${f.reasoning}`
        )
        .join("\n\n");
      testFailureContext = `\n\nRecent test failures that should inform your improvement:\n${formatted}\n\nFocus your suggestions on fixing these specific failures while maintaining the skill's strengths.`;
    }

    const userMessage = [
      `Here is the current SKILL.md:\n\n${skillContent}`,
      `\nPlease improve the "${section}" section.`,
      context ? `\nFocus: ${context}` : "",
      testFailureContext,
    ].join("\n");

    const response = await ai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 1500,
      messages: [
        { role: "system", content: SUGGEST_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const suggestion = response.choices[0]?.message?.content || "";

    // Only record usage for authenticated users
    if (user) {
      await recordUsage(
        user.id,
        "suggest",
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      );
    }

    return NextResponse.json({ suggestion });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
