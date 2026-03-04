"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

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
  return (
    <AutoRotate>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={size}
          height={size * 0.32}
          bevelEnabled
          bevelThickness={0.15}
          bevelSize={0.12}
          bevelSegments={12}
          curveSegments={32}
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
  return (
    <AutoRotate>
      <group rotation={[0.4, 0, -0.2]}>
        <mesh>
          <sphereGeometry args={[size * 0.5, 64, 64]} />
          <meshPhysicalMaterial {...glMaterial} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.85, size * 0.06, 32, 128]} />
          <meshPhysicalMaterial {...glMaterial} />
        </mesh>
      </group>
    </AutoRotate>
  );
}

function InfinityMesh({ size = 2 }: { size?: number }) {
  const tubeR = size * 0.12;
  const scale = size * 0.5;
  const segments = 256;
  const radialSegments = 24;

  // Lemniscate of Bernoulli curve
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: segments }, (_, i) => {
      const t = (i / segments) * Math.PI * 2;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = (Math.cos(t) / denom) * scale * 1.8;
      const y = (Math.cos(t) * Math.sin(t) / denom) * scale * 1.8;
      return new THREE.Vector3(x, y, 0);
    }),
    true
  );

  return (
    <AutoRotate>
      <mesh>
        <tubeGeometry args={[curve, segments, tubeR, radialSegments, true]} />
        <meshPhysicalMaterial {...glMaterial} />
      </mesh>
    </AutoRotate>
  );
}

function Lights() {
  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.5} />
      <spotLight position={[-5, 3, 4]} intensity={16} angle={0.6} penumbra={0.8} color="#bfff00" />
      <spotLight position={[5, 3, 4]} intensity={16} angle={0.6} penumbra={0.8} color="#a8e600" />
      <spotLight position={[0, -4, 3]} intensity={10} angle={0.5} penumbra={0.9} color="#bfff00" />
      <pointLight position={[-3, 0, 5]} intensity={8} color="#d4ff4d" />
      <pointLight position={[3, 0, 5]} intensity={8} color="#d4ff4d" />
      <spotLight position={[0, 4, -3]} intensity={10} angle={0.5} penumbra={0.8} color="#bfff00" />
      <pointLight position={[4, -3, -2]} intensity={8} color="#a8e600" />
      <spotLight position={[0, 5, 5]} intensity={4} angle={0.6} penumbra={0.5} color="#ffffff" />
      <spotLight position={[0, 0, 8]} intensity={10} angle={0.5} penumbra={0.7} color="#bfff00" />
      <directionalLight position={[0, 0, 6]} intensity={2} color="#ffffff" />
    </>
  );
}

function Scene({ text, shape, size }: { text?: string; shape?: string; size?: number }) {
  return (
    <>
      <Lights />

      {shape === "saturn" ? (
        <SaturnMesh size={size} />
      ) : shape === "infinity" ? (
        <InfinityMesh size={size} />
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
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 40 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
        style={{ background: "transparent" }}
      >
        <Scene text={text} shape={shape} size={size} />
      </Canvas>
    </div>
  );
}
