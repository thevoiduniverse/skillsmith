export const SKILL_CATEGORIES = [
  "Writing",
  "Code",
  "Business",
  "Education",
  "Productivity",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
