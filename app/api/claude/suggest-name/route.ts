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

  const { description } = await request.json();
  if (!description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const ai = getAIClient();
    const response = await ai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 50,
      messages: [
        {
          role: "system",
          content: "Generate a short, creative skill name (2-4 words) based on the description. Return ONLY the name, nothing else. No quotes, no punctuation, no explanation.",
        },
        { role: "user", content: description },
      ],
    });

    const name = response.choices[0]?.message?.content?.trim() || "";

    await recordUsage(
      user.id,
      "suggest-name",
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    );

    return NextResponse.json({ name });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate name" },
      { status: 500 }
    );
  }
}
