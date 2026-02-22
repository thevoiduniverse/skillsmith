export interface SkillExample {
  input: string;
  output: string;
}

export interface SkillStructure {
  name: string;
  description: string;
  instructions: string;
  edgeCases: string;
  examples: SkillExample[];
}

export function createEmptySkill(): SkillStructure {
  return {
    name: "",
    description: "",
    instructions: "",
    edgeCases: "",
    examples: [],
  };
}
