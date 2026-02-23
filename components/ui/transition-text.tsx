"use client";

import { cn } from "@/lib/utils";

interface TransitionTextProps {
  active: boolean;
  idle: string;
  activeText: string;
  className?: string;
}

export function TransitionText({ active, idle, activeText, className }: TransitionTextProps) {
  return (
    <span className={cn("inline-grid", className)}>
      <span className={cn("col-start-1 row-start-1 transition-opacity duration-200", active ? "opacity-0" : "opacity-100")}>{idle}</span>
      <span className={cn("col-start-1 row-start-1 transition-opacity duration-200", active ? "opacity-100" : "opacity-0")}>{activeText}</span>
    </span>
  );
}
