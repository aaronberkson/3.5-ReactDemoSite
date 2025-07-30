// src/components/SkillsCoinCollection.jsx

import React, { useMemo, useState, useEffect } from "react"
import { useLoader }                      from "@react-three/fiber"
import { SVGLoader }                      from "three/examples/jsm/loaders/SVGLoader"
import SkillsCoin                         from "./SkillsCoin"
import skillsDataByViewport, {
  VIEWPORT_BREAKPOINTS
} from "../data/skillsLogoData.js"

// ─────────────── DEBUG ───────────────
const DEBUG_CONSOLE = true
const log = (...args) => {
  if (DEBUG_CONSOLE) console.log("[IO][SkillsCoinCollection]", ...args)
}

export default function SkillsCoinCollection({ hexSize = 44 }) {
  // track window width to pick desktop/tablet/mobile
  const [width, setWidth] = useState(window.innerWidth)

  // mount / unmount
  useEffect(() => {
    log("mounted")
    return () => log("unmounted")
  }, [])

  // handle resize
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      if (w !== width) {
        log("resize", { prev: width, next: w })
        setWidth(w)
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [width])

  // choose the right data array
  const coinDefs = useMemo(() => {
    let chosen
    if (width >= VIEWPORT_BREAKPOINTS.DESKTOP) chosen = skillsDataByViewport.desktop
    else if (width >= VIEWPORT_BREAKPOINTS.TABLET) chosen = skillsDataByViewport.tablet
    else chosen = skillsDataByViewport.mobile
    log("coinDefs selected", { width, count: chosen.length })
    return chosen
  }, [width])

  // render pass
  log("render", { hexSize, width, items: coinDefs.length })

  return (
    <>
      {coinDefs.map((coin, i) => {
        // load the SVG only once per logoUrl
        const svgData   = useLoader(SVGLoader, coin.logoUrl)
        const logoPaths = useMemo(() => svgData.paths, [svgData.paths])

        // per-coin log (once per render cycle, not per frame)
        log("coin render", {
          idx: i,
          title: coin.title,
          url: coin.logoUrl,
          q: coin.q,
          r: coin.r
        })

        return (
          <SkillsCoin
            key={`${coin.title}-${i}`}

            // grid coords
            q={coin.q}
            r={coin.r}

            // use coin.hexSize if set, else prop-driven hexSize
            hexSize={coin.hexSize ?? hexSize}

            // text + click URL
            title={coin.title}
            link={coin.link}

            // logo data
            logoPaths={logoPaths}
            logoSideBrightness={coin.logoSideBrightness}
            logoSizeFactor={coin.logoSizeFactor}
            logoYFactor={coin.logoYFactor}
            logoZOffset={coin.logoZOffset}
            extrudeFactor={coin.extrudeFactor}

            // new: per-coin text size
            textSize={coin.textSize}

            color={coin.color}
          />
        )
      })}
    </>
  )
}
