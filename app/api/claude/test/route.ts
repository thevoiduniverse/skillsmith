import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
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

  const { skillContent, prompt } = await request.json();
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  try {
    const ai = getAIClient();

    // Run both calls in parallel
    const [withSkillRes, withoutSkillRes] = await Promise.all([
      ai.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 1500,
        messages: [
          { role: "system", content: skillContent || "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      }),
      ai.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 1500,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    ]);

    const withSkill = withSkillRes.choices[0]?.message?.content || "";
    const withoutSkill = withoutSkillRes.choices[0]?.message?.content || "";

    const totalInput =
      (withSkillRes.usage?.prompt_tokens || 0) + (withoutSkillRes.usage?.prompt_tokens || 0);
    const totalOutput =
      (withSkillRes.usage?.completion_tokens || 0) + (withoutSkillRes.usage?.completion_tokens || 0);
    await recordUsage(user.id, "test", totalInput, totalOutput);

    return NextResponse.json({ withSkill, withoutSkill });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to run test" },
      { status: 500 }
    );
  }
}
