import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { data: skill, error } = await supabase
    .from("skills")
    .select("title, content, visibility, author_id")
    .eq("id", params.id)
    .single();

  if (error || !skill) {
    return new NextResponse("Skill not found", { status: 404 });
  }

  // Public skills: accessible to anyone
  // Private skills: only the owner
  if (skill.visibility !== "public") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== skill.author_id) {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const filename = skill.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(skill.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.md"`,
    },
  });
}
