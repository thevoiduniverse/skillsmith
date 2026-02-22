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
          "inline-flex items-center justify-center font-bold rounded-[40px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfff00]/50 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#bfff00] text-[#0a0a0a] hover:brightness-110": variant === "primary",
            "relative bg-[rgba(17,17,17,0.9)] backdrop-blur-2xl text-white border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(30,30,30,0.9)]": variant === "secondary",
            "bg-transparent text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]": variant === "ghost",
            "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20": variant === "danger",
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
