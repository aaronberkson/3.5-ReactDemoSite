// src/components/PageWarmUp.jsx
import { useEffect, useRef } from "react";
import { useAppReady }       from "../contexts/AppReadyContext";

// DEBUG CONSOLE
const DEBUG_CONSOLE = true; // flip to false when you're done
const log  = (...args) => DEBUG_CONSOLE && console.log("[IO][PageWarmUp]", ...args);
const warn = (...args) => DEBUG_CONSOLE && console.warn("[IO][PageWarmUp]", ...args);
const err  = (...args) => DEBUG_CONSOLE && console.error("[IO][PageWarmUp]", ...args);

export default function PageWarmUp() {
  const { setPagesReady } = useAppReady();
  const readySetRef = useRef(false);

  log("render");

  useEffect(() => {
    log("mounted → prefetch Experience & Skills bundles");

    const startedAt = performance.now();

    Promise.all([
      import(/* webpackPrefetch: true */ "../components/Experience").then((m) => {
        log("prefetched module: Experience", m?.default?.name || "(no default export name)");
        return m;
      }),
      import(/* webpackPrefetch: true */ "../components/Skills").then((m) => {
        log("prefetched module: Skills", m?.default?.name || "(no default export name)");
        return m;
      })
    ])
      .then((mods) => {
        const dur = (performance.now() - startedAt).toFixed(1);
        log(`bundles loaded in ${dur}ms`, mods.map((m) => m?.default?.name));

        if (readySetRef.current) {
          warn("setPagesReady(true) was already called – skipping duplicate flip");
          return;
        }
        readySetRef.current = true;
        setPagesReady(true);
        log("setPagesReady(true)");
      })
      .catch((e) => {
        err("error while prefetching:", e);
      });

    return () => {
      log("unmounted");
    };
  }, [setPagesReady]);

  return null;
}
