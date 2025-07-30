// src/components/PreloadStaticAssets.jsx
import React, { useEffect } from "react";
import { useLoader }        from "@react-three/fiber";
import { SVGLoader }        from "three/examples/jsm/loaders/SVGLoader";
import { experienceLogoUrls } from "../utilities/experienceLogoUrls";
import { prepareLogo }      from "../utilities/logoBuilder";
import { useAppReady }      from "../contexts/AppReadyContext";

// ─────────────────────────────────────────────────────────────
// DEBUG
// ─────────────────────────────────────────────────────────────
const DEBUG_CONSOLE = true;
const TAG           = "[IO][PreloadStaticAssets]";
const log           = (...args) => DEBUG_CONSOLE && console.log(TAG, ...args);
const warn          = (...args) => DEBUG_CONSOLE && console.warn(TAG, ...args);
const err           = (...args) => console.error(TAG, ...args);

// keep three’s SVGLoader quiet about url(#…)
SVGLoader.DEFAULT_NODE_MATERIAL = false;

// ─────────────────────────────────────────────────────────────
// VITE: import all root‑level assets matching png|webp|svg (not subdirs)
// ─────────────────────────────────────────────────────────────
const staticImagesContext = import.meta.glob(
  "../assets/*.{png,webp,svg}",
  { eager: true, as: "url" }
);
const staticImageAssets = Object.values(staticImagesContext);

export default function PreloadStaticAssets() {
  const { setExpAssetsLoaded } = useAppReady();

  useEffect(() => {
    const t0 = performance.now();
    log("mounted → kick‑off.");
    log(` • ${staticImageAssets.length} root‑level static images`);
    log(` • ${experienceLogoUrls.length} experience SVGs`);

    // 1) preload all root‑level PNG/WEBP/SVG
    staticImageAssets.forEach((src, i) => {
      log(`preloading static image [${i + 1}/${staticImageAssets.length}]:`, src);
      const img = new Image();
      img.src = src;
      img.onload  = () => log(`✓ image loaded`, src);
      img.onerror = (e) => warn(`⚠️ image failed to load`, src, e);
    });

    // 2) prime SVGLoader for all experience logos
    experienceLogoUrls.forEach((url, i) => {
      log(`preloading SVG parser [${i + 1}/${experienceLogoUrls.length}]:`, url);
      useLoader.preload(SVGLoader, url);
    });

    // 3) off‑thread build (prepareLogo) all experience SVGs
    let idx = 0;
    const next = () => {
      if (idx >= experienceLogoUrls.length) {
        const dt = (performance.now() - t0).toFixed(1);
        log(
          `all experience logos built → setExpAssetsLoaded(true)  (Δ ${dt} ms)`
        );
        setExpAssetsLoaded(true);
        return;
      }
      const url = experienceLogoUrls[idx++];
      const stepT0 = performance.now();
      log(`prepareLogo [${idx}/${experienceLogoUrls.length}]:`, url);

      prepareLogo(url)
        .then(() => {
          const stepDt = (performance.now() - stepT0).toFixed(1);
          log(`✓ built ${url} (Δ ${stepDt} ms)`);
        })
        .catch((e) => err("prepareLogo error:", url, e))
        .finally(() => requestAnimationFrame(next));
    };
    requestAnimationFrame(next);
  }, [setExpAssetsLoaded]);

  return null;
}
