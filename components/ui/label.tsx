import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-xs font-normal text-[rgba(255,255,255,0.5)] mb-1.5", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
export { Label };
