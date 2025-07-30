// src/App.jsx
import React, { useEffect } from "react";
import { AppReadyProvider } from "./contexts/AppReadyContext";
import { WaveAnimationProvider } from "./contexts/WaveAnimationContext";
import { NavbarHoverProvider } from "./contexts/NavbarHoverContext";

import BackgroundLayers from "./components/BackgroundLayers";
import PreloadStaticAssets from "./components/PreloadStaticAssets";
import PreloadExperienceAssets from "./components/PreloadExperienceAssets";
import PreloadSkillsAssets from "./components/PreloadSkillsAssets";

// —— New lightweight preloaders ——
import PreloadMessageModal from "./components/PreloadMessageModal";
import PreloadFeedbackBubble from "./components/PreloadFeedbackBubble";
import PreloadAbout from "./components/PreloadAbout";
import PreloadTheaterMode from "./components/PreloadTheaterMode";
// ——————————————————————————————

import PreloaderWrapper from "./components/PreloaderWrapper";
import ForegroundContent from "./components/ForegroundContent";

// helper to lazy-load with explicit preload
import { lazyWithPreload } from "./utilities/lazyWithPreload";

// code-split heavy 3D bundles
const ExpCanvas = lazyWithPreload(() => import("./components/ExpCanvas"));
const ExpScene = lazyWithPreload(() => import("./components/ExpScene"));
const SkillsCanvas = lazyWithPreload(() => import("./components/SkillsCanvas"));
const SkillsScene = lazyWithPreload(() => import("./components/SkillsScene"));

export default function App({ startAnimation }) {
  // 0. Trigger bundle preloading on mount
  useEffect(() => {
    ExpCanvas.preload();
    ExpScene.preload();
    SkillsCanvas.preload();
    SkillsScene.preload();
  }, []);

  return (
    <AppReadyProvider>
      <WaveAnimationProvider>

        {/* 1. Background (smoke + wave) */}
        <BackgroundLayers />

        {/* 2. Static SVG/PNG/WebP */}
        <PreloadStaticAssets />

        {/* 3a. Three.js stacks (hidden canvases) */}
        <PreloadExperienceAssets />
        <PreloadSkillsAssets />

        {/* 3b. Lightweight UI preloaders (hidden mounts) */}
        <PreloadMessageModal />
        <PreloadFeedbackBubble />
        <PreloadAbout />
        <PreloadTheaterMode />

        <NavbarHoverProvider>
          {/* 4. Spinner until all flags ready */}
          <PreloaderWrapper>
            {/* 5. Your actual UI */}
            <ForegroundContent startAnimation={startAnimation} />
          </PreloaderWrapper>
        </NavbarHoverProvider>

      </WaveAnimationProvider>
    </AppReadyProvider>
  );
}
