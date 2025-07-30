// src/components/SkillsHex.jsx
import React, { useMemo, useEffect } from "react";
import * as THREE                     from "three";
import { Html }                       from "@react-three/drei";

// ─────────────── DEBUG ───────────────
const DEBUG_CONSOLE = true;
const log = (...args) => DEBUG_CONSOLE && console.log("[IO][SkillsHex]", ...args);

// ─────────────── CONFIGURATION ───────────────
const HEX_Z_ORDER  = 1;    // Z offset for the hex grid
const HEX_OPACITY  = 0.66; // Opacity for all hex-edge meshes
const SHOW_HEX_COORD = false;

export default function SkillsHex({ width, height, hexSize = 44 }) {
  // Spacing
  const H_SP = hexSize * 1.5;
  const V_SP = hexSize * Math.sqrt(3);

  useEffect(() => {
    log("mounted", { width, height, hexSize });
    return () => log("unmounted");
  }, [width, height, hexSize]);

  // compute all hex centers in view
  const hexes = useMemo(() => {
    const out = [];
    const cMin = Math.floor((-width / 2 - hexSize * 2) / H_SP);
    const cMax = Math.ceil(( width / 2 + hexSize * 2) / H_SP);
    const rMin = Math.floor((-height / 2 - hexSize * 2) / V_SP);
    const rMax = Math.ceil(( height / 2 + hexSize * 2) / V_SP);

    for (let q = cMin; q <= cMax; q++) {
      const x    = q * H_SP;
      const yOff = (q & 1) * (V_SP / 2);
      for (let r = rMin; r <= rMax; r++) {
        const y = r * V_SP + yOff;
        if (
          x < -width/2 - hexSize*2 || x > width/2 + hexSize*2 ||
          y < -height/2 - hexSize*2|| y > height/2 + hexSize*2
        ) continue;
        out.push({ x, y, id: `${q},${r}` });
      }
    }
    log("computed hexes", out.length, { cMin, cMax, rMin, rMax });
    return out;
  }, [width, height, hexSize, H_SP, V_SP]);

  // precompute hexagon corner vectors
  const corners = useMemo(() => {
    const arr = Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i;
      return new THREE.Vector3(
        Math.cos(angle) * hexSize,
        Math.sin(angle) * hexSize,
        0
      );
    });
    log("corners computed", arr.length);
    return arr;
  }, [hexSize]);

  // single cylinder geometry for all edges
  const cylGeom  = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 1, 1, 8, 1, false);
    log("cylinder geometry created");
    return g;
  }, []);
  const cylThick = hexSize * 0.1;

  return (
    <>
      {hexes.map((h) => (
        <group key={h.id} position={[h.x, h.y, HEX_Z_ORDER]}>
          {corners.map((v, i) => {
            const v2  = corners[(i + 1) % 6];
            const dir = new THREE.Vector3().subVectors(v2, v);
            const len = dir.length();
            if (len < 1e-6) return null;

            dir.normalize();
            const mid  = v.clone().add(v2).multiplyScalar(0.5);
            const quat = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              dir
            );

            return (
              <mesh
                key={i}
                geometry={cylGeom}
                position={[mid.x, mid.y, 0]}
                quaternion={quat}
                scale={[cylThick, len, cylThick]}
              >
                <meshStandardMaterial
                  color={0xffa500}
                  emissive={0x442200}
                  emissiveIntensity={0.3}
                  roughness={0.25}
                  metalness={0.8}
                  transparent
                  opacity={HEX_OPACITY}
                />
              </mesh>
            );
          })}

          {SHOW_HEX_COORD && (
            <Html
              position={[0, 0, 1]}
              center
              style={{
                fontFamily:    "var(--font-focal-regular)",
                fontSize:      "12px",
                color:         "#ffffff",
                pointerEvents: "none"
              }}
            >
              {h.id}
            </Html>
          )}
        </group>
      ))}
    </>
  );
}
