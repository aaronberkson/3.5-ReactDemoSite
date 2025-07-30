// src/components/SkillsTabletCoins.jsx

import React, { useMemo, useEffect } from "react";
import { useLoader }                 from "@react-three/fiber";
import { SVGLoader }                 from "three/examples/jsm/loaders/SVGLoader";
import SkillsCoin                    from "./SkillsCoin";
import { skillsDataByViewport }      from "../data/skillsLogoData";

// ─────────────────────────────────────────────
// Debug toggle (you can flip this to false later)
const DEBUG_CONSOLE = true;
const log = (...args) => DEBUG_CONSOLE && console.log("[IO][SkillsTabletCoins]", ...args);
// ─────────────────────────────────────────────

export default function SkillsTabletCoins({ hexSize }) {
  log("render");

  const data = skillsDataByViewport.tablet;

  useEffect(() => {
    log("mounted — coins:", data.length);
    return () => log("unmounted");
  }, [data.length]);

  // Prepare URL array for loader
  const urls = useMemo(() => {
    const list = data.map((coin) => coin.logoUrl);
    log("urls prepared:", list.length);
    return list;
  }, [data]);

  // Load all SVGs in one stable hook call
  const svgs = useLoader(SVGLoader, urls);

  useEffect(() => {
    log("SVGs loaded:", svgs.length);
  }, [svgs.length]);

  return data.map((coin, i) => (
    <SkillsCoin
      key={`${coin.title}-${i}`}
      q={coin.q}
      r={coin.r}
      hexSize={coin.hexSize ?? hexSize}
      title={coin.title}
      link={coin.link}
      logoPaths={svgs[i].paths}
      logoSideBrightness={coin.logoSideBrightness}
      logoSizeFactor={coin.logoSizeFactor}
      logoYFactor={coin.logoYFactor}
      logoZOffset={coin.logoZOffset}
      extrudeFactor={coin.extrudeFactor}
      textSize={coin.textSize}
      color={coin.color}
    />
  ));
}
