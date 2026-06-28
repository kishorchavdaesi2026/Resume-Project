"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Stars, MeshDistortMaterial } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

// ----------------------------------------------------
// WebGL 3D SCENE CONTENT
// ----------------------------------------------------
function FloatingScene() {
  const documentRef = useRef<THREE.Mesh>(null);
  const sphereRef1 = useRef<THREE.Mesh>(null);
  const sphereRef2 = useRef<THREE.Mesh>(null);
  
  const { mouse } = useThree();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Mouse interactive rotation for the main glass resume document
    if (documentRef.current) {
      documentRef.current.rotation.x = THREE.MathUtils.lerp(
        documentRef.current.rotation.x,
        (mouse.y * Math.PI) / 6,
        0.05
      );
      documentRef.current.rotation.y = THREE.MathUtils.lerp(
        documentRef.current.rotation.y,
        (mouse.x * Math.PI) / 6,
        0.05
      );
      documentRef.current.position.y = Math.sin(time) * 0.15;
    }

    // Floating animation for ambient backdrop objects
    if (sphereRef1.current) {
      sphereRef1.current.position.y = 2 + Math.sin(time * 0.7) * 0.3;
      sphereRef1.current.position.x = 3 + Math.cos(time * 0.5) * 0.2;
    }
    if (sphereRef2.current) {
      sphereRef2.current.position.y = -2 + Math.cos(time * 0.8) * 0.3;
      sphereRef2.current.position.x = -3 + Math.sin(time * 0.6) * 0.2;
    }
  });

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight position={[5, 15, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />

      {/* Main Glass Resume Plate */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={documentRef} castShadow receiveShadow>
          {/* Box representing a rectangular standard A4 sheet in 3D aspect ratio */}
          <boxGeometry args={[3, 4.2, 0.08]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9} // Glass opacity
            roughness={0.15}
            metalness={0.1}
            ior={1.5} // Index of Refraction
            thickness={1.2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            shadowSide={THREE.DoubleSide}
          />
        </mesh>

        {/* Dynamic Holographic resume lines overlaid on the sheet */}
        <mesh position={[0, 1.2, 0.05]}>
          <planeGeometry args={[2.2, 0.1]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.4, 0.8, 0.05]}>
          <planeGeometry args={[1.4, 0.06]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.2, 0.05]}>
          <planeGeometry args={[2.2, 0.04]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.2, 0.04]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
        </mesh>
        <mesh position={[-0.2, -0.4, 0.05]}>
          <planeGeometry args={[1.8, 0.04]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
        </mesh>
      </Float>

      {/* Backdrop Floating Sphere 1 (Cyan Theme) */}
      <mesh ref={sphereRef1} position={[3, 2, -2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color="#06b6d4"
          speed={3}
          distort={0.4}
          radius={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Backdrop Floating Sphere 2 (Purple Theme) */}
      <mesh ref={sphereRef2} position={[-3, -2, -3]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          speed={2}
          distort={0.3}
          radius={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Interactive Sparkles / Floating Dust */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={1} />
    </>
  );
}

// ----------------------------------------------------
// MAIN COMPONENT WRAPPER (Defensive SSR Handling)
// ----------------------------------------------------
export default function HeroCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // SSR Fallback (stunning absolute layout)
    return (
      <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[420px] rounded-2xl glass-panel border border-white/20 animate-pulse flex flex-col gap-6 p-6">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20" />
          <div className="w-full h-8 bg-blue-500/10 rounded" />
          <div className="w-3/4 h-4 bg-slate-500/10 rounded" />
          <div className="w-full h-4 bg-slate-500/10 rounded" />
          <div className="w-5/6 h-4 bg-slate-500/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] lg:h-screen relative z-10">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <FloatingScene />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}

// React 19 / Next 15 client-side suspense helper
import { Suspense } from "react";
