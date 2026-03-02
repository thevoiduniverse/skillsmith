import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-[rgba(0,0,0,0.3)] border border-transparent text-white rounded-[20px] px-4 py-3 text-sm placeholder:text-[rgba(255,255,255,0.25)] focus:border-[#bfff00] focus:outline-none focus:ring-1 focus:ring-[#bfff00] transition-colors resize-none min-h-[80px]",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };
