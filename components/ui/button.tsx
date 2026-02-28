import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-bold rounded-[40px] capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfff00]/50 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-gradient-to-b from-[#d4ff4d] to-[#a8e600] text-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] hover:from-[#dbff66] hover:to-[#b3f000] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]": variant === "primary",
            "relative bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] backdrop-blur-2xl text-white border border-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.3)] hover:from-[rgba(255,255,255,0.12)] hover:to-[rgba(255,255,255,0.04)]": variant === "secondary",
            "bg-transparent text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-gradient-to-b hover:from-[rgba(255,255,255,0.06)] hover:to-[rgba(255,255,255,0.02)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.2)]": variant === "ghost",
            "bg-gradient-to-b from-[rgba(239,68,68,0.15)] to-[rgba(239,68,68,0.08)] text-red-400 border border-red-500/20 shadow-[inset_0_1px_0_rgba(239,68,68,0.2),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.3)] hover:from-[rgba(239,68,68,0.22)] hover:to-[rgba(239,68,68,0.12)]": variant === "danger",
          },
          {
            "text-xs px-3 py-1.5 gap-1.5": size === "sm",
            "text-sm px-5 py-2.5 gap-2": size === "md",
            "text-sm px-8 py-3.5 gap-2.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button, type ButtonProps };
