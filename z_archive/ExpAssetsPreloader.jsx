// src/components/ExpAssetsPreloader.jsx
import React, { useEffect }        from "react";
import { useLoader }               from "@react-three/fiber";
import { SVGLoader }               from "three/examples/jsm/loaders/SVGLoader";
import { useAppReady }             from "../contexts/AppReadyContext";
import ExpCanvas                   from "./ExpCanvas";
import logos                       from "../data/experienceLogos";
import { prepareLogo }             from "../utilities/logoBuilder";

export default function ExpAssetsPreloader() {
  const { setExpAssetsLoaded, setPagesReady } = useAppReady();

  console.log("[IO][ExpAssetsPreloader] render");

  useEffect(() => {
    console.log("[IO][ExpAssetsPreloader] useEffect → mounted");
    console.log(`[IO][ExpAssetsPreloader] total logos to prepare: ${logos.length}`);

    // 1) Prefetch code bundles
    import(/* webpackPrefetch: true */ "./ExpCanvas")
      .then(() => console.log("[IO][ExpAssetsPreloader] prefetched ExpCanvas"))
      .catch((e) => console.error("[IO][ExpAssetsPreloader] prefetch ExpCanvas error", e));
    import(/* webpackPrefetch: true */ "./ExpScene")
      .then(() => console.log("[IO][ExpAssetsPreloader] prefetched ExpScene"))
      .catch((e) => console.error("[IO][ExpAssetsPreloader] prefetch ExpScene error", e));

    // 2) Prime SVGLoader cache
    const svgUrls = logos.map((l) => l.svgPath || l);
    console.log("[IO][ExpAssetsPreloader] SVG URLs count:", svgUrls.length);
    useLoader.preload(SVGLoader, svgUrls);
    console.log("[IO][ExpAssetsPreloader] useLoader.preload called");

    // 3) Off‑thread logo builds
    let i = 0;
    function nextLogo() {
      console.log(`[IO][ExpAssetsPreloader] nextLogo() idx=${i}`);
      if (i >= logos.length) {
        console.log("[IO][ExpAssetsPreloader] all logos prepared → setExpAssetsLoaded(true)");
        setExpAssetsLoaded(true);
        return;
      }

      const item = logos[i++];
      const url  = item.svgPath || item;
      console.log(`[IO][ExpAssetsPreloader] prepareLogo [${i}/${logos.length}] start`, url);

      prepareLogo(url)
        .then(() => console.log(`[IO][ExpAssetsPreloader] ✓ prepared ${url}`))
        .catch((e) => console.error("[IO][ExpAssetsPreloader] prepareLogo error", url, e))
        .finally(() => {
          console.log("[IO][ExpAssetsPreloader] scheduling nextLogo");
          if (window.requestIdleCallback) {
            requestIdleCallback(nextLogo);
          } else {
            setTimeout(nextLogo, 0);
          }
        });
    }
    nextLogo();

    return () => {
      console.log("[IO][ExpAssetsPreloader] useEffect → cleanup/unmount");
    };
  }, [setExpAssetsLoaded]);

  // 4) Compute dims for hidden canvas warm‑up
  const width  = window.innerWidth || 1;
  const cols   = 3;
  const cellW  = width / cols;
  const cellH  = cellW;
  const rows   = Math.ceil(logos.length / cols);
  const gridH  = cellH * rows;
  const dims   = { width, cols, cellW, cellH, rows, gridH };
  console.log("[IO][ExpAssetsPreloader] computed dims", dims);

  console.log("[IO][ExpAssetsPreloader] about to render hidden <ExpCanvas>");

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
        zIndex:       -1
      }}
    >
      <ExpCanvas
        dims={dims}
        layoutFrom={dims}
        layoutTo={dims}
        visible={logos}
        prevVisible={logos}
        direction={1}
        onReady={() => {
          console.log("[IO][ExpAssetsPreloader] ExpCanvas onReady → scheduling pagesReady(true) after 2 RAFs");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              console.log("[IO][ExpAssetsPreloader] two frames passed → setPagesReady(true)");
              setPagesReady(true);
            });
          });
        }}
      />
    </div>
  );
}
