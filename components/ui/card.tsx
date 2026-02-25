import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-[20px] bg-[rgba(22,22,22,0.50)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px]",
        className
      )}
      {...props}
    >
      {/* Glass gradient border */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none z-0"
        style={{
          padding: 1,
          background: "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 50%, transparent)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />
      {/* Top shine */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
        }}
      />
      {children}
    </div>
  )
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-8 pt-8 pb-5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-8 pb-8", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardContent };
