import React, { Suspense, useEffect } from "react";
import { Canvas }                      from "@react-three/fiber";
import { Html }                        from "@react-three/drei";
const ExpScene = React.lazy(() => import("./ExpScene"));

const DEBUG_CONSOLE = true;
const log = (...args) => DEBUG_CONSOLE && console.log("[IO][ExpCanvas]", ...args);

function LoadingFallback() {
  useEffect(() => { log("Fallback mount") ; return () => log("Fallback unmount") }, []);
  return (
    <Html center>
      <div>Loading…</div>
    </Html>
  );
}

export default function ExpCanvas({
  dims,
  layoutFrom,
  layoutTo,
  visible,
  prevVisible,
  topRowHeight
}) {
  log("ExpCanvas render", { dims, visible: visible.length });

  return (
    <Canvas
      orthographic flat shadows
      dpr={window?.devicePixelRatio || 1}
      gl={{ antialias: true }}
      camera={{
        left: 0, right: dims.width,
        bottom: 0, top: dims.gridH + topRowHeight,
        near: -1000, far: 1000, position: [0,0,150], zoom:1
      }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl, camera, size }) => {
        log("Canvas created", { size, frustum: [camera.left, camera.top] });
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {log("rendering <ExpScene>")}
        <ExpScene
          dims={dims}
          layoutFrom={layoutFrom}
          layoutTo={layoutTo}
          visible={visible}
          prevVisible={prevVisible}
          topRowHeight={topRowHeight}
        />
      </Suspense>
    </Canvas>
  );
}
