import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "error" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        {
          "bg-surface-alt text-text-secondary": variant === "default",
          "bg-accent/10 text-accent": variant === "accent",
          "bg-success/10 text-success": variant === "success",
          "bg-error/10 text-error": variant === "error",
          "border border-border text-text-secondary": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeProps };
