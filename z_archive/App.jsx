import React, { useEffect }      from "react";
import { AppReadyProvider }      from "./contexts/AppReadyContext";
import { WaveAnimationProvider } from "./contexts/WaveAnimationContext";
import { NavbarHoverProvider }   from "./contexts/NavbarHoverContext";

import BackgroundLayers          from "./components/BackgroundLayers";
import StaticAssetPreloader      from "./components/StaticAssetPreloader";
import PreloadExperienceAssets   from "./components/PreloadExperienceAssets";
import PreloadSkillsAssets       from "./components/PreloadSkillsAssets";
import PreloaderWrapper          from "./components/PreloaderWrapper";
import ForegroundContent         from "./components/ForegroundContent";

export default function App({ startAnimation }) {
  useEffect(() => {
    console.log("[IO][App] mounted");
  }, []);

  return (
    <AppReadyProvider>
      <WaveAnimationProvider>
        {/* 1) always-on backgrounds */}
        <BackgroundLayers />

        {/* 2) static images & SVGs */}
        <StaticAssetPreloader />

        {/* 3) warm‑up Experience offscreen */}
        <PreloadExperienceAssets />

        {/* 4) warm‑up Skills offscreen */}
        <PreloadSkillsAssets />

        {/* 5) spinner until everything signals “ready” */}
        <NavbarHoverProvider>
          <PreloaderWrapper>
            {/* 6) once ready, your real Framer‑Motion UI */}
            <ForegroundContent startAnimation={startAnimation} />
          </PreloaderWrapper>
        </NavbarHoverProvider>
      </WaveAnimationProvider>
    </AppReadyProvider>
  );
}
