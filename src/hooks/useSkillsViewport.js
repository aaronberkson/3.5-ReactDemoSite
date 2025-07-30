// src/hooks/useSkillsViewport.js
import { useState, useLayoutEffect, useRef } from "react";

const DEBUG_CONSOLE = true;
const log = (...args) => {
  if (DEBUG_CONSOLE) console.log("[IO][useSkillsViewport]", ...args);
};

export function useSkillsViewport() {
  const ref = useRef(null);

  // Init to window.innerWidth so it's never zero
  const [width, setWidth] = useState(() => {
    const initial = typeof window !== "undefined" ? window.innerWidth : 1;
    log("init width state =", initial);
    return initial;
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      log("no ref.current on mount");
      return;
    }

    // 1) Measure right now
    const measured = el.getBoundingClientRect().width;
    log("initial measure", { measured });
    setWidth(measured);

    // 2) Observe future changes
    const ro = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width;
      log("ResizeObserver fired", { nextWidth });
      // throttle into next frame
      requestAnimationFrame(() => {
        log("requestAnimationFrame setWidth", { nextWidth });
        setWidth(nextWidth);
      });
    });

    ro.observe(el);
    log("ResizeObserver attached");

    return () => {
      ro.disconnect();
      log("ResizeObserver disconnected / cleanup");
    };
  }, []); // run once, but useLayoutEffect guarantees ref is filled

  log("returning ref & width", { width });
  return [ref, width];
}
