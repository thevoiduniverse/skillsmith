import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownPreview } from "@/components/editor/markdown-mode/markdown-preview";
import { ForkButton } from "./fork-button";

export default async function SkillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from("skills")
    .select("*, profiles(display_name)")
    .eq("id", params.id)
    .single();

  if (!skill) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === skill.author_id;

  // Non-owners can only see public skills
  if (!isOwner && skill.visibility !== "public") notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {skill.title}
          </h1>
          {skill.description && (
            <p className="text-[rgba(255,255,255,0.6)] mt-2">{skill.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {skill.profiles?.display_name && (
              <span className="text-xs text-[rgba(255,255,255,0.6)]">
                by {skill.profiles.display_name}
              </span>
            )}
            <Badge variant={skill.visibility === "public" ? "accent" : "default"}>
              {skill.visibility}
            </Badge>
            {skill.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
        {user && !isOwner && <ForkButton skillId={skill.id} />}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <span className="text-xs font-medium text-[rgba(255,255,255,0.6)] uppercase tracking-wider">
            SKILL.md
          </span>
        </div>
        <MarkdownPreview content={skill.content} />
      </Card>
    </div>
  );
}
