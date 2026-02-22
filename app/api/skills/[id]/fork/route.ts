import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the source skill
  const { data: source, error: fetchError } = await supabase
    .from("skills")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !source) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Only allow forking public skills or own skills
  if (source.author_id !== user.id && source.visibility !== "public") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create fork
  const { data: fork, error: insertError } = await supabase
    .from("skills")
    .insert({
      title: `${source.title} (Fork)`,
      description: source.description,
      content: source.content,
      author_id: user.id,
      visibility: "private",
      category: source.category,
      tags: source.tags,
      fork_of: source.id,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Increment usage count on source if it's a template
  if (source.is_template) {
    await supabase
      .from("skills")
      .update({ usage_count: (source.usage_count || 0) + 1 })
      .eq("id", source.id);
  }

  return NextResponse.json(fork, { status: 201 });
}
