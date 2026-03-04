"use client";

import { useState, useEffect } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export function AnimatedLogo({ size = 52, className = "" }: AnimatedLogoProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Allow time for WebGL shader compilation + SVG texture load
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      {/* Static fallback — shows immediately, fades out when shader is ready */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#A8F200",
          WebkitMaskImage: "url(/logo-shape.svg)",
          maskImage: "url(/logo-shape.svg)",
          WebkitMaskSize: "70% 70%",
          maskSize: "70% 70%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          opacity: ready ? 0 : 1,
          transition: "opacity 0.8s ease-in-out",
          pointerEvents: "none",
        }}
      />
      {/* Shader canvas — masked to S shape */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: size,
          height: size,
          WebkitMaskImage: "url(/logo-shape.svg)",
          maskImage: "url(/logo-shape.svg)",
          WebkitMaskSize: "70% 70%",
          maskSize: "70% 70%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.8s ease-in-out",
        }}
      >
        <LiquidMetal
          width={size}
          height={size}
          colorBack="#3a5a00"
          colorTint="#d4ff4d"
          image="/logo-shape.svg"
          shape="none"
          repetition={2}
          softness={0.15}
          shiftRed={0.1}
          shiftBlue={0.1}
          distortion={0.1}
          contour={0.6}
          angle={70}
          speed={1}
          scale={0.8}
        />
      </div>
    </div>
  );
}
