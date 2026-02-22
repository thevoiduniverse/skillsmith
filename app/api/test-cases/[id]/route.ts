import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.prompt !== undefined) updates.prompt = body.prompt;
  if (body.expected_behavior !== undefined) updates.expected_behavior = body.expected_behavior;
  if (body.last_result_with_skill !== undefined) updates.last_result_with_skill = body.last_result_with_skill;
  if (body.last_result_without_skill !== undefined) updates.last_result_without_skill = body.last_result_without_skill;
  if (body.last_score !== undefined) updates.last_score = body.last_score;
  if (body.last_reasoning !== undefined) updates.last_reasoning = body.last_reasoning;
  if (body.last_run_at !== undefined) updates.last_run_at = body.last_run_at;

  const { data: testCase, error } = await supabase
    .from("test_cases")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!testCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(testCase);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("test_cases")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
