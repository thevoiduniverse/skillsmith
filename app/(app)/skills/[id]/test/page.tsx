import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SplitComparison } from "@/components/playground/split-comparison";
import { TestSuitePanel } from "@/components/playground/test-suite-panel";

export default async function SkillTestPage({
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Link href={`/skills/${skill.id}/edit`}>
          <Button variant="ghost" size="sm" className="mb-3">
            <IconArrowLeft size={16} />
            Back to Editor
          </Button>
        </Link>
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">
          Test: {skill.title}
        </h1>
        <p className="text-[rgba(255,255,255,0.5)] text-base mt-2">
          Compare Claude&apos;s responses with and without your skill
        </p>
      </div>

      <SplitComparison skillContent={skill.content} />

      <div className="border-t border-border pt-8">
        <TestSuitePanel skillId={skill.id} skillContent={skill.content} />
      </div>
    </div>
  );
}
