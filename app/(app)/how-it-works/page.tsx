import {
  IconSparklesFilled,
  IconPencil,
  IconTestPipe,
  IconWorld,
  IconArrowRight,
} from "@tabler/icons-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Create a Skill",
    description:
      "Describe what you want Claude to do and let AI generate a complete skill draft. Or start from a template, or build from scratch.",
    icon: IconSparklesFilled,
    details: [
      "Describe your use case in plain English",
      "AI generates instructions, edge cases & examples",
      "Choose a category to organize your work",
    ],
  },
  {
    number: "02",
    title: "Edit & Refine",
    description:
      "Shape your skill with a guided editor or drop into raw markdown. AI suggestions help you strengthen each section.",
    icon: IconPencil,
    details: [
      "Guided mode: structured form for each section",
      "Markdown mode: full control with Monaco editor",
      "AI-powered suggestions per section",
    ],
  },
  {
    number: "03",
    title: "Test & Validate",
    description:
      "Run prompts side-by-side — with and without your skill applied. Build test suites to measure quality automatically.",
    icon: IconTestPipe,
    details: [
      "Split-pane comparison of Claude responses",
      "Create test cases with expected behavior",
      "AI scoring tells you how well the skill performs",
    ],
  },
  {
    number: "04",
    title: "Share & Fork",
    description:
      "Publish skills to the template library for others to discover and fork. Build on the community's work.",
    icon: IconWorld,
    details: [
      "Toggle between private and public",
      "Public skills appear in the template library",
      "Fork any template and make it your own",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          How it Works
        </h1>
        <p className="text-[rgba(255,255,255,0.6)] text-base leading-relaxed max-w-lg">
          SkillSmith helps you build, test, and share custom skills for Claude.
          A skill is a structured set of instructions that makes Claude an expert
          at a specific task.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.number}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#bfff00] opacity-60">
                    {step.number}
                  </span>
                  <Icon
                    size={16}
                    className="text-[rgba(255,255,255,0.6)]"
                  />
                  <h2 className="text-base font-semibold text-white">
                    {step.title}
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="pb-10">
                <p className="text-[rgba(255,255,255,0.6)] text-base leading-relaxed mb-4">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-[rgba(255,255,255,0.5)]"
                    >
                      <IconArrowRight
                        size={14}
                        className="shrink-0 mt-[3px] text-[#bfff00] opacity-50"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SKILL.md format */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-white">
            What&apos;s in a Skill?
          </h2>
        </CardHeader>
        <CardContent className="pb-10">
          <p className="text-[rgba(255,255,255,0.6)] text-base leading-relaxed mb-4">
            Every skill is a SKILL.md file with a clear structure that Claude
            understands:
          </p>
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 font-mono text-sm space-y-2">
            <p className="text-[#bfff00]">
              # Name{" "}
              <span className="text-[rgba(255,255,255,0.3)]">
                — what the skill is called
              </span>
            </p>
            <p className="text-[#bfff00]">
              # Description{" "}
              <span className="text-[rgba(255,255,255,0.3)]">
                — what it does in one line
              </span>
            </p>
            <p className="text-[#bfff00]">
              # Instructions{" "}
              <span className="text-[rgba(255,255,255,0.3)]">
                — rules &amp; behavior for Claude
              </span>
            </p>
            <p className="text-[#bfff00]">
              # Edge Cases{" "}
              <span className="text-[rgba(255,255,255,0.3)]">
                — special scenarios to handle
              </span>
            </p>
            <p className="text-[#bfff00]">
              # Examples{" "}
              <span className="text-[rgba(255,255,255,0.3)]">
                — input/output demonstrations
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
