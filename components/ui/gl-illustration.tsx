"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, Environment, OrbitControls, Preload, useFont } from "@react-three/drei";
import * as THREE from "three";

// Preload shared resources so they're cached before first Canvas mounts
useFont.preload("/fonts/helvetiker_bold.typeface.json");

const glMaterial = {
  color: "#f0f0f4",
  metalness: 1,
  roughness: 0.2,
  transmission: 0.15,
  thickness: 1,
  ior: 2.5,
  clearcoat: 1,
  clearcoatRoughness: 0.01,
  reflectivity: 1,
  envMapIntensity: 1.5,
  specularIntensity: 1.5,
  specularColor: new THREE.Color("#ffffff"),
  attenuationColor: new THREE.Color("#f8f8ff"),
  attenuationDistance: 5,
  transparent: true,
  side: THREE.DoubleSide as THREE.Side,
};

function AutoRotate({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x += delta * 0.2;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

function GlTextMesh({ text, size = 2.5 }: { text: string; size?: number }) {
  size = size * 0.8;
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && meshRef.current.geometry && !(meshRef.current as unknown as { __normalsFixed?: boolean }).__normalsFixed) {
      meshRef.current.geometry.deleteAttribute("normal");
      meshRef.current.geometry.computeVertexNormals();
      (meshRef.current as unknown as { __normalsFixed?: boolean }).__normalsFixed = true;
    }
  });

  return (
    <AutoRotate>
      <Center>
        <Text3D
          ref={meshRef}
          font="/fonts/helvetiker_bold.typeface.json"
          size={size}
          height={size * 0.32}
          bevelEnabled
          bevelThickness={0.2}
          bevelSize={0.18}
          bevelSegments={20}
          curveSegments={64}
          letterSpacing={0.1}
        >
          {text}
          <meshPhysicalMaterial {...glMaterial} />
        </Text3D>
      </Center>
    </AutoRotate>
  );
}

function SaturnMesh({ size = 2 }: { size?: number }) {
  const ringGeo = (() => {
    const inner = size * 0.75;
    const outer = size * 0.95;
    const mid = (inner + outer) / 2;
    const thick = size * 0.025;

    // Smooth elliptical cross-section using many points around an ellipse
    const profile: THREE.Vector2[] = [];
    const segments = 64;
    const halfWidth = (outer - inner) / 2;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = mid + Math.cos(angle) * halfWidth;
      const y = Math.sin(angle) * thick;
      profile.push(new THREE.Vector2(r, y));
    }

    const geo = new THREE.LatheGeometry(profile, 128);
    geo.deleteAttribute("normal");
    geo.computeVertexNormals();
    return geo;
  })();

  return (
    <AutoRotate>
      <group rotation={[0.4, 0, -0.2]}>
        <mesh>
          <sphereGeometry args={[size * 0.5, 64, 64]} />
          <meshPhysicalMaterial {...glMaterial} />
        </mesh>
        <mesh geometry={ringGeo}>
          <meshPhysicalMaterial {...glMaterial} />
        </mesh>
      </group>
    </AutoRotate>
  );
}

function PrismMesh({ size = 2 }: { size?: number }) {
  const r = size * 0.7;
  const depth = size * 0.6;

  // Rounded triangular prism
  const pts = [
    { x: 0, y: r },
    { x: -r * 0.866, y: -r * 0.5 },
    { x: r * 0.866, y: -r * 0.5 },
  ];
  const rc = r * 0.15;

  const shape = new THREE.Shape();
  for (let i = 0; i < 3; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % 3];
    const prev = pts[(i + 2) % 3];

    const toNext = { x: next.x - curr.x, y: next.y - curr.y };
    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    const dNext = Math.sqrt(toNext.x ** 2 + toNext.y ** 2);
    const dPrev = Math.sqrt(toPrev.x ** 2 + toPrev.y ** 2);

    const aNext = { x: curr.x + (toNext.x / dNext) * rc, y: curr.y + (toNext.y / dNext) * rc };
    const aPrev = { x: curr.x + (toPrev.x / dPrev) * rc, y: curr.y + (toPrev.y / dPrev) * rc };

    if (i === 0) shape.moveTo(aPrev.x, aPrev.y);
    else shape.lineTo(aPrev.x, aPrev.y);

    shape.quadraticCurveTo(curr.x, curr.y, aNext.x, aNext.y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: size * 0.12,
    bevelSize: size * 0.1,
    bevelSegments: 20,
    curveSegments: 32,
  });
  geo.center();
  geo.deleteAttribute("normal");
  geo.computeVertexNormals();

  return (
    <AutoRotate>
      <mesh geometry={geo}>
        <meshPhysicalMaterial {...glMaterial} />
      </mesh>
    </AutoRotate>
  );
}

function Lights({ soft = false }: { soft?: boolean }) {
  const d = soft ? 2 : 1; // push lights further for softer falloff
  const p = soft ? 1 : 0.8; // higher penumbra = softer edges
  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.5} />
      <spotLight position={[-5 * d, 3 * d, 4 * d]} intensity={16} angle={0.6} penumbra={p} color="#bfff00" />
      <spotLight position={[5 * d, 3 * d, 4 * d]} intensity={16} angle={0.6} penumbra={p} color="#a8e600" />
      <spotLight position={[0, -4 * d, 3 * d]} intensity={10} angle={0.5} penumbra={soft ? 1 : 0.9} color="#bfff00" />
      <pointLight position={[-3 * d, 0, 5 * d]} intensity={8} color="#d4ff4d" />
      <pointLight position={[3 * d, 0, 5 * d]} intensity={8} color="#d4ff4d" />
      <spotLight position={[0, 4 * d, -3 * d]} intensity={10} angle={0.5} penumbra={p} color="#bfff00" />
      <pointLight position={[4 * d, -3 * d, -2 * d]} intensity={8} color="#a8e600" />
      <spotLight position={[0, 5 * d, 5 * d]} intensity={4} angle={0.6} penumbra={soft ? 0.8 : 0.5} color="#ffffff" />
      <spotLight position={[0, 0, 8 * d]} intensity={10} angle={0.5} penumbra={soft ? 1 : 0.7} color="#bfff00" />
      <directionalLight position={[0, 0, 6 * d]} intensity={2} color="#ffffff" />
      <spotLight position={[-4 * d, -2 * d, 4 * d]} intensity={12} angle={0.5} penumbra={soft ? 1 : 0.7} color="#bfff00" />
      <pointLight position={[2 * d, 4 * d, -3 * d]} intensity={10} color="#a8e600" />
    </>
  );
}

function Scene({ text, shape, size }: { text?: string; shape?: string; size?: number }) {
  return (
    <>
      <Lights soft={shape === "saturn"} />

      {shape === "saturn" ? (
        <SaturnMesh size={size} />
      ) : shape === "prism" ? (
        <PrismMesh size={size} />
      ) : (
        <GlTextMesh text={text || "{ }"} size={size} />
      )}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        dampingFactor={0.1}
        rotateSpeed={0.8}
      />
    </>
  );
}

function useInView(rootMargin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

export function GlIllustration({
  text,
  shape,
  size,
  className = "",
}: {
  text?: string;
  shape?: string;
  size?: number;
  className?: string;
}) {
  const { ref, inView } = useInView("400px");

  return (
    <div ref={ref} className={className}>
      {inView && (
        <Canvas
          camera={{ position: [0, 0, 12], fov: 40 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
          resize={{ offsetSize: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <Scene text={text} shape={shape} size={size} />
            <Preload all />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
