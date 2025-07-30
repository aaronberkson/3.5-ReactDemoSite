import React, { useEffect, Suspense } from "react";
import { useLoader }                  from "@react-three/fiber";
import { SVGLoader }                  from "three/examples/jsm/loaders/SVGLoader";
import { useAppReady }                from "../contexts/AppReadyContext";
import { prepareLogo }                from "../utilities/prepareLogo";
import experienceLogoUrls             from "../utilities/experienceLogoUrls";

// lazy‑load the real canvas & scene
const ExpCanvas = React.lazy(() => import("./ExpCanvas"));
const ExpScene  = React.lazy(() => import("./ExpScene"));

// silence three’s SVGLoader warnings
SVGLoader.DEFAULT_NODE_MATERIAL = false;

export default function PreloadExperienceAssets() {
  const { setExpAssetsLoaded, setPagesReady } = useAppReady();

  useEffect(() => {
    // 1) Prefetch code bundles
    import(/* webpackPrefetch: true */ "./ExpCanvas").catch(() => {});
    import(/* webpackPrefetch: true */ "./ExpScene").catch(() => {});

    // 2) Prime SVG parsing so individual <ExpFloatLogo> loads never stall
    useLoader.preload(SVGLoader, experienceLogoUrls);

    // 3) Off‑thread build & cache each SVG’s geometry
    let i = 0;
    const next = () => {
      if (i >= experienceLogoUrls.length) {
        setExpAssetsLoaded(true);
        return;
      }
      const url = experienceLogoUrls[i++];
      prepareLogo(url)
        .catch(() => {}) // swallow any individual error
        .finally(() => {
          if (window.requestIdleCallback) requestIdleCallback(next);
          else setTimeout(next, 0);
        });
    };
    next();
  }, [setExpAssetsLoaded]);

  // compute the exact same dims that <Experience> will pass to <ExpCanvas>
  const width = typeof window !== "undefined" ? window.innerWidth : 1;
  const cols  = 3;
  const cellW = width / cols;
  const cellH = cellW;
  const rows  = Math.ceil(experienceLogoUrls.length / cols);
  const gridH = cellH * rows;
  const dims  = { width, cols, cellW, cellH, rows, gridH };

  // render a hidden warm‑up canvas to compile shaders & fire onReady
  return (
    <div
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        visibility:    "hidden",
        pointerEvents: "none",
        zIndex:        -1,
      }}
    >
      <Suspense fallback={null}>
        <ExpCanvas
          dims={dims}
          layoutFrom={dims}
          layoutTo={dims}
          visible={experienceLogoUrls}
          prevVisible={experienceLogoUrls}
          direction={1}
          onReady={() => {
            // wait two frames to ensure the scene is fully “woken up”
            requestAnimationFrame(() =>
              requestAnimationFrame(() => setPagesReady(true))
            );
          }}
        />
      </Suspense>
    </div>
  );
}
