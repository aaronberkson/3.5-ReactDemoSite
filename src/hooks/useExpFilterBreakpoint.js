// src/hooks/useExpFilterBreakpoint.js
import { useState, useEffect } from "react";

export default function useExpFilterBreakpoint() {
  // start with false on SSR
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width:768px)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width:768px)");
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
