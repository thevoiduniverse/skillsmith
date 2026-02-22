import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
import { SUGGEST_SYSTEM_PROMPT } from "@/lib/claude/prompts";
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

  const { skillContent, section, context } = await request.json();
  if (!skillContent || !section) {
    return NextResponse.json({ error: "skillContent and section are required" }, { status: 400 });
  }

  try {
    const ai = getAIClient();
    const userMessage = [
      `Here is the current SKILL.md:\n\n${skillContent}`,
      `\nPlease improve the "${section}" section.`,
      context ? `\nFocus: ${context}` : "",
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

    await recordUsage(
      user.id,
      "suggest",
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    );

    return NextResponse.json({ suggestion });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
