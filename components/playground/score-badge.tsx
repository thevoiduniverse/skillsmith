import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  if (score === null) return null;

  const color =
    score >= 80
      ? "text-success bg-success/10 border-success/20"
      : score >= 50
        ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
        : "text-error bg-error/10 border-error/20";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-mono font-bold border rounded-xl",
        color,
        size === "sm" ? "text-xs px-2 py-0.5 min-w-[36px]" : "text-sm px-3 py-1 min-w-[48px]"
      )}
    >
      {score}
    </span>
  );
}
