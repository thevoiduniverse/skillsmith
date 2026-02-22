import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "featured";

  let query = supabase
    .from("skills")
    .select("*, profiles(display_name, avatar_url)")
    .eq("is_template", true);

  if (category) {
    query = query.eq("category", category);
  }
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  switch (sort) {
    case "popular":
      query = query.order("usage_count", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "featured":
    default:
      query = query.order("featured", { ascending: false }).order("usage_count", { ascending: false });
      break;
  }

  const { data: templates, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(templates);
}
