import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIClient, AI_MODEL } from "@/lib/claude/client";
import {
  DRAFT_SYSTEM_PROMPT,
  DOMAIN_ANALYSIS_PROMPT,
  SELF_CRITIQUE_PROMPT,
} from "@/lib/claude/prompts";
import { parseSkillMarkdown } from "@/lib/skill-parser/parse";
import { checkRateLimit, recordUsage } from "@/lib/claude/rate-limiter";
import { headers } from "next/headers";

const AI_FAST_MODEL = process.env.AI_FAST_MODEL || "gpt-4.1-mini";

// Allow up to 60s on Vercel Pro (Hobby is capped at 10s regardless)
export const maxDuration = 60;

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
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    /* ─── Pass 1: Domain Analysis (fast model, high temperature) ─── */
    const analysisResponse = await ai.chat.completions.create({
      model: AI_FAST_MODEL,
      max_tokens: 1500,
      temperature: 0.9,
      messages: [
        { role: "system", content: DOMAIN_ANALYSIS_PROMPT },
        { role: "user", content: `Analyze this skill description for expert knowledge extraction:\n\n${description}` },
      ],
    });

    const domainAnalysis = analysisResponse.choices[0]?.message?.content || "";
    totalInputTokens += analysisResponse.usage?.prompt_tokens || 0;
    totalOutputTokens += analysisResponse.usage?.completion_tokens || 0;

    /* ─── Pass 2: Draft Generation (full model, high temperature) ─── */
    const draftPrompt = `The user wants a skill for: ${description}

## Domain Analysis (from expert review)

${domainAnalysis}

## Your task

Using the domain analysis above, write the complete SKILL.md. Focus on:
1. The knowledge gaps identified — these become your instructions
2. The anti-patterns identified — these become your "NEVER" rules with reasoning
3. The decision trees identified — these become branching logic in your instructions
4. The pattern classification — calibrate your output length accordingly
5. The freedom calibration — match instruction specificity to the fragility rating
6. The expert tooling identified — include specific tool/command recommendations as instructions
7. The overlooked domain concepts — ensure these are covered in instructions or edge cases (these are the concepts beginners miss entirely)
8. The output structure analysis — if the skill produces findings/reviews, include the severity classification system identified

Every instruction must pass the Knowledge Delta test: would the AI already do this without being told? If yes, delete it and replace with expert-only knowledge from the analysis.

IMPORTANT: Every edge case you define must be demonstrated in at least one example. If you write an edge case like "ask for rationale when X", include an example showing that interaction. Process/Tool skills should have 4+ examples.`;

    const draftResponse = await ai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 4000,
      temperature: 0.9,
      messages: [
        { role: "system", content: DRAFT_SYSTEM_PROMPT },
        { role: "user", content: draftPrompt },
      ],
    });

    const rawDraft = draftResponse.choices[0]?.message?.content || "";
    totalInputTokens += draftResponse.usage?.prompt_tokens || 0;
    totalOutputTokens += draftResponse.usage?.completion_tokens || 0;

    // Strip any thinking/analysis before frontmatter
    const draftFrontmatterStart = rawDraft.indexOf("---");
    const cleanDraft = draftFrontmatterStart !== -1 ? rawDraft.slice(draftFrontmatterStart) : rawDraft;

    /* ─── Pass 3: Self-Critique & Refine (fast model, low temperature) ─── */
    let finalContent = cleanDraft;
    let qualityScore: Record<string, unknown> | null = null;

    try {
      const critiqueResponse = await ai.chat.completions.create({
        model: AI_FAST_MODEL,
        max_tokens: 5000,
        temperature: 0.3,
        messages: [
          { role: "system", content: SELF_CRITIQUE_PROMPT },
          { role: "user", content: `Score and improve this skill draft:\n\n${cleanDraft}` },
        ],
      });

      const critiqueRaw = critiqueResponse.choices[0]?.message?.content || "";
      totalInputTokens += critiqueResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += critiqueResponse.usage?.completion_tokens || 0;

      // Parse the critique response: improved SKILL.md + "---" + JSON score
      const scoreSeparatorIdx = critiqueRaw.lastIndexOf("\n---\n");

      if (scoreSeparatorIdx !== -1) {
        const improvedSkill = critiqueRaw.slice(0, scoreSeparatorIdx).trim();
        const scoreJson = critiqueRaw.slice(scoreSeparatorIdx + 5).trim();

        // Use improved skill if it has valid frontmatter
        const improvedFrontmatterStart = improvedSkill.indexOf("---");
        if (improvedFrontmatterStart !== -1) {
          finalContent = improvedSkill.slice(improvedFrontmatterStart);
        }

        // Parse quality score JSON
        try {
          // Extract JSON from potential markdown code fences
          const jsonMatch = scoreJson.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            qualityScore = JSON.parse(jsonMatch[0]);
          }
        } catch {
          // Score parsing failed — not critical, proceed without it
        }
      }
    } catch {
      // Pass 3 failed entirely — use Pass 2 draft (user always gets output)
    }

    const parsed = parseSkillMarkdown(finalContent);

    // Record usage for authenticated users (1 request, total tokens across all passes)
    if (user) {
      await recordUsage(user.id, "draft", totalInputTokens, totalOutputTokens);
    }

    return NextResponse.json({
      content: finalContent,
      parsed,
      ...(qualityScore && { qualityScore }),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate skill" },
      { status: 500 }
    );
  }
}
