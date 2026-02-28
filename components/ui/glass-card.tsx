import { forwardRef, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  radius?: number;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ radius = 32, className = "", children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative bg-gradient-to-b from-[rgba(28,28,28,0.65)] to-[rgba(16,16,16,0.55)] border border-[rgba(255,255,255,0.02)] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_20px_rgba(0,0,0,0.4)] ${className}`}
      style={{ borderRadius: radius, ...style }}
      {...props}
    >
      {/* Glass gradient border */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          borderRadius: radius,
          padding: 1,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 50%, transparent)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />
      {/* Top shine */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          borderRadius: radius,
          background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 35%)",
        }}
      />
      {children}
    </div>
  ),
);

GlassCard.displayName = "GlassCard";
