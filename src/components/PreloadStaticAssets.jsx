// src/components/PreloadStaticAssets.jsx
import React, { useEffect } from "react"

// ─────────────────────────────────────────────────────────────
// DEBUG
// ─────────────────────────────────────────────────────────────
const DEBUG = true
const TAG   = "[IO][PreloadStaticAssets]"
const log   = (...args) => DEBUG && console.log(TAG, ...args)
const warn  = (...args) => DEBUG && console.warn(TAG, ...args)

// VITE: import all root‑level assets matching png|webp|svg (no subdirs)
const staticImagesContext = import.meta.glob(
  "../assets/*.{png,webp,svg}",
  { eager: true, query: "?url", import: "default" }
)
const staticImageAssets = Object.values(staticImagesContext)

export default function PreloadStaticAssets() {
  useEffect(() => {
    log(`preloading ${staticImageAssets.length} static images`)
    staticImageAssets.forEach((src, i) => {
      log(`➤ [${i+1}/${staticImageAssets.length}]`, src)
      const img = new Image()
      img.src = src
      img.onload  = () => log(`✓ loaded`, src)
      img.onerror = (e) => warn(`⚠️ failed`, src, e)
    })
  }, [])

  return null
}
