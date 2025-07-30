// src/components/PreloadAbout.jsx
import React, { useEffect, useLayoutEffect, useState, Suspense } from "react";

// code‑split entrypoints
const AboutDesktop = React.lazy(() => import("./AboutDesktop"));
const AboutMobile  = React.lazy(() => import("./AboutMobile"));

export default function PreloadAbout() {
  // 1) pick layout once
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    // 2) prefetch both About chunks
    import(/* webpackPrefetch: true */ "./AboutDesktop").catch(() => {});
    import(/* webpackPrefetch: true */ "./AboutMobile").catch(() => {});

    // 3) prime the heavy video/player code
    import(/* webpackPrefetch: true */ "react-player/youtube").catch(() => {});

    // 4) prime your close‑icon bundle too
    import(/* webpackPrefetch: true */ "./GradientCircleXIcon").catch(() => {});
  }, []);

  // 5) off‑screen, hidden mount
  return (
    <div
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        visibility:    "hidden",
        pointerEvents: "none",
        zIndex:        -1
      }}
    >
      <Suspense fallback={null}>
        {isMobile ? <AboutMobile /> : <AboutDesktop />}
      </Suspense>
    </div>
  );
}
