// src/components/PreloadTheaterMode.jsx
import React, { useEffect, Suspense } from "react"

// Lazy‑load the entire TheaterMode bundle
const TheaterMode = React.lazy(() => import("./TheaterMode"))

export default function PreloadTheaterMode() {
  useEffect(() => {
    // Kick off webpackPrefetch for the main chunk and for ReactPlayer
    import(/* webpackPrefetch: true */ "./TheaterMode").catch(() => {})
    import(/* webpackPrefetch: true */ "react-player/youtube").catch(() => {})
  }, [])

  // Mount three closed instances so each “mode” branch is exercised and ready
  return (
    <div style={{
      position:      "fixed",
      top:           0,
      left:          0,
      width:         "100vw",
      height:        "100vh",
      visibility:    "hidden",
      pointerEvents: "none",
      zIndex:        -1
    }}>
      <Suspense fallback={null}>
        <TheaterMode isOpen={false} cardType="card1" onClose={() => {}} />
        <TheaterMode isOpen={false} cardType="card2" onClose={() => {}} />
        <TheaterMode isOpen={false} cardType="card3" onClose={() => {}} />
      </Suspense>
    </div>
  )
}
