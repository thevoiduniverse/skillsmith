"use client";

import { useState, useEffect } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";
import { DotCanvas } from "@/components/ui/dot-canvas";

const SPLASH_DURATION = 5000;
const FADE_DURATION = 800;
const LOGO_ENTER_DELAY = 1500;

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"entering" | "visible" | "fading" | "done">("entering");
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("visible"), 100);
    const logoTimer = setTimeout(() => setLogoVisible(true), LOGO_ENTER_DELAY);
    const fadeTimer = setTimeout(() => setPhase("fading"), SPLASH_DURATION);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, SPLASH_DURATION + FADE_DURATION);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(logoTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  const contentHidden = phase === "entering";
  const isFading = phase === "fading";

  return (
    <div
      className="fixed inset-0 z-[100] transition-all"
      style={{
        opacity: isFading ? 0 : 1,
        filter: isFading ? "blur(20px)" : "blur(0px)",
        transitionDuration: `${FADE_DURATION}ms`,
        transitionTimingFunction: "ease-out",
      }}
    >
      {/* Solid bg */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Dots layer - blurs in */}
      <div
        className="absolute inset-0 transition-all"
        style={{
          opacity: contentHidden ? 0 : 1,
          filter: contentHidden ? "blur(20px)" : "blur(0px)",
          transitionDuration: `${FADE_DURATION}ms`,
          transitionTimingFunction: "ease-out",
        }}
      >
        <DotCanvas
          accentColor="#bfff00"
          height={1320}
          showGlow={false}
          disableCursorTrail
          className="absolute inset-0"
        />
      </div>

      {/* Logo layer - delayed blur in, uses screen blend */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all"
        style={{
          opacity: logoVisible ? 1 : 0,
          filter: logoVisible ? "blur(0px)" : "blur(20px)",
          transitionDuration: `${FADE_DURATION}ms`,
          transitionTimingFunction: "ease-out",
          mixBlendMode: "screen",
        }}
      >
        <div className="w-64 h-64">
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
    </div>
  );
}
