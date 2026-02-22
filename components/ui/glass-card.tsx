import { forwardRef, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  radius?: number;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ radius = 32, className = "", children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative bg-[rgba(17,17,17,0.45)] backdrop-blur-2xl ${className}`}
      style={{ borderRadius: radius, ...style }}
      {...props}
    >
      {/* Gradient border overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: radius,
          padding: 1,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.03))",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />
      {children}
    </div>
  ),
);

GlassCard.displayName = "GlassCard";
