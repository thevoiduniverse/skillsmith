import matter from "gray-matter";
import { type SkillStructure, type SkillExample, createEmptySkill } from "./schema";

export function parseSkillMarkdown(markdown: string): SkillStructure {
  const skill = createEmptySkill();

  if (!markdown.trim()) return skill;

  // Extract frontmatter
  try {
    const { data, content } = matter(markdown);
    skill.name = data.name || "";
    skill.description = data.description || "";

    // Split content by ## headings
    const sections = splitBySections(content);

    skill.instructions = sections["instructions"] || "";
    skill.edgeCases = sections["edge cases"] || sections["edgecases"] || "";

    // Parse examples
    const examplesRaw = sections["examples"] || "";
    if (examplesRaw.trim()) {
      skill.examples = parseExamples(examplesRaw);
    }
  } catch {
    // If parsing fails, try to salvage what we can
    // Return empty skill rather than crashing
    return skill;
  }

  return skill;
}

function splitBySections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const regex = /^## (.+)$/gm;
  const headings: Array<{ name: string; index: number }> = [];

  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({ name: match[1].trim().toLowerCase(), index: match.index });
  }

  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].index + content.slice(headings[i].index).indexOf("\n") + 1;
    const end = i + 1 < headings.length ? headings[i + 1].index : content.length;
    sections[headings[i].name] = content.slice(start, end).trim();
  }

  return sections;
}

function parseExamples(raw: string): SkillExample[] {
  const examples: SkillExample[] = [];

  // Split by ### Example headers
  const parts = raw.split(/^### Example\s*\d*/gm).filter((p) => p.trim());

  for (const part of parts) {
    const userMatch = part.match(/\*\*User:\*\*\s*([\s\S]*?)(?=\*\*Claude:\*\*|$)/);
    const claudeMatch = part.match(/\*\*Claude:\*\*\s*([\s\S]*?)$/);

    if (userMatch || claudeMatch) {
      examples.push({
        input: userMatch ? userMatch[1].trim() : "",
        output: claudeMatch ? claudeMatch[1].trim() : "",
      });
    }
  }

  return examples;
}
