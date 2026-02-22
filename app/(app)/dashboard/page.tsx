import { createClient } from "@/lib/supabase/server";
import { SkillGrid } from "@/components/dashboard/skill-grid";
import { EmptyState } from "@/components/dashboard/empty-state";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("author_id", user!.id)
    .neq("content", "")
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      {!skills || skills.length === 0 ? (
        <EmptyState />
      ) : (
        <SkillGrid skills={skills} />
      )}
    </div>
  );
}
