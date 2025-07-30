// src/components/SkillsCoinLogo.jsx
import React, { useRef, useMemo, useLayoutEffect } from "react";
import {
  ExtrudeGeometry,
  ShapeGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  DoubleSide,
  Color,
  CanvasTexture,
  LinearFilter
} from "three";

/**
 * SkillsCoinLogo
 *
 * Props:
 * - preparedLogo: { extrudes, flats, bounds } from logoBuilder cache
 * - paths: fallback SVGLoader.paths[]
 * - size, depth, extrudeFactor, sideBrightness
 */
export default function SkillsCoinLogo({
  preparedLogo = null,
  paths = [],
  size = 1,
  depth = 1,
  extrudeFactor = 1,
  sideBrightness = 0.3
}) {
  const groupRef = useRef();
  const meshRef  = useRef();

  // If we already ran prepareLogo(), just reuse that result.
  // Otherwise parse/build as before.
  const { extrudes, flats, bounds } = useMemo(() => {
    if (preparedLogo) return preparedLogo;

    // ───────── Legacy build ─────────
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // collect gradients & CSS fills (exactly your old logic)
    const svgRoot     = paths[0]?.userData.node?.ownerSVGElement;
    const gradientMap = {};
    if (svgRoot) {
      svgRoot.querySelectorAll("linearGradient").forEach((g) => {
        const stops = Array.from(g.querySelectorAll("stop"))
          .map((s) => s.getAttribute("stop-color"))
          .filter(Boolean);
        if (stops.length) gradientMap[g.id] = stops;
      });
    }

    const classFillMap = {};
    if (svgRoot) {
      const cssText = svgRoot.querySelector("style")?.textContent || "";
      const re = /\.([A-Za-z0-9_-]+)\s*\{\s*fill:\s*(#[0-9A-Fa-f]{3,6})/g;
      let m;
      while ((m = re.exec(cssText))) {
        classFillMap[m[1]] = m[2];
      }
    }

    // build items
    const items = paths.map((p) => {
      const node       = p.userData.node;
      const styleFill  = p.userData.style.fill;
      const attrFill   = node.getAttribute("fill");
      const styleMatch = node.getAttribute("style")
        ?.match(/fill\s*:\s*(#[0-9A-Fa-f]{3,6})/i)?.[1] || null;

      // inline vs CSS vs attr
      const inlineFill = styleFill && !styleFill.startsWith("url(")
        ? styleFill
        : null;

      let cssFill = null, el = node;
      while (el?.getAttribute && !cssFill) {
        (el.getAttribute("class") || "").split(/\s+/).forEach((cls) => {
          if (!cssFill && classFillMap[cls]) cssFill = classFillMap[cls];
        });
        el = el.parentElement;
      }

      // gradient detection
      const gm         = attrFill?.match(/^url\(#(.+)\)$/);
      const stops      = gm ? gradientMap[gm[1]] || [] : [];
      const solidColor = inlineFill && inlineFill !== "none" ? inlineFill
                        : attrFill   && attrFill   !== "none" ? attrFill
                        : styleMatch                        ? styleMatch
                        : cssFill                           ? cssFill
                        : "#ffffff";
      const frontC = new Color(solidColor);

      // compute side color
      const hsl = { h:0, s:0, l:0 };
      frontC.getHSL(hsl);
      const darkL = Math.max(0, hsl.l - 0.3);
      const lightL = Math.min(1, hsl.l + 0.2);
      const sideL = darkL + (lightL - darkL) * sideBrightness;
      const sideC = new Color().setHSL(hsl.h, hsl.s, sideL);

      // front material
      let flatMat;
      if (stops.length >= 2) {
        // bake simple two‐stop gradient into a 512×1 canvas
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 1;
        const ctx = canvas.getContext("2d");
        const gtx = ctx.createLinearGradient(0,0,512,0);
        gtx.addColorStop(0, stops[0]);
        gtx.addColorStop(1, stops[1]);
        ctx.fillStyle = gtx;
        ctx.fillRect(0,0,512,1);

        const tex = new CanvasTexture(canvas);
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.needsUpdate = true;

        flatMat = new MeshBasicMaterial({
          map: tex,
          side: DoubleSide,
          depthTest: false,
          depthWrite: false,
          toneMapped: false
        });
      } else {
        flatMat = new MeshBasicMaterial({
          color: frontC,
          side: DoubleSide,
          depthTest: false,
          depthWrite: false,
          toneMapped: false
        });
      }

      const extrudeMat = new MeshStandardMaterial({
        color: sideC,
        emissive: sideC,
        emissiveIntensity: sideBrightness,
        roughness: 0.3,
        metalness: 0.6,
        side: DoubleSide
      });

      // shapes
      const doSplit = node.getAttribute("data-split") === "true";
      let shapes = p.toShapes(doSplit);
      if (node.getAttribute("fill-rule") === "evenodd") {
        shapes.forEach((shape) =>
          shape.holes.forEach((hole) => hole.getPoints().reverse())
        );
      }

      // update bounds
      shapes.forEach((shape) =>
        shape.getPoints().forEach(({x,y}) => {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        })
      );

      return { shapes, flatMat, extrudeMat };
    });

    if (!isFinite(minX)) [minX, minY, maxX, maxY] = [0,0,0,0];
    const rawW   = maxX - minX;
    const rawH   = maxY - minY;
    const rawMax = Math.max(rawW, rawH, 1);
    const scale  = size / rawMax;
    const realDepth = (depth * extrudeFactor) / scale;

    const extrudesArr = [], flatsArr = [];
    items.forEach(({ shapes, flatMat, extrudeMat }) => {
      shapes.forEach((shape) => {
        const eg = new ExtrudeGeometry(shape, {
          depth: realDepth,
          bevelEnabled: true,
          bevelSegments: 6,
          bevelSize: realDepth * 0.03,
          bevelThickness: realDepth * 0.08
        });
        eg.scale(1, -1, 1);
        extrudesArr.push({ geometry: eg, material: extrudeMat.clone() });

        const fg = new ShapeGeometry(shape);
        fg.scale(1, -1, 1);
        fg.translate(0, 0, realDepth + 0.01);
        flatsArr.push({ geometry: fg, material: flatMat.clone() });
      });
    });

    return {
      extrudes: extrudesArr,
      flats:    flatsArr,
      bounds:   { minX, minY, maxX, maxY }
    };
  }, [preparedLogo, paths, size, depth, extrudeFactor, sideBrightness]);

  // center & scale
  useLayoutEffect(() => {
    const { minX, minY, maxX, maxY } = bounds;
    meshRef.current.position.set(
      -(minX + maxX) / 2,
      (minY + maxY) / 2,
      0
    );
    const rawMax = Math.max(maxX - minX, maxY - minY, 1);
    const s = size / rawMax;
    groupRef.current.scale.set(s, s, s);
  }, [bounds, size]);

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        {flats.map((f,i) => <mesh key={i} geometry={f.geometry} material={f.material} />)}
        {extrudes.map((e,i) => (
          <mesh
            key={i}
            geometry={e.geometry}
            material={e.material}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    </group>
  );
}
