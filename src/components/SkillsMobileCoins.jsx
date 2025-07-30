// src/components/SkillsMobileCoins.jsx

import React, { useMemo, useEffect } from "react";
import { useLoader }                 from "@react-three/fiber";
import { SVGLoader }                 from "three/examples/jsm/loaders/SVGLoader";
import SkillsCoin                    from "./SkillsCoin";
import { skillsDataByViewport }      from "../data/skillsLogoData";

const DEBUG_CONSOLE = true;
const dbg = (...args) => DEBUG_CONSOLE && console.log("[IO][SkillsMobileCoins]", ...args);

export default function SkillsMobileCoins({ hexSize }) {
  dbg("render start", { hexSize });

  const data = skillsDataByViewport.mobile;

  useEffect(() => {
    dbg("data length:", data.length);
  }, [data]);

  // Prepare URL array for loader
  const urls = useMemo(() => {
    const u = data.map((coin) => coin.logoUrl);
    dbg("urls memoized:", u.length, u);
    return u;
  }, [data]);

  // Load all SVGs in one stable hook call
  const svgs = useLoader(SVGLoader, urls);

  useEffect(() => {
    dbg("SVGs loaded:", svgs.length);
  }, [svgs]);

  dbg("mapping coins → return JSX array");

  return data.map((coin, i) => {
    dbg("render coin", { idx: i, title: coin.title, q: coin.q, r: coin.r });
    return (
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
    );
  });
}
