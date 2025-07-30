import React, { useEffect, Suspense } from "react";
import { useLoader }                  from "@react-three/fiber";
import { SVGLoader }                  from "three/examples/jsm/loaders/SVGLoader";
import { useAppReady }                from "../contexts/AppReadyContext";
import { prepareLogo }                from "../utilities/prepareLogo";
import { ALL_SKILL_LOGO_URLS }        from "../data/skillsLogoData";

// Lazy‑load the actual SkillsCanvas for code‑splitting
const SkillsCanvas = React.lazy(() => import("./SkillsCanvas"));

// Silence warnings about SVG node materials
SVGLoader.DEFAULT_NODE_MATERIAL = false;

export default function PreloadSkillsAssets() {
  const { setSkillsAssetsLoaded, setPagesReady } = useAppReady();

  useEffect(() => {
    // 1) Prefetch the code bundles for Canvas and Scene
    import(/* webpackPrefetch: true */ "./SkillsCanvas").catch(() => {});
    import(/* webpackPrefetch: true */ "./SkillsScene").catch(() => {});

    // 2) Prime the SVGLoader so individual loads never block
    useLoader.preload(SVGLoader, ALL_SKILL_LOGO_URLS);

    // 3) Build and cache each SVG’s geometry off‑thread
    let i = 0;
    const buildNext = () => {
      if (i >= ALL_SKILL_LOGO_URLS.length) {
        setSkillsAssetsLoaded(true);
        return;
      }
      const url = ALL_SKILL_LOGO_URLS[i++];
      prepareLogo(url)
        .catch(() => {})
        .finally(() => {
          if (window.requestIdleCallback) {
            requestIdleCallback(buildNext);
          } else {
            setTimeout(buildNext, 0);
          }
        });
    };
    buildNext();
  }, [setSkillsAssetsLoaded]);

  // Hidden warm‑up dimensions match SkillsCanvas
  const width  = typeof window !== "undefined" ? window.innerWidth : 1;
  const height = 590;

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
        <SkillsCanvas
          width={width}
          height={height}
          onReady={() => {
            // Give two frames to ensure the scene fully initializes
            requestAnimationFrame(() =>
              requestAnimationFrame(() => setPagesReady(true))
            );
          }}
        />
      </Suspense>
    </div>
  );
}
