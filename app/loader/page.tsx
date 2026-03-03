"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import { DotCanvas } from "@/components/ui/dot-canvas";

export default function LoaderPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative">
      <DotCanvas
        accentColor="#bfff00"
        height={1320}
        showGlow={false}
        className="fixed inset-0 z-0"
      />
      <div className="relative z-10 w-64 h-64 [&_canvas]:!mix-blend-mode-screen" style={{ mixBlendMode: "screen" }}>
        <LiquidMetal
          width={256}
          height={256}
          colorBack="#000000"
          colorTint="#bfff00"
          image="/logo-shape.svg"
          shape="none"
          repetition={3}
          softness={0.3}
          shiftRed={0.2}
          shiftBlue={0.2}
          distortion={0.15}
          contour={0.4}
          angle={70}
          speed={1}
          scale={0.8}
        />
      </div>
    </div>
  );
}
