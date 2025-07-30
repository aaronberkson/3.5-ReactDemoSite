import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// === Color Constants ===
const BG_COLOR = "#200d44";
const COLOR_0_HEX = 0x0000FF; // Blue
const COLOR_1_HEX = 0x800080; // Purple
const COLOR_2_HEX = 0xFF1493; // Pink
const COLOR_3_HEX = 0xFFA500; // Orange
const COLOR_4_HEX = 0xFF0000; // Red

// === Transformation Constants ===
// DEFAULT_ZOOM is in percent (100 means 100%, i.e. scale factor 1)
const DEFAULT_ZOOM = 525;  
// X and Y offsets are in browser pixels; here we use an arbitrary conversion factor (1/100) so that 100 pixels = 1 unit.
const X_OFFSET_PX = 0;  
const Y_OFFSET_PX = -575;  

// === Gradient Proportion Constants ===
// Specify the percentage (out of 100) for each gradient segment.  
// They must add up to 100. For an even gradient, use 25 each.
const GRAD_PERCENT_SEG0 = 25; // Percentage for Blue → Purple
const GRAD_PERCENT_SEG1 = 25; // Percentage for Purple → Pink
const GRAD_PERCENT_SEG2 = 25; // Percentage for Pink → Orange
const GRAD_PERCENT_SEG3 = 25; // Percentage for Orange → Red

// -----------------------------------------------------------------------------
// Helper: Generate a hexagon‐shaped grid using axial coordinates for pointy‑topped hexes.
// "radius" is the number of cells from the center to an edge.
function generateHexGrid(radius, cellSize) {
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
  return positions;
}

// -----------------------------------------------------------------------------
// HexagonParticleWave: Renders the particles, applies a five-stop neon gradient,
// animates the particles with a multi-wave pattern, and draws connectivity lines.
const HexagonParticleWave = () => {
  // Grid / Layout Parameters:
  const hexRadius = 50;   // Twice as large as before for more particles over a larger area.
  const cellSize = 0.04;  // Same spacing so density remains similar.
  const positions = useMemo(() => generateHexGrid(hexRadius, cellSize), [hexRadius, cellSize]);
  const count = positions.length;
  
  // Compute overall horizontal range for gradient calculation.
  const { minX, maxX } = useMemo(() => {
    let mn = Infinity, mx = -Infinity;
    positions.forEach(p => {
      if (p.x < mn) mn = p.x;
      if (p.x > mx) mx = p.x;
    });
    return { minX: mn, maxX: mx };
  }, [positions]);
  
  // Compute the normalized boundaries from the percentage constants.
  const b0 = GRAD_PERCENT_SEG0 / 100;  
  const b1 = b0 + GRAD_PERCENT_SEG1 / 100;  
  const b2 = b1 + GRAD_PERCENT_SEG2 / 100;  
  const b3 = b2 + GRAD_PERCENT_SEG3 / 100;  // Ideally, b3 should equal 1.
  
  // Compute per-particle neon colors based on horizontal position.
  const instanceColors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const blue = new THREE.Color(COLOR_0_HEX);
    const purple = new THREE.Color(COLOR_1_HEX);
    const pink = new THREE.Color(COLOR_2_HEX);
    const orange = new THREE.Color(COLOR_3_HEX);
    const red = new THREE.Color(COLOR_4_HEX);
    
    positions.forEach((p, i) => {
      const t = (p.x - minX) / (maxX - minX); // normalized value from 0 to 1
      let blended = new THREE.Color();
      if (t < b0) {
        const tNorm = t / b0;
        blended.copy(blue).lerp(purple, tNorm);
      } else if (t < b1) {
        const tNorm = (t - b0) / (b1 - b0);
        blended.copy(purple).lerp(pink, tNorm);
      } else if (t < b2) {
        const tNorm = (t - b1) / (b2 - b1);
        blended.copy(pink).lerp(orange, tNorm);
      } else {
        const tNorm = (t - b2) / (b3 - b2);
        blended.copy(orange).lerp(red, tNorm);
      }
      colors[i * 3 + 0] = blended.r;
      colors[i * 3 + 1] = blended.g;
      colors[i * 3 + 2] = blended.b;
    });
    return colors;
  }, [positions, minX, maxX, count, b0, b1, b2, b3]);
  
  // Per-particle phase for shimmer.
  const instancePhases = useMemo(() => {
    const phases = new Float32Array(count);
    positions.forEach((p, i) => {
      phases[i] = p.phase;
    });
    return phases;
  }, [positions, count]);
  
  // ---------------------------------------------------------------------------
  // Connectivity (Wireframe): Use natural hex neighbor relations.
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
          if (i < j) {
            edges.push({ a: i, b: j });
          }
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
    return chosenEdges.map(edge => ({
      ...edge,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [candidateEdges, count]);
  
  // ---------------------------------------------------------------------------
  // Wave Animation: Update each particle's z using four wave components.
  const meshRef = useRef();
  const matRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useFrame(({ clock }) => {
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
  
  // ---------------------------------------------------------------------------
  // Particles Instanced Mesh with Shimmering Shader.
  const Particles = useMemo(() => (
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
          shader.vertexShader = `
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
          shader.fragmentShader = `
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
  ), [count, instanceColors, instancePhases]);
  
  // ---------------------------------------------------------------------------
  // Connectivity Lines (Wireframe) with Increased Connector Shimmer.
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
  
  // ---------------------------------------------------------------------------
  return (
    <>
      {Particles}
      <ParticleConnections />
    </>
  );
};

// -----------------------------------------------------------------------------
// Main WaveAnimation component.
// Here, we apply a wrapping group to control zoom (scale) and offset (translation)
// based on constants. The conversion from pixels to scene units is heuristic; adjust
// the divisor (here 100) as needed.
const WaveAnimation = () => {
  const zoomFactor = DEFAULT_ZOOM / 100; // e.g. 100% → 1, 200% → 2, etc.
  const offsetX = X_OFFSET_PX / 100;       // conversion factor for pixels to scene units
  const offsetY = Y_OFFSET_PX / 100;

  return (
    <Canvas
      camera={{ position: [0, -21, 21], fov: 8 }}
      style={{ width: "100%", height: "100%", background: BG_COLOR }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={2} />
      <EffectComposer>
        <Bloom intensity={3.5} luminanceThreshold={0.05} luminanceSmoothing={0.1} />
      </EffectComposer>
      {/* Wrapping group that applies zoom and offset */}
      <group scale={[zoomFactor, zoomFactor, zoomFactor]} position={[offsetX, offsetY, 0]}>
        <group rotation={[0, 0, 0]}>
          <HexagonParticleWave />
        </group>
      </group>
    </Canvas>
  );
};

export default WaveAnimation;
