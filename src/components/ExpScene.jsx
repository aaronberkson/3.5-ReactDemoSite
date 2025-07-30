// src/components/ExpScene.jsx
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useThree }                                 from "@react-three/fiber";
import { OrthographicCamera }                       from "@react-three/drei";
import { useSpring, a, config }                     from "@react-spring/three";
import { lazyWithPreload }                          from "../utilities/lazyWithPreload";

// code‑split your heavy <ExpFloatLogo> component
const ExpFloatLogo = lazyWithPreload(() => import("./ExpFloatLogo"));

export default function ExpScene({
  dims,
  layoutFrom,
  layoutTo,
  visible,
  prevVisible,
  topRowHeight = 0
}) {
  const firstMount = useRef(true);
  const { width, gridH } = dims;
  const { camera, gl, size } = useThree();

  // resize camera once
  useEffect(() => {
    gl.setSize(size.width, size.height);
    camera.left   = 0;
    camera.right  = width;
    camera.bottom = 0;
    camera.top    = gridH + topRowHeight;
    camera.updateProjectionMatrix();
  }, [size.width, size.height, width, gridH, topRowHeight, camera, gl]);

  const [data, setData] = useState({ items: prevVisible, layout: layoutFrom });
  const [spring, api]  = useSpring(() => ({ y: 0 }));

  useEffect(() => {
    if (firstMount.current) {
      setData({ items: visible, layout: layoutTo });
      firstMount.current = false;
      return;
    }
    (async () => {
      await api.start({ y: -(gridH + topRowHeight), config: { ...config.default, duration: 400 } });
      setData({ items: visible, layout: layoutTo });
      api.set({ y: gridH + topRowHeight });
      await api.start({ y: 0, config: { ...config.wobbly, mass:1, tension:200, friction:20 } });
    })();
  }, [visible, layoutTo, gridH, topRowHeight, api]);

  return (
    <>
      <OrthographicCamera
        makeDefault
        left={0} right={width}
        bottom={0} top={gridH + topRowHeight}
        near={-1000} far={1000}
        position={[0,0,150]} zoom={1}
      />

      <Suspense fallback={null}>
        <a.group position-y={spring.y}>
          {data.items.map(item => {
            const [x = 0, y = 0] = data.layout[item.svgPath] || [];
            return (
              <group key={item.svgPath} position={[x, y, 0]}>
                <ExpFloatLogo {...item} />
              </group>
            );
          })}
        </a.group>
      </Suspense>
    </>
  );
}
