import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
import { DRAFT_SYSTEM_PROMPT } from "@/lib/claude/prompts";
import { parseSkillMarkdown } from "@/lib/skill-parser/parse";
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

    await recordUsage(
      user.id,
      "draft",
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    );

    return NextResponse.json({ content, parsed });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate skill" },
      { status: 500 }
    );
  }
}
