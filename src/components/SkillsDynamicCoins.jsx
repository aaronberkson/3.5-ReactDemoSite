// src/components/SkillsDynamicCoins.jsx
import React, { useEffect, useRef }  from "react";
import { useFrame }                  from "@react-three/fiber";
import { VIEWPORT_BREAKPOINTS }      from "../data/skillsLogoData";
import SkillsDesktopCoins            from "./SkillsDesktopCoins";
import SkillsTabletCoins             from "./SkillsTabletCoins";
import SkillsMobileCoins             from "./SkillsMobileCoins";

const DEBUG_CONSOLE = true;
const log = (...args) => DEBUG_CONSOLE && console.log("[IO][SkillsDynamicCoins]", ...args);

export default function SkillsDynamicCoins({ width, hexSize }) {
  // --- render pass log ---
  log("render", { width, hexSize });

  // --- mount / unmount log ---
  useEffect(() => {
    log("mounted");
    return () => log("unmounted");
  }, []);

  // --- first‑frame log via useFrame ---
  const firstCoinFrame = useRef(true);
  useFrame(() => {
    if (firstCoinFrame.current) {
      log("first frame drawn (dynamic coins)");
      firstCoinFrame.current = false;
    }
  });

  // --- breakpoint branching ---
  if (width >= VIEWPORT_BREAKPOINTS.DESKTOP) {
    log("branch → DesktopCoins");
    return <SkillsDesktopCoins hexSize={hexSize} />;
  }
  if (width >= VIEWPORT_BREAKPOINTS.TABLET) {
    log("branch → TabletCoins");
    return <SkillsTabletCoins hexSize={hexSize} />;
  }
  log("branch → MobileCoins");
  return <SkillsMobileCoins hexSize={hexSize} />;
}
