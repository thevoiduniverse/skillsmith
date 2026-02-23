"use client";

import { useRef, useCallback, useEffect } from "react";

// --- Physics constants ---
const DOT_SPACE = 8;
const TRAIL_RADIUS = 35;
const TRAIL_STRENGTH = 0.6;
const SPRING = 0.05;
const DAMPING = 0.88;
const WAVE_SPEED = 0.6;
const WAVE_DECEL = 0.00012;
const WAVE_FORCE = 5;
const WAVE_SUCK = 0.35;
const WAVE_MAX_RADIUS = 1500;

// --- Plinko constants ---
const PLINKO_GRAVITY = 0.045;
const PLINKO_BALL_RADIUS = 3;
const PLINKO_PEG_SPACING = 28;
const PLINKO_PEG_ROW_HEIGHT = 24;
const PLINKO_COLLISION_RADIUS = 5.5;
const PLINKO_BOUNCE = 0.55;
const PLINKO_SPAWN_INTERVAL = 5000;
const PLINKO_MAX_BALLS = 1;

type DotState = { ox: number; oy: number; vx: number; vy: number };
type PlinkoBall = { x: number; y: number; vx: number; vy: number };

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
  const burstsRef = useRef<
    Array<{ x: number; y: number; time: number; prevRadius: number }>
  >([]);
  const dotsRef = useRef<Map<string, DotState>>(new Map());
  const rafRef = useRef<number>(0);
  const accentRgbRef = useRef<[number, number, number]>(hexToRgb(accentColor));
  const targetRgbRef = useRef<[number, number, number]>(hexToRgb(accentColor));
  const plinkoBallsRef = useRef<PlinkoBall[]>([]);
  const lastBallSpawnRef = useRef<number>(0);

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

    // Radial push along cursor path (trail effect)
    const pathDx = cx - px;
    const pathDy = cy - py;
    const pathLenSq = pathDx * pathDx + pathDy * pathDy;
    const vrSq = TRAIL_RADIUS * TRAIL_RADIUS;

    const pad = TRAIL_RADIUS + 8;
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

        const inf = 1 - dist / TRAIL_RADIUS;
        const influence = inf * inf;

        const radX = dx / dist;
        const radY = dy / dist;
        const forceMag =
          Math.min(cursorSpeed, 40) * TRAIL_STRENGTH * influence;
        dot.vx += radX * forceMag;
        dot.vy += radY * forceMag;
      }
    }

    const now = Date.now();

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

    // --- Plinko ball spawning ---
    const balls = plinkoBallsRef.current;
    if (
      now - lastBallSpawnRef.current > PLINKO_SPAWN_INTERVAL &&
      balls.length < PLINKO_MAX_BALLS
    ) {
      lastBallSpawnRef.current = now;
      const margin = w * 0.2;
      balls.push({
        x: margin + Math.random() * (w - 2 * margin),
        y: -10,
        vx: 0,
        vy: 0.5,
      });
    }

    // --- Plinko ball physics ---
    for (let bi = balls.length - 1; bi >= 0; bi--) {
      const ball = balls[bi];

      // Gravity
      ball.vy += PLINKO_GRAVITY;

      // Cursor vortex → ball
      {
        let nearX: number, nearY: number;
        if (pathLenSq < 0.01) {
          nearX = cx;
          nearY = cy;
        } else {
          const proj = Math.max(
            0,
            Math.min(
              1,
              ((ball.x - px) * pathDx + (ball.y - py) * pathDy) / pathLenSq,
            ),
          );
          nearX = px + proj * pathDx;
          nearY = py + proj * pathDy;
        }
        const dx = ball.x - nearX;
        const dy = ball.y - nearY;
        const distSq = dx * dx + dy * dy;
        if (distSq < vrSq && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const inf = 1 - dist / TRAIL_RADIUS;
          const influence = inf * inf;
          const radX = dx / dist;
          const radY = dy / dist;
          const forceMag =
            Math.min(cursorSpeed, 40) * TRAIL_STRENGTH * influence * 0.5;
          ball.vx += radX * forceMag;
          ball.vy += radY * forceMag;
        }
      }

      // Shockwave → ball
      for (const wave of waves) {
        const age = now - wave.time;
        const waveRadius = WAVE_SPEED * age - 0.5 * WAVE_DECEL * age * age;
        if (waveRadius <= 0 || waveRadius > WAVE_MAX_RADIUS) continue;

        const wdx = ball.x - wave.x;
        const wdy = ball.y - wave.y;
        const wDist = Math.sqrt(wdx * wdx + wdy * wdy);
        if (wDist < 0.1) continue;

        // Ball is hit by the wave front (within a band around the radius)
        const band = 30;
        if (wDist > waveRadius - band && wDist < waveRadius + band) {
          const rt = waveRadius / WAVE_MAX_RADIUS;
          const decay = (1 - rt) * (1 - rt);
          const force = WAVE_FORCE * decay * 0.8;
          ball.vx += (wdx / wDist) * force;
          ball.vy += (wdy / wDist) * force;
        }
      }

      // Peg collision — staggered grid
      const nearRow = Math.round(ball.y / PLINKO_PEG_ROW_HEIGHT);
      for (let pr = nearRow - 1; pr <= nearRow + 1; pr++) {
        if (pr < 0) continue;
        const pegY = pr * PLINKO_PEG_ROW_HEIGHT;
        const isOddRow = pr % 2 === 1;
        const offset = isOddRow ? PLINKO_PEG_SPACING * 0.5 : 0;

        // Find nearest peg columns to check
        const nearCol = Math.round((ball.x - offset) / PLINKO_PEG_SPACING);
        for (let pc = nearCol - 1; pc <= nearCol + 1; pc++) {
          const pegX = pc * PLINKO_PEG_SPACING + offset;
          if (pegX < 0 || pegX > w) continue;

          const pdx = ball.x - pegX;
          const pdy = ball.y - pegY;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pDist < PLINKO_COLLISION_RADIUS && pDist > 0.01) {
            // Resolve overlap — push ball out along collision normal
            const nx = pdx / pDist;
            const ny = pdy / pDist;
            ball.x = pegX + nx * PLINKO_COLLISION_RADIUS;
            ball.y = pegY + ny * PLINKO_COLLISION_RADIUS;

            // Reflect velocity off normal
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
              ball.vx -= 2 * dot * nx;
              ball.vy -= 2 * dot * ny;
              // Damping + random horizontal perturbation
              ball.vx *= PLINKO_BOUNCE;
              ball.vy *= PLINKO_BOUNCE;
              ball.vx += (Math.random() - 0.5) * 0.4;
            }
          }
        }
      }

      // Wall bounce
      if (ball.x < PLINKO_BALL_RADIUS) {
        ball.x = PLINKO_BALL_RADIUS;
        ball.vx = Math.abs(ball.vx) * PLINKO_BOUNCE;
      } else if (ball.x > w - PLINKO_BALL_RADIUS) {
        ball.x = w - PLINKO_BALL_RADIUS;
        ball.vx = -Math.abs(ball.vx) * PLINKO_BOUNCE;
      }

      // Apply position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Remove if off-screen
      if (ball.y > h + 20) {
        balls.splice(bi, 1);
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

    // --- Plinko ball rendering ---
    for (const ball of balls) {
      // Solid core — matches accent color
      ctx.fillStyle = `rgb(${Math.round(acc[0])},${Math.round(acc[1])},${Math.round(acc[2])})`;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, PLINKO_BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  // Window-level mouse listeners — no DOM overlay needed, never blocks clicks
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
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
