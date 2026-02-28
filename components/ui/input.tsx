import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full bg-[rgba(255,255,255,0.05)] border border-transparent text-white rounded-full px-4 py-3 text-sm placeholder:text-[rgba(255,255,255,0.25)] focus:border-[#bfff00] focus:outline-none focus:ring-1 focus:ring-[#bfff00] transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };
