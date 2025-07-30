// src/components/SkillsDesktopCoins.jsx
import React, { useMemo, useEffect } from "react";
import { useLoader }                 from "@react-three/fiber";
import { SVGLoader }                 from "three/examples/jsm/loaders/SVGLoader";
import SkillsCoin                    from "./SkillsCoin";
import { skillsDataByViewport }      from "../data/skillsLogoData";

const DEBUG_CONSOLE = true;
const LOG_PREFIX    = "[IO][SkillsDesktopCoins]";
const log = (...args) => DEBUG_CONSOLE && console.log(LOG_PREFIX, ...args);

export default function SkillsDesktopCoins({ hexSize }) {
  log("render start", { hexSize });

  const data = skillsDataByViewport.desktop;
  useEffect(() => {
    log("mounted; data length", data.length);
    return () => log("unmounted");
  }, [data.length]);

  // Prepare URL array for loader
  const urls = useMemo(() => {
    const u = data.map((coin) => coin.logoUrl);
    log("urls memoized", u.length);
    return u;
  }, [data]);

  // Load all SVGs in one stable hook call
  const svgs = useLoader(SVGLoader, urls);

  useEffect(() => {
    log("SVGs loaded", svgs.length);
  }, [svgs.length]);

  return data.map((coin, i) => {
    log("render coin", { i, title: coin.title, q: coin.q, r: coin.r });
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
