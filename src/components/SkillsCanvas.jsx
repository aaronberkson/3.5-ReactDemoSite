// src/components/SkillsCanvas.jsx
import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";

// Lazily load the 3D scene
const SkillsScene = React.lazy(() => import("./SkillsScene"));

// Notifies parent once the scene and preload are ready
function CallOnReady({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export default function SkillsCanvas({ width = 1, height = 1, onReady }) {
  // Ensure fallbacks for invalid dimensions
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1;

  // Radial mask to fade out edges
  const maskValue = `radial-gradient(
    circle at center,
    rgba(0,0,0,1) 75%,
    rgba(0,0,0,0) 100%
  )`;
  const maskStyle = {
    maskImage: maskValue,
    maskSize: "100% 100%",
    maskPosition: "center center",
    maskRepeat: "no-repeat",
    maskMode: "alpha",
    WebkitMaskImage: maskValue,
    WebkitMaskSize: "100% 100%",
    WebkitMaskPosition: "center center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskMode: "alpha",
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        orthographic
        flat
        dpr={typeof window !== "undefined" ? window.devicePixelRatio : 1}
        gl={{ antialias: true }}
        camera={{
          left:   -safeWidth  / 2,
          right:   safeWidth  / 2,
          bottom: -safeHeight / 2,
          top:     safeHeight / 2,
          near:   -1000,
          far:     1000,
          position: [0, 0, 500],
          zoom:     1,
        }}
        style={{
          width:   "100%",
          height:  "100%",
          display: "block",
          ...maskStyle,
        }}
        onCreated={({ gl, camera, size }) => {
          // Canvas and camera are initialized; optionally notify here
        }}
      >
        <Suspense fallback={null}>
          <SkillsScene width={safeWidth} height={safeHeight} />
          {/* This forces GPU‐side shader & material compilation up front */}
          <Preload all />
          {onReady && <CallOnReady onReady={onReady} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
