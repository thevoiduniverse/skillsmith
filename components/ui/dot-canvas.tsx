"use client";

import { useRef, useCallback, useEffect } from "react";

// --- Physics constants ---
const DOT_SPACE = 8;
const VORTEX_RADIUS = 60;
const VORTEX_STRENGTH = 0.6;
const SPRING = 0.05;
const DAMPING = 0.88;
const IDLE_THRESHOLD = 2000;
const WAVE_SPEED = 0.6;
const WAVE_DECEL = 0.00012;
const WAVE_FORCE = 5;
const WAVE_SUCK = 0.35;
const WAVE_MAX_RADIUS = 1500;

type DotState = { ox: number; oy: number; vx: number; vy: number };

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

interface DotCanvasProps {
  accentColor?: string;
  className?: string;
  height?: string | number;
  showGlow?: boolean;
}

export function DotCanvas({
  accentColor = "#BFFF00",
  className = "",
  height = "100%",
  showGlow = true,
}: DotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const smoothCursorRef = useRef<{ x: number; y: number }>({
    x: -9999,
    y: -9999,
  });
  const prevCursorRef = useRef<{ x: number; y: number }>({
    x: -9999,
    y: -9999,
  });
  const lastMoveTimeRef = useRef<number>(0);
  const burstsRef = useRef<
    Array<{ x: number; y: number; time: number; prevRadius: number }>
  >([]);
  const dotsRef = useRef<Map<string, DotState>>(new Map());
  const rafRef = useRef<number>(0);
  const accentRgbRef = useRef<[number, number, number]>(hexToRgb(accentColor));
  const targetRgbRef = useRef<[number, number, number]>(hexToRgb(accentColor));

  // Reactive accent — update target when prop changes
  useEffect(() => {
    targetRgbRef.current = hexToRgb(accentColor);
  }, [accentColor]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    // Smooth cursor: lerp toward raw position
    const raw = cursorRef.current;
    const smooth = smoothCursorRef.current;
    smooth.x += (raw.x - smooth.x) * 0.35;
    smooth.y += (raw.y - smooth.y) * 0.35;

    const cx = smooth.x;
    const cy = smooth.y;
    const px = prevCursorRef.current.x;
    const py = prevCursorRef.current.y;

    const cursorVx = cx - px;
    const cursorVy = cy - py;
    const cursorSpeed = Math.sqrt(cursorVx * cursorVx + cursorVy * cursorVy);

    prevCursorRef.current = { x: cx, y: cy };

    const dots = dotsRef.current;

    // Vortex force along cursor path
    const pathDx = cx - px;
    const pathDy = cy - py;
    const pathLenSq = pathDx * pathDx + pathDy * pathDy;
    const vrSq = VORTEX_RADIUS * VORTEX_RADIUS;

    const pad = VORTEX_RADIUS + 8;
    const minCol = Math.max(0, Math.floor((Math.min(px, cx) - pad) / DOT_SPACE));
    const maxCol = Math.ceil((Math.max(px, cx) + pad) / DOT_SPACE);
    const minRow = Math.max(0, Math.floor((Math.min(py, cy) - pad) / DOT_SPACE));
    const maxRow = Math.ceil((Math.max(py, cy) + pad) / DOT_SPACE);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const gx = col * DOT_SPACE;
        const gy = row * DOT_SPACE;

        let nearX: number, nearY: number;
        if (pathLenSq < 0.01) {
          nearX = cx;
          nearY = cy;
        } else {
          const proj = Math.max(
            0,
            Math.min(
              1,
              ((gx - px) * pathDx + (gy - py) * pathDy) / pathLenSq,
            ),
          );
          nearX = px + proj * pathDx;
          nearY = py + proj * pathDy;
        }

        const dx = gx - nearX;
        const dy = gy - nearY;
        const distSq = dx * dx + dy * dy;
        if (distSq > vrSq || distSq < 0.01) continue;

        const dist = Math.sqrt(distSq);

        const key = `${col},${row}`;
        let dot = dots.get(key);
        if (!dot) {
          dot = { ox: 0, oy: 0, vx: 0, vy: 0 };
          dots.set(key, dot);
        }

        const inf = 1 - dist / VORTEX_RADIUS;
        const influence = inf * inf;

        const radX = dx / dist;
        const radY = dy / dist;
        const tanX = -radY;
        const tanY = radX;

        const forceMag =
          Math.min(cursorSpeed, 40) * VORTEX_STRENGTH * influence;
        dot.vx += tanX * forceMag;
        dot.vy += tanY * forceMag;
      }
    }

    // Idle ambient drift
    const now = Date.now();
    const idleElapsed = now - lastMoveTimeRef.current;
    if (idleElapsed > IDLE_THRESHOLD) {
      const idleFade = Math.min(1, (idleElapsed - IDLE_THRESHOLD) / 1000);
      const focalX = w * 0.5;
      const focalY = h * 0.3;
      const time = now * 0.001;

      const driftRadius = 80;
      const driftMinCol = Math.max(
        0,
        Math.floor((focalX - driftRadius) / DOT_SPACE),
      );
      const driftMaxCol = Math.ceil((focalX + driftRadius) / DOT_SPACE);
      const driftMinRow = Math.max(
        0,
        Math.floor((focalY - driftRadius) / DOT_SPACE),
      );
      const driftMaxRow = Math.ceil((focalY + driftRadius) / DOT_SPACE);

      for (let row = driftMinRow; row <= driftMaxRow; row++) {
        for (let col = driftMinCol; col <= driftMaxCol; col++) {
          const gx = col * DOT_SPACE;
          const gy = row * DOT_SPACE;
          const fdx = gx - focalX;
          const fdy = gy - focalY;
          const fDist = Math.sqrt(fdx * fdx + fdy * fdy);
          if (fDist > driftRadius) continue;

          const key = `${col},${row}`;
          let dot = dots.get(key);
          if (!dot) {
            dot = { ox: 0, oy: 0, vx: 0, vy: 0 };
            dots.set(key, dot);
          }

          const phase = (col + row) * 0.5;
          const wave = Math.sin(time * 1.2 + phase) * 1.5 * idleFade;
          const proximity = 1 - fDist / driftRadius;
          dot.vx += wave * proximity * 0.15;
          dot.vy +=
            Math.cos(time * 0.9 + phase) * 0.8 * idleFade * proximity * 0.15;
        }
      }
    }

    // Shockwave forces
    const waves = burstsRef.current;
    for (let wi = waves.length - 1; wi >= 0; wi--) {
      const wave = waves[wi];
      const age = now - wave.time;

      const currentSpeed = Math.max(0.05, WAVE_SPEED - WAVE_DECEL * age);
      const waveRadius = WAVE_SPEED * age - 0.5 * WAVE_DECEL * age * age;

      if (waveRadius > WAVE_MAX_RADIUS || currentSpeed <= 0.05) {
        waves.splice(wi, 1);
        continue;
      }

      const prevRadius = wave.prevRadius;
      const advance = waveRadius - prevRadius;
      wave.prevRadius = waveRadius;
      if (advance < 0.5) continue;

      const rt = waveRadius / WAVE_MAX_RADIUS;
      const decay = (1 - rt) * (1 - rt);
      const epicenterBoost =
        waveRadius < 150 ? 1 + (1 - waveRadius / 150) * 0.6 : 1;

      const pullTail = advance * 1.5;
      const pullInner = Math.max(0, prevRadius - pullTail);

      const scanOuter = waveRadius;
      const scanInner = pullInner;
      const scanOuterSq = scanOuter * scanOuter;
      const scanInnerSq = scanInner * scanInner;

      const wMinCol = Math.max(
        0,
        Math.floor((wave.x - scanOuter) / DOT_SPACE),
      );
      const wMaxCol = Math.ceil((wave.x + scanOuter) / DOT_SPACE);
      const wMinRow = Math.max(
        0,
        Math.floor((wave.y - scanOuter) / DOT_SPACE),
      );
      const wMaxRow = Math.ceil((wave.y + scanOuter) / DOT_SPACE);

      for (let row = wMinRow; row <= wMaxRow; row++) {
        for (let col = wMinCol; col <= wMaxCol; col++) {
          const gx = col * DOT_SPACE;
          const gy = row * DOT_SPACE;
          const wdx = gx - wave.x;
          const wdy = gy - wave.y;

          const wDistSq = wdx * wdx + wdy * wdy;
          if (wDistSq < scanInnerSq || wDistSq > scanOuterSq) continue;

          const wDist = Math.sqrt(wDistSq);
          if (wDist < 0.1) continue;

          const key = `${col},${row}`;
          let dot = dots.get(key);
          if (!dot) {
            dot = { ox: 0, oy: 0, vx: 0, vy: 0 };
            dots.set(key, dot);
          }

          const wRadX = wdx / wDist;
          const wRadY = wdy / wDist;

          if (wDist >= prevRadius && wDist <= waveRadius) {
            const force = WAVE_FORCE * decay * epicenterBoost;
            dot.vx += wRadX * force;
            dot.vy += wRadY * force;
          } else if (wDist >= pullInner && wDist < prevRadius) {
            const pullFade = 1 - (prevRadius - wDist) / pullTail;
            const force = WAVE_FORCE * WAVE_SUCK * decay * pullFade;
            dot.vx -= wRadX * force;
            dot.vy -= wRadY * force;
          }
        }
      }
    }

    // Physics step: spring back + damping
    const deadKeys: string[] = [];
    dots.forEach((dot, key) => {
      dot.vx -= dot.ox * SPRING;
      dot.vy -= dot.oy * SPRING;
      dot.vx *= DAMPING;
      dot.vy *= DAMPING;
      dot.ox += dot.vx;
      dot.oy += dot.vy;

      const energy =
        dot.ox * dot.ox + dot.oy * dot.oy + dot.vx * dot.vx + dot.vy * dot.vy;
      if (energy < 0.01) deadKeys.push(key);
    });
    for (const key of deadKeys) dots.delete(key);

    // Lerp accent color toward target
    const acc = accentRgbRef.current;
    const tgt = targetRgbRef.current;
    const lerpFactor = 0.04;
    acc[0] += (tgt[0] - acc[0]) * lerpFactor;
    acc[1] += (tgt[1] - acc[1]) * lerpFactor;
    acc[2] += (tgt[2] - acc[2]) * lerpFactor;

    // Render
    ctx.clearRect(0, 0, w, h);

    const cols = Math.ceil(w / DOT_SPACE);
    const rows = Math.ceil(h / DOT_SPACE);

    for (let row = 0; row <= rows; row++) {
      const gy = row * DOT_SPACE;

      const verticalFade =
        gy < h * 0.6 ? 1 : Math.max(0, 1 - (gy - h * 0.6) / (h * 0.4));
      if (verticalFade <= 0) continue;

      for (let col = 0; col <= cols; col++) {
        const gx = col * DOT_SPACE;

        const dot = dots.get(`${col},${row}`);
        const ox = dot ? dot.ox : 0;
        const oy = dot ? dot.oy : 0;

        const disp = Math.sqrt(ox * ox + oy * oy);
        const intensity = Math.min(disp / 12, 1);

        const boost = intensity * intensity;
        const br = Math.round(
          255 +
            (acc[0] - 255) * intensity +
            boost * (255 - acc[0]) * 0.35,
        );
        const bg = Math.round(
          255 +
            (acc[1] - 255) * intensity +
            boost * (255 - acc[1]) * 0.35,
        );
        const bb = Math.round(
          255 +
            (acc[2] - 255) * intensity +
            boost * (255 - acc[2]) * 0.35,
        );
        const r = Math.min(255, br);
        const g = Math.min(255, bg);
        const b = Math.min(255, bb);
        const alpha = (0.07 + intensity * 0.7) * verticalFade;

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(gx + ox, gy + oy, 1, 1);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  // Window-level mouse listeners — no DOM overlay needed, never blocks clicks
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
      lastMoveTimeRef.current = Date.now();
    };

    const handleMouseDown = (e: MouseEvent) => {
      const bursts = burstsRef.current;
      bursts.push({
        x: e.clientX,
        y: e.clientY + window.scrollY,
        time: Date.now(),
        prevRadius: 0,
      });
      if (bursts.length > 5) bursts.shift();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Start/stop animation loop
  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className={`pointer-events-none ${className}`}>
      {/* Light bulb glow — top center */}
      {showGlow && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: "100%",
            height: 600,
            background:
              "radial-gradient(ellipse 55% 60% at 50% 0%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 40%, transparent 70%)",
          }}
        />
      )}

      {/* Dot pattern canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ height, width: "100%" }}
      />
    </div>
  );
}
