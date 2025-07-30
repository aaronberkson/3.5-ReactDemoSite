// src/components/SkillsScene.jsx
import React, { Suspense }         from "react";
import { lazyWithPreload }         from "../utilities/lazyWithPreload";

// code‑split both subcomponents and give them a .preload()
const SkillsStaticContent = lazyWithPreload(() => import("./SkillsStaticContent"));
const SkillsDynamicCoins  = lazyWithPreload(() => import("./SkillsDynamicCoins"));

export default function SkillsScene({ width, height }) {
  return (
    <Suspense fallback={null}>
      <SkillsStaticContent width={width} height={height} />
      <SkillsDynamicCoins  width={width} hexSize={59} />
    </Suspense>
  );
}
