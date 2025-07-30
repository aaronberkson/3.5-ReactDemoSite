// src/components/SkillsLogo.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";

// ───────────── DEBUG ─────────────
const DEBUG_CONSOLE = true;
const log = (...args) => {
  if (DEBUG_CONSOLE) console.log("[IO][SkillsLogo]", ...args);
};

// axial → screen coords
function axialToXY([q, r], size) {
  return [
    size * 1.5 * q,
    size * Math.sqrt(3) * (r + q / 2)
  ];
}

export default function SkillsLogo({
  q,
  r,
  svg,
  label,
  link,
  size,
  scale = 1
}) {
  const [hovered, setHovered] = useState(false);

  // compute position once per prop change
  const [x, y] = useMemo(() => {
    const pos = axialToXY([q, r], size);
    log("compute axialToXY", { q, r, size, x: pos[0], y: pos[1] });
    return pos;
  }, [q, r, size]);

  const cs  = 80 * scale;
  const isz = 32 * scale;

  // mount/unmount
  useEffect(() => {
    log("mounted", { svg, label, link, scale });
    return () => log("unmounted");
  }, [svg, label, link, scale]);

  // render pass
  log("render", { q, r, size, scale, hovered });

  return (
    <group position={[x, y, 0]}>
      <mesh
        onPointerOver={() => {
          if (!hovered) log("hover on", { label });
          setHovered(true);
        }}
        onPointerOut={() => {
          if (hovered) log("hover off", { label });
          setHovered(false);
        }}
      >
        <circleGeometry args={[size * 1.15, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Html center>
        <motion.a
          href={link || undefined}
          target={link ? "_blank" : undefined}
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            width:          cs,
            height:         cs,
            fontFamily:     "var(--font-focal-medium)",
            fontSize:       12 * scale,
            color:          "#fff",
            textDecoration: "none",
            pointerEvents:  "auto"
          }}
          animate={{ scale: hovered ? 1.3 : 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          onClick={() => link && log("clicked", { label, link })}
        >
          <img
            src={svg}
            alt={label}
            style={{ width: isz, height: isz, marginBottom: 4 }}
            onLoad={() => log("img loaded", { svg })}
            onError={(e) => log("img error", { svg, error: e.message })}
          />
          {label && <span>{label}</span>}
        </motion.a>
      </Html>
    </group>
  );
}
