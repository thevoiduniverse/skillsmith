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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/skills/${skill.id}/edit`}>
          <Button variant="ghost" size="sm">
            <IconArrowLeft size={16} />
            Back to Editor
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Test: {skill.title}
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Compare Claude&apos;s responses with and without your skill
          </p>
        </div>
      </div>

      <SplitComparison skillContent={skill.content} />

      <div className="border-t border-border pt-8">
        <TestSuitePanel skillId={skill.id} skillContent={skill.content} />
      </div>
    </div>
  );
}
