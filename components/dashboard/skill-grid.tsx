"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconPlus, IconTrashFilled, IconSquareCheckFilled, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SkillCard, type SkillCardSkill } from "./skill-card";

interface SkillGridProps {
  skills: SkillCardSkill[];
}

export function SkillGrid({ skills: initialSkills }: SkillGridProps) {
  const router = useRouter();
  const [skills, setSkills] = useState(initialSkills);
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

  async function handleUpdateTags(id: string, tags: string[]) {
    const prev = skills;
    setSkills((s) => s.map((sk) => (sk.id === id ? { ...sk, tags } : sk)));
    try {
      await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      router.refresh();
    } catch {
      setSkills(prev);
    }
  }

  async function handleDeleteSingle(id: string) {
    if (!confirm("Delete this skill?")) return;
    // Optimistic: remove from UI immediately
    setSkills((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/skills/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      // Revert on failure
      setSkills(initialSkills);
    }
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} skill${selected.size > 1 ? "s" : ""}?`)) return;
    setDeleting(true);
    const idsToDelete = Array.from(selected);
    // Optimistic: remove from UI immediately
    setSkills((prev) => prev.filter((s) => !selected.has(s.id)));
    setSelected(new Set());
    setSelectMode(false);
    try {
      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`/api/skills/${id}`, { method: "DELETE" })
        )
      );
      router.refresh();
    } catch {
      // Revert on failure
      setSkills(initialSkills);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">
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
                <IconTrashFilled size={14} />
                {deleting
                  ? "Deleting..."
                  : `Delete${selected.size > 0 ? ` (${selected.size})` : ""}`}
              </Button>
              <Button variant="secondary" size="sm" onClick={exitSelectMode}>
                <IconX size={14} />
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
                  <IconSquareCheckFilled size={16} />
                  Select
                </Button>
              )}
              <Link href="/skills/new">
                <Button>
                  <IconPlus size={16} />
                  New Skill
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            selectable={selectMode}
            selected={selected.has(skill.id)}
            onSelect={toggleSelect}
            onDelete={handleDeleteSingle}
            onUpdateTags={handleUpdateTags}
          />
        ))}
      </div>
    </>
  );
}
