import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient } from "@/lib/claude/client";
import { GENERATE_TESTS_PROMPT } from "@/lib/claude/prompts";
import { checkRateLimit, recordUsage } from "@/lib/claude/rate-limiter";
import { headers } from "next/headers";

const AI_FAST_MODEL = process.env.AI_FAST_MODEL || "gpt-4.1-mini";

/* ─── Simple in-memory rate limiter for anonymous users ─── */
const anonBuckets = new Map<string, { count: number; resetAt: number }>();
const ANON_HOURLY_LIMIT = 5;

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

  const { skillContent } = await request.json();
  if (!skillContent) {
    return NextResponse.json({ error: "skillContent is required" }, { status: 400 });
  }

  try {
    const ai = getAIClient();

    const response = await ai.chat.completions.create({
      model: AI_FAST_MODEL,
      max_tokens: 1500,
      temperature: 0.6,
      messages: [
        { role: "system", content: GENERATE_TESTS_PROMPT },
        { role: "user", content: `Generate 3 test cases for this skill:\n\n${skillContent}` },
      ],
    });

    const rawContent = response.choices[0]?.message?.content || "";

    // Parse the JSON array from the response
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse test cases from AI response" },
        { status: 500 }
      );
    }

    const testCases = JSON.parse(jsonMatch[0]) as Array<{
      prompt: string;
      expectedBehavior: string;
    }>;

    // Validate structure
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "Invalid test case format" },
        { status: 500 }
      );
    }

    // Record usage for authenticated users
    if (user) {
      await recordUsage(
        user.id,
        "generate-tests",
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      );
    }

    return NextResponse.json({ testCases });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate test cases" },
      { status: 500 }
    );
  }
}
