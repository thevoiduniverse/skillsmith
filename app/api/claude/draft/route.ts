import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
import { DRAFT_SYSTEM_PROMPT } from "@/lib/claude/prompts";
import { parseSkillMarkdown } from "@/lib/skill-parser/parse";
import { checkRateLimit, recordUsage } from "@/lib/claude/rate-limiter";
import { headers } from "next/headers";

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

  const { description } = await request.json();
  if (!description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const ai = getAIClient();

    const decompositionPrompt = `The user wants a skill for: ${description}

Before writing the SKILL.md, think through:
1. What specific behaviors should this skill enforce? (List 5-8 concrete rules)
2. What are the trickiest edge cases? (List 4-6 non-obvious scenarios)
3. What 3 examples would best demonstrate the skill's range?

Then write the complete SKILL.md incorporating your analysis.`;

    const response = await ai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 3000,
      messages: [
        { role: "system", content: DRAFT_SYSTEM_PROMPT },
        { role: "user", content: decompositionPrompt },
      ],
    });

    const rawContent = response.choices[0]?.message?.content || "";

    // Strip the thinking/analysis portion before the first frontmatter delimiter
    const frontmatterStart = rawContent.indexOf("---");
    const content = frontmatterStart !== -1 ? rawContent.slice(frontmatterStart) : rawContent;

    const parsed = parseSkillMarkdown(content);

    // Only record usage for authenticated users
    if (user) {
      await recordUsage(
        user.id,
        "draft",
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      );
    }

    return NextResponse.json({ content, parsed });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate skill" },
      { status: 500 }
    );
  }
}
