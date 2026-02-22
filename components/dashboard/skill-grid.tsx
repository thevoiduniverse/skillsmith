"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash, CheckSquare, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SkillCard, type SkillCardSkill } from "./skill-card";

interface SkillGridProps {
  skills: SkillCardSkill[];
}

export function SkillGrid({ skills }: SkillGridProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  async function handleDeleteSingle(id: string) {
    if (!confirm("Delete this skill?")) return;
    try {
      await fetch(`/api/skills/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      // silently fail
    }
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} skill${selected.size > 1 ? "s" : ""}?`)) return;
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/skills/${id}`, { method: "DELETE" })
        )
      );
      setSelected(new Set());
      setSelectMode(false);
      router.refresh();
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Your Skills
          </h1>
          {skills.length > 0 && (
            <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
              {skills.length} skill{skills.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selected.size === 0 || deleting}
              >
                <Trash weight="fill" className="w-3.5 h-3.5" />
                {deleting
                  ? "Deleting..."
                  : `Delete${selected.size > 0 ? ` (${selected.size})` : ""}`}
              </Button>
              <Button variant="secondary" size="sm" onClick={exitSelectMode}>
                <X weight="bold" className="w-3.5 h-3.5" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              {skills.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setSelectMode(true)}
                >
                  <CheckSquare weight="fill" className="w-4 h-4" />
                  Select
                </Button>
              )}
              <Link href="/skills/new">
                <Button>
                  <Plus weight="bold" className="w-4 h-4" />
                  New Skill
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            selectable={selectMode}
            selected={selected.has(skill.id)}
            onSelect={toggleSelect}
            onDelete={handleDeleteSingle}
          />
        ))}
      </div>
    </>
  );
}
