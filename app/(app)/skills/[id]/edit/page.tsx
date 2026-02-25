import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";

export default async function SkillEditPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: skill } = await supabase
    .from("skills")
    .select("*")
    .eq("id", params.id)
    .eq("author_id", user.id)
    .single();

  if (!skill) notFound();

  return (
    <EditorShell
      skillId={skill.id}
      initialContent={skill.content}
      initialTitle={skill.title}
      initialVisibility={skill.visibility}
    />
  );
}
