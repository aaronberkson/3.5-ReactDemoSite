// src/components/SkillsAssetsPreloader.jsx
import React, { useEffect } from "react";
import { useLoader }        from "@react-three/fiber";
import { SVGLoader }        from "three/examples/jsm/loaders/SVGLoader";
import { useAppReady }      from "../contexts/AppReadyContext";
import SkillsCanvas         from "./SkillsCanvas";
import skillsDataByViewport from "../data/skillsLogoData";
import { prepareLogo }      from "../utilities/logoBuilder";

// ─────────────── DEBUG ───────────────
const DEBUG_CONSOLE = true;
const log = (...args) => {
  if (DEBUG_CONSOLE) console.log("[IO][SkillsAssetsPreloader]", ...args);
};

export default function SkillsAssetsPreloader() {
  const { setSkillsAssetsLoaded, setPagesReady } = useAppReady();
  log("hook → setSkillsAssetsLoaded, setPagesReady refs:", setSkillsAssetsLoaded, setPagesReady);

  useEffect(() => {
    log("useEffect → mounted");

    // 1. Prefetch code bundles
    log("prefetching bundles: SkillsCanvas, SkillsScene");
    import(/* webpackPrefetch: true */ "./SkillsCanvas")
      .then(() => log("prefetched SkillsCanvas"))
      .catch((e) => log("prefetch SkillsCanvas error", e));
    import(/* webpackPrefetch: true */ "./SkillsScene")
      .then(() => log("prefetched SkillsScene"))
      .catch((e) => log("prefetch SkillsScene error", e));

    // 2. Gather SVG URLs
    const desktopUrls = skillsDataByViewport.desktop.map((c) => c.logoUrl);
    const tabletUrls  = skillsDataByViewport.tablet.map((c) => c.logoUrl);
    const mobileUrls  = skillsDataByViewport.mobile.map((c) => c.logoUrl);
    const allUrls = [...desktopUrls, ...tabletUrls, ...mobileUrls];
    log("URLs by breakpoint:", {
      desktop: desktopUrls.length,
      tablet:  tabletUrls.length,
      mobile:  mobileUrls.length,
      total:   allUrls.length
    });

    // 3. Prime SVGLoader cache
    log("calling useLoader.preload with", allUrls.length, "URLs");
    useLoader.preload(SVGLoader, allUrls);
    log("SVGLoader.preload queued");

    // 4. Prepare logos off‐thread
    let idx = 0;
    const total = allUrls.length;
    function next() {
      if (idx >= total) {
        log("all logos prepared → calling setSkillsAssetsLoaded(true)");
        setSkillsAssetsLoaded(true);
        return;
      }

      const url = allUrls[idx];
      log(`prepareLogo [${idx + 1}/${total}] start`, url);
      prepareLogo(url)
        .then(() => {
          log(`✓ prepareLogo success [${idx + 1}/${total}]`, url);
        })
        .catch((err) =>
          console.error("[IO][SkillsAssetsPreloader] prepareLogo error:", url, err)
        )
        .finally(() => {
          idx += 1;
          if (window.requestIdleCallback) {
            requestIdleCallback(next);
          } else {
            setTimeout(next, 0);
          }
        });
    }
    next();

    return () => {
      log("cleanup → unmounted");
    };
  }, [setSkillsAssetsLoaded, setPagesReady]);

  const width  = typeof window !== "undefined" ? window.innerWidth || 1 : 1;
  const height = 590;
  log("render", { width, height });

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
        zIndex:        -1
      }}
    >
      {log("render hidden <SkillsCanvas>")}
      <SkillsCanvas
        width={width}
        height={height}
        onReady={() => {
          log("SkillsCanvas onReady → scheduling pagesReady(true) in next 2 RAFs");
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              log("calling setPagesReady(true)");
              setPagesReady(true);
            })
          );
        }}
      />
    </div>
  );
}
