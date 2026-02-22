import { type SkillStructure } from "./schema";

export function serializeSkillMarkdown(skill: SkillStructure): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push("---");
  lines.push(`name: ${skill.name}`);
  lines.push(`description: ${skill.description}`);
  lines.push("---");
  lines.push("");

  // Title
  if (skill.name) {
    lines.push(`# ${skill.name}`);
    lines.push("");
  }

  // Instructions
  lines.push("## Instructions");
  lines.push(skill.instructions || "");
  lines.push("");

  // Edge Cases
  lines.push("## Edge Cases");
  lines.push(skill.edgeCases || "");
  lines.push("");

  // Examples
  if (skill.examples.length > 0) {
    lines.push("## Examples");
    lines.push("");

    skill.examples.forEach((example, i) => {
      lines.push(`### Example ${i + 1}`);
      lines.push(`**User:** ${example.input}`);
      lines.push(`**Claude:** ${example.output}`);
      lines.push("");
    });
  }

  return lines.join("\n").trim() + "\n";
}
