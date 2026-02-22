import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get("skill_id");
  if (!skillId) return NextResponse.json({ error: "skill_id required" }, { status: 400 });

  // Verify ownership
  const { data: skill } = await supabase
    .from("skills")
    .select("id")
    .eq("id", skillId)
    .eq("author_id", user.id)
    .single();

  if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });

  const { data: testCases, error } = await supabase
    .from("test_cases")
    .select("*")
    .eq("skill_id", skillId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(testCases);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { skill_id, prompt, expected_behavior } = body;

  if (!skill_id || !prompt || !expected_behavior) {
    return NextResponse.json({ error: "skill_id, prompt, and expected_behavior are required" }, { status: 400 });
  }

  // Verify ownership
  const { data: skill } = await supabase
    .from("skills")
    .select("id")
    .eq("id", skill_id)
    .eq("author_id", user.id)
    .single();

  if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });

  const { data: testCase, error } = await supabase
    .from("test_cases")
    .insert({
      skill_id,
      prompt,
      expected_behavior,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(testCase, { status: 201 });
}
