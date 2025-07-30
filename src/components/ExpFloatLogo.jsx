import React, {
  useRef,
  useMemo,
  useLayoutEffect,
  useEffect,
  useState
} from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { SVGLoader }           from "three/examples/jsm/loaders/SVGLoader";
import {
  ExtrudeGeometry,
  ShapeGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  DoubleSide,
  Color
} from "three";

// suppress SVGLoader warnings
SVGLoader.DEFAULT_NODE_MATERIAL = false;

const cache = new Map();

export default function ExpFloatLogo({
  svgPath,
  link,
  depth = 50,
  scale = 0.6,
  tiltX = 0.1,
  sideBrightness = 0.33
}) {
  const groupRef = useRef();
  const meshRef  = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const parCurrent = useRef([0,0]);
  const parTarget  = useRef([0,0]);

  // 1) load SVG once (preloaded globally)
  const { paths } = useLoader(SVGLoader, svgPath);

  // 2) generate extrudes/flats/bounds/plane (cached)
  const { extrudes, flats, bounds, planeGeo } = useMemo(() => {
    const key = `${svgPath}|${depth}|${sideBrightness}`;
    if (cache.has(key)) return cache.get(key);

    let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    const extrudes = [], flats = [];

    paths.forEach(path => {
      const style = path.userData.style || {};
      const raw = style.fill && style.fill!=="none"
        ? style.fill
        : style.stroke && style.stroke!=="none"
          ? style.stroke
          : "#000";
      const frontC = new Color(raw);

      // side color
      const hsl = { h:0, s:0, l:0 };
      frontC.getHSL(hsl);
      const darkL  = Math.max(0, hsl.l - 0.3);
      const lightL = Math.min(1, hsl.l + 0.2);
      const sideL  = darkL + (lightL - darkL) * sideBrightness;
      const sideC  = new Color().setHSL(hsl.h, hsl.s, sideL);

      const flatMat = new MeshBasicMaterial({
        color: frontC,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false
      });
      const extrudeMat = new MeshStandardMaterial({
        color: sideC,
        emissive: sideC,
        emissiveIntensity: sideBrightness,
        roughness: 0.4,
        metalness: 0.2,
        side: DoubleSide
      });

      const node = path.userData.node;
      const shapes = path.toShapes(node?.getAttribute("data-split")==="true");

      shapes.forEach(shape => {
        shape.getPoints().forEach(p => {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        });

        const d = node?.getAttribute("double-extrude")==="true" ? depth*2 : depth;
        // extrude
        const eg = new ExtrudeGeometry(shape, {
          depth: d,
          bevelEnabled: true,
          bevelThickness: d*0.08,
          bevelSize:      d*0.03,
          bevelSegments:  6
        });
        eg.scale(1, -1, 1);
        eg.translate(0, 0, -d/2);
        extrudes.push({ geometry: eg, material: extrudeMat.clone() });

        // flat cap
        const fg = new ShapeGeometry(shape);
        fg.scale(1, -1, 1);
        fg.translate(0, 0, d/2 + 0.01);
        flats.push({ geometry: fg, material: flatMat.clone() });
      });
    });

    const w = maxX - minX, h = maxY - minY;
    const planeGeo = new PlaneGeometry(w*1.1, h*1.1);
    const bounds = { minX, minY, maxX, maxY };
    const result = { extrudes, flats, bounds, planeGeo };
    cache.set(key, result);
    return result;
  }, [paths, svgPath, depth, sideBrightness]);

  // center pivot
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const { minX, minY, maxX, maxY } = bounds;
    const cx = (minX + maxX)/2, cy = (minY + maxY)/2;
    meshRef.current.position.set(-cx, cy, 0);
  }, [bounds]);

  // apply scale & tilt
  useLayoutEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.scale.set(scale, scale, scale);
    groupRef.current.rotation.x = tiltX;
  }, [scale, tiltX]);

  // reset click
  useEffect(() => {
    if (!clicked) return;
    const id = setTimeout(() => setClicked(false), 100);
    return () => clearTimeout(id);
  }, [clicked]);

  // animation loop
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // scale spring
    let target = scale;
    if (clicked) target = scale * 0.95;
    else if (hovered) target = scale * 1.1;
    const cur = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(cur + (target - cur) * 0.06);

    if (!hovered && !clicked) {
      // idle bob & wobble
      groupRef.current.rotation.y = Math.sin(t*0.3)*0.2;
      groupRef.current.position.x = Math.sin(t*0.6)*0.1;
      groupRef.current.position.y = Math.cos(t*0.6)*0.05 + Math.sin(t*1.2)*0.15;
      groupRef.current.position.z = Math.sin(t*1.5)*0.2;
      groupRef.current.rotation.x = Math.sin(t*0.25)*0.05 + tiltX;
    } else {
      // parallax
      let [tx, ty] = parTarget.current;
      let [cx, cy] = parCurrent.current;
      cx += (tx - cx)*0.08; cy += (ty - cy)*0.08;
      parCurrent.current = [cx, cy];
      groupRef.current.rotation.y = cx*0.3;
      groupRef.current.rotation.x = tiltX + cy*0.3;
      groupRef.current.position.y = Math.sin(t*1.2)*0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        geometry={planeGeo}
        material={new MeshBasicMaterial({ transparent:true, opacity:0, side:DoubleSide })}
        position={[0,0, depth/2 + 0.02]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor="pointer"; }}
        onPointerOut ={e => { e.stopPropagation(); setHovered(false); document.body.style.cursor="auto"; }}
        onPointerMove={e => {
          e.stopPropagation();
          const p = e.object.worldToLocal(e.point.clone());
          const { minX, minY, maxX, maxY } = bounds;
          parTarget.current = [
            Math.max(-1, Math.min(1, p.x/((maxX-minX)/2))),
            Math.max(-1, Math.min(1, p.y/((maxY-minY)/2)))
          ];
        }}
        onPointerDown={e => {
          e.stopPropagation();
          setClicked(true);
          if (link) setTimeout(() => window.open(link, "_blank"), 100);
        }}
      />
      <group ref={meshRef}>
        {extrudes.map((e,i) =>
          <mesh key={i} geometry={e.geometry} material={e.material} castShadow receiveShadow />
        )}
        {flats.map((f,i) =>
          <mesh key={`f${i}`} geometry={f.geometry} material={f.material} />
        )}
      </group>
    </group>
  );
}
