// src/three/WaveAnimation.jsx
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useWaveAnimation } from "../contexts/WaveAnimationContext";
import PropTypes from "prop-types";

// Debug flag
const DEBUG_CONSOLE = false;

// === Extended Color Constants ===
const BG_COLOR = "#200d44";

// Now we define 9 stops with the following intended mapping:
// • Stop0: Cyan at 0%
// • Stop1: Blue at 2%
// • Stop2: Purple at 47%
// • Stop3: Bold Neon Magenta at 57%
// • Stop4: Deep Magenta (in-between magenta and yellow) at 60%
// • Stop5: Gold at 72%
// • Stop6: Orange at 75%
// • Stop7: In-between Orange–Red at 88%
// • Stop8: Red at 100%
const COLOR_0_HEX = 0x07c6fa; // New Cyan
const COLOR_1_HEX = 0x0000ff; // Blue
const COLOR_2_HEX = 0x800080; // Purple
const COLOR_3_HEX = 0xff1493; // Bold Neon Magenta
const COLOR_4_HEX = 0x9b2057; // New Deep Magenta (in-between Magenta & Yellow)
const COLOR_5_HEX = 0xffaa05; // Gold
const COLOR_6_HEX = 0xffa500; // Orange
const COLOR_7_HEX = 0xff5300; // In-between Orange–Red
const COLOR_8_HEX = 0xff0000; // Red

// === Transformation Constants ===
const DEFAULT_ZOOM = 525;
const X_OFFSET_PX = 0;
const Y_OFFSET_PX = -575;

// === Extended Gradient Proportion Constants ===
// With 9 stops, we have 8 segments. Their target cumulative percentages are:
// Stop0: 0%, Stop1: 2%, Stop2: 47%, Stop3: 57%, Stop4: 60%, Stop5: 72%, Stop6: 75%, Stop7: 88%, Stop8: 100%
const GRAD_PERCENT_SEG0 = 2;    // 0%→2%: Cyan to Blue
const GRAD_PERCENT_SEG1 = 45;   // 2%→47%: Blue to Purple
const GRAD_PERCENT_SEG2 = 10;   // 47%→57%: Purple to Bold Neon Magenta
const GRAD_PERCENT_SEG3 = 3;    // 57%→60%: Bold Neon Magenta to Deep Magenta
const GRAD_PERCENT_SEG4 = 12;   // 60%→72%: Deep Magenta to Gold
const GRAD_PERCENT_SEG5 = 3;    // 72%→75%: Gold to Orange
const GRAD_PERCENT_SEG6 = 13;   // 75%→88%: Orange to In-between Orange-Red
const GRAD_PERCENT_SEG7 = 12;   // 88%→100%: In-between Orange-Red to Red

// --- Build Gradient Arrays ---
const GRAD_COLORS = [
  new THREE.Color(COLOR_0_HEX), // Stop0: Cyan
  new THREE.Color(COLOR_1_HEX), // Stop1: Blue
  new THREE.Color(COLOR_2_HEX), // Stop2: Purple
  new THREE.Color(COLOR_3_HEX), // Stop3: Bold Neon Magenta
  new THREE.Color(COLOR_4_HEX), // Stop4: Deep Magenta
  new THREE.Color(COLOR_5_HEX), // Stop5: Gold
  new THREE.Color(COLOR_6_HEX), // Stop6: Orange
  new THREE.Color(COLOR_7_HEX), // Stop7: In-between Orange-Red
  new THREE.Color(COLOR_8_HEX)  // Stop8: Red
];

const GRAD_PERCENTAGES = [
  GRAD_PERCENT_SEG0,
  GRAD_PERCENT_SEG1,
  GRAD_PERCENT_SEG2,
  GRAD_PERCENT_SEG3,
  GRAD_PERCENT_SEG4,
  GRAD_PERCENT_SEG5,
  GRAD_PERCENT_SEG6,
  GRAD_PERCENT_SEG7
];

// -----------------------------------------------------------------------------
// Helper: Generate a hexagon‑shaped grid using axial coordinates for pointy‑topped hexes.
function generateHexGrid(radius, cellSize) {
  if (DEBUG_CONSOLE) {
    console.log("[IO][WaveAnimation] Generating hex grid with radius:", radius, "cellSize:", cellSize);
  }
  const positions = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const x = cellSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
      const y = cellSize * (1.5 * r);
      positions.push({ x, y, z: 0, q, r, phase: Math.random() * Math.PI * 2 });
    }
  }
  if (DEBUG_CONSOLE) {
    console.log("[IO][WaveAnimation] Hex grid generated with", positions.length, "positions");
  }
  return positions;
}

// -----------------------------------------------------------------------------
// HexagonParticleWave: Renders particles with a dynamic neon gradient and connection lines.
const HexagonParticleWave = () => {
  if (DEBUG_CONSOLE) console.log("[IO][WaveAnimation] Rendering HexagonParticleWave component.");

  // Grid / Layout Parameters:
  const hexRadius = 50;
  const cellSize = 0.04;
  const positions = useMemo(() => generateHexGrid(hexRadius, cellSize), [hexRadius, cellSize]);
  const count = positions.length;
  if (DEBUG_CONSOLE) console.log("[IO][WaveAnimation] Number of particles:", count);

  const { minX, maxX } = useMemo(() => {
    let mn = Infinity, mx = -Infinity;
    positions.forEach(p => {
      if (p.x < mn) mn = p.x;
      if (p.x > mx) mx = p.x;
    });
    if (DEBUG_CONSOLE) console.log("[IO][WaveAnimation] Computed minX:", mn, "maxX:", mx);
    return { minX: mn, maxX: mx };
  }, [positions]);

  // --- Instance Colors Calculation with Extended Gradient ---
  const instanceColors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    // Compute cumulative breakpoints (normalized 0-1) from GRAD_PERCENTAGES.
    const cumulativeBreakpoints = GRAD_PERCENTAGES.map((p, i) =>
      GRAD_PERCENTAGES.slice(0, i + 1).reduce((acc, val) => acc + val, 0) / 100
    );
    // For each particle, based on its normalized x (t), determine its gradient segment and blend.
    positions.forEach((p, i) => {
      const t = (p.x - minX) / (maxX - minX);
      let blended = new THREE.Color();
      let segmentIndex = 0;
      for (let j = 0; j < cumulativeBreakpoints.length; j++) {
        if (t < cumulativeBreakpoints[j]) {
          segmentIndex = j;
          break;
        }
        if (t >= cumulativeBreakpoints[cumulativeBreakpoints.length - 1]) {
          segmentIndex = cumulativeBreakpoints.length - 1;
        }
      }
      const lowerBound = segmentIndex === 0 ? 0 : cumulativeBreakpoints[segmentIndex - 1];
      const segmentWidth = cumulativeBreakpoints[segmentIndex] - lowerBound;
      const tNorm = segmentWidth > 0 ? (t - lowerBound) / segmentWidth : 0;
      blended.copy(GRAD_COLORS[segmentIndex]).lerp(GRAD_COLORS[segmentIndex + 1], tNorm);
      colors[i * 3 + 0] = blended.r;
      colors[i * 3 + 1] = blended.g;
      colors[i * 3 + 2] = blended.b;
    });
    return colors;
  }, [positions, minX, maxX, count]);

  const instancePhases = useMemo(() => {
    const phases = new Float32Array(count);
    positions.forEach((p, i) => {
      phases[i] = p.phase;
    });
    return phases;
  }, [positions, count]);

  // Connectivity: Establish neighbor relationships.
  const hexDirections = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
  ];

  const particleMap = useMemo(() => {
    const map = {};
    positions.forEach((p, i) => {
      map[`${p.q},${p.r}`] = i;
    });
    return map;
  }, [positions]);

  const candidateEdges = useMemo(() => {
    const edges = [];
    positions.forEach((p, i) => {
      hexDirections.forEach(d => {
        const key = `${p.q + d.q},${p.r + d.r}`;
        if (particleMap.hasOwnProperty(key)) {
          const j = particleMap[key];
          if (i < j) edges.push({ a: i, b: j });
        }
      });
    });
    return edges;
  }, [positions, particleMap]);

  const globalEdges = useMemo(() => {
    const pKeep = 0.7;
    const chosenEdges = [];
    const degree = new Array(count).fill(0);
    candidateEdges.forEach(edge => {
      if (Math.random() < pKeep) {
        chosenEdges.push(edge);
        degree[edge.a]++;
        degree[edge.b]++;
      }
    });
    const candidatesByParticle = {};
    candidateEdges.forEach(edge => {
      if (!candidatesByParticle[edge.a]) candidatesByParticle[edge.a] = [];
      if (!candidatesByParticle[edge.b]) candidatesByParticle[edge.b] = [];
      candidatesByParticle[edge.a].push(edge);
      candidatesByParticle[edge.b].push(edge);
    });
    for (let i = 0; i < count; i++) {
      if (degree[i] < 3) {
        const available = (candidatesByParticle[i] || []).filter(edge =>
          !chosenEdges.some(e => e.a === edge.a && e.b === edge.b)
        );
        available.sort(() => Math.random() - 0.5);
        let needed = 3 - degree[i];
        for (const edge of available) {
          chosenEdges.push(edge);
          degree[edge.a]++;
          degree[edge.b]++;
          needed--;
          if (needed <= 0) break;
        }
      }
    }
    return chosenEdges.map(edge => ({ ...edge, phase: Math.random() * Math.PI * 2 }));
  }, [candidateEdges, count]);

  // Wave Animation: Update particle z-values using several wave functions.
  const meshRef = useRef();
  const matRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { isPaused } = useWaveAnimation();
  useFrame(({ clock }) => {
    // If the wave animation is paused, skip the update.
    if (isPaused) {
      return;
    }
    const time = clock.getElapsedTime();
    positions.forEach((p, i) => {
      const wave1 = 0.15 * Math.sin(time * 1.0 - p.x * 6.0 + p.y * 3.0);
      const wave2 = 0.10 * Math.cos(time * 1.5 - p.x * 4.0 - p.y * 2.0);
      const wave3 = 0.07 * Math.sin(time * 0.8 - p.x * 10.0 + p.y * 5.0);
      const wave4 = 0.08 * Math.sin(time * 1.8 - p.x * 3.0 + p.y * 7.0);
      p.z = wave1 + wave2 + wave3 + wave4;
      dummy.position.set(p.x, p.y, p.z);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (matRef.current && matRef.current.userData.shader) {
      matRef.current.userData.shader.uniforms.uTime.value = time;
    }

  });

  // Connectivity Lines (Wireframe)
  const ParticleConnections = () => {
    const numEdges = globalEdges.length;
    const linePositions = useMemo(() => new Float32Array(numEdges * 2 * 3), [numEdges]);
    const lineColors = useMemo(() => new Float32Array(numEdges * 2 * 3), [numEdges]);
    const geometry = useMemo(() => {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      geom.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
      return geom;
    }, [linePositions, lineColors]);

    useFrame(({ clock }) => {
      const time = clock.getElapsedTime();
      let i = 0;
      globalEdges.forEach(edge => {
        const a = edge.a, b = edge.b;
        const p1 = positions[a];
        const p2 = positions[b];
        linePositions[i++] = p1.x;
        linePositions[i++] = p1.y;
        linePositions[i++] = p1.z;
        linePositions[i++] = p2.x;
        linePositions[i++] = p2.y;
        linePositions[i++] = p2.z;
      });
      geometry.attributes.position.needsUpdate = true;

      i = 0;
      globalEdges.forEach(edge => {
        const idxA = edge.a * 3, idxB = edge.b * 3;
        const colorA = new THREE.Color(
          instanceColors[idxA],
          instanceColors[idxA + 1],
          instanceColors[idxA + 2]
        );
        const colorB = new THREE.Color(
          instanceColors[idxB],
          instanceColors[idxB + 1],
          instanceColors[idxB + 2]
        );
        const avgColor = new THREE.Color(
          (colorA.r + colorB.r) / 2,
          (colorA.g + colorB.g) / 2,
          (colorA.b + colorB.b) / 2
        );
        avgColor.lerp(new THREE.Color(1, 1, 1), 0.5);
        const brightness = 0.8 + 0.6 * Math.sin(time * 2 + edge.phase);
        avgColor.multiplyScalar(brightness);
        for (let j = 0; j < 2; j++) {
          lineColors[i++] = avgColor.r;
          lineColors[i++] = avgColor.g;
          lineColors[i++] = avgColor.b;
        }
      });
      geometry.attributes.color.needsUpdate = true;
    });

    return (
      <lineSegments geometry={geometry}>
        <lineBasicMaterial vertexColors={true} transparent opacity={0.3} />
      </lineSegments>
    );
  };

  return (
    <>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <sphereGeometry args={[0.015, 24, 24]}>
          <instancedBufferAttribute attach="attributes-instanceColor" args={[instanceColors, 3]} />
          <instancedBufferAttribute attach="attributes-instancePhase" args={[instancePhases, 1]} />
        </sphereGeometry>
        <meshPhysicalMaterial
          ref={matRef}
          vertexColors={true}
          metalness={0.2}
          roughness={0.3}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          emissiveIntensity={2}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = { value: 0 };
            matRef.current.userData.shader = shader;
            shader.vertexShader =
              `
            attribute vec3 instanceColor;
            attribute float instancePhase;
            varying vec3 vInstanceColor;
            varying float vBrightness;
            uniform float uTime;
          ` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <color_vertex>",
              `#include <color_vertex>
             vInstanceColor = instanceColor;
             vBrightness = 0.5 + 0.5 * sin(uTime * 3.0 + instancePhase);`
            );
            shader.fragmentShader =
              `
            varying vec3 vInstanceColor;
            varying float vBrightness;
          ` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
              "vec4 diffuseColor = vec4( diffuse, opacity );",
              "vec4 diffuseColor = vec4( vInstanceColor * vBrightness, opacity );"
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              "vec3 totalEmissiveRadiance = emissive;",
              "vec3 totalEmissiveRadiance = 2.0 * vInstanceColor * vBrightness;"
            );
          }}
        />
      </instancedMesh>
      <ParticleConnections />
    </>
  );
};

// -----------------------------------------------------------------------------
// Main WaveAnimation component.
const WaveAnimation = ({ onReady }) => {
  const zoomFactor = DEFAULT_ZOOM / 100;
  const offsetX = X_OFFSET_PX / 100;
  const offsetY = Y_OFFSET_PX / 100;

  return (
    <Canvas
      camera={{ position: [0, -21, 21], fov: 8 }}
      style={{ width: "100%", height: "100%", background: BG_COLOR }}
      onCreated={() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onReady && onReady();
          });
        });
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={2} />
      <EffectComposer>
        <Bloom intensity={3.5} luminanceThreshold={0.05} luminanceSmoothing={0.1} />
      </EffectComposer>
      <group scale={[zoomFactor, zoomFactor, zoomFactor]} position={[offsetX, offsetY, 0]}>
        <group rotation={[0, 0, 0]}>
          <HexagonParticleWave />
        </group>
      </group>
    </Canvas>
  );
};

export default WaveAnimation;

WaveAnimation.propTypes = {
  onReady: PropTypes.func
};