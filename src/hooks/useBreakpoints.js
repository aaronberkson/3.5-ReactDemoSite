// src/hooks/useBreakpoints.js
import { useState, useEffect } from "react";

const MAX_CONTENT_WIDTH = 1280;

const getBreakpoint = (width) => {
  if (width >= 1024) {
    return "desktop";
  } else if (width >= 768) {
    return "tabletPortrait";
  } else if (width >= 640) {
    return "phoneXL";
  } else if (width >= 480) {
    return "phoneL";
  } else if (width >= 438) {
    return "phoneM";
  } else {
    return "phoneS";
  }
};

export default function useBreakpoints() {
  const [width, setWidth] = useState(
    typeof window === "undefined" ? MAX_CONTENT_WIDTH : window.innerWidth
  );
  const [breakpoint, setBreakpoint] = useState(getBreakpoint(width));

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      setBreakpoint(getBreakpoint(w));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const effectiveWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const isDesktop      = width >= 1024;
  return { width, effectiveWidth, breakpoint, isDesktop };
}
