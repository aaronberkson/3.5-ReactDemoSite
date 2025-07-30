// src/components/PreloaderWrapper.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAppReady } from "../contexts/AppReadyContext";
import GearIcons from "./GearIcons";
import "./PreloaderWrapper.css";

// ─────────────────────────────────────────────────────────────
// Toggle here (you'll flip to false when you're done debugging)
// ─────────────────────────────────────────────────────────────
const DEBUG_CONSOLE = true;
const log = (...args) => {
  if (DEBUG_CONSOLE) console.log("[IO][PreloaderWrapper]", ...args);
};

// Spinner sizing constants (unchanged)
const SPINNER_SIZE      = 120;
const GEAR_SIZE         =  80;
const SPINNER_THICKNESS =  12;

export default function PreloaderWrapper({ children }) {
  const { expAssetsLoaded, skillsAssetsLoaded, backgroundReady, pagesReady } = useAppReady();
  const [show, setShow] = useState(true);

  // 1) Trace initial mount & unmount
  useEffect(() => {
    log("mounted");
    return () => log("unmounted");
  }, []);

  // 2) Trace every time `show` flips
  useEffect(() => {
    log("show changed →", show);
  }, [show]);

  // 3) Render counter + current flags
  const renderCount = useRef(0);
  renderCount.current += 1;
  log(`render #${renderCount.current}`, {
    show,
    expAssetsLoaded,
    skillsAssetsLoaded,
    backgroundReady,
    pagesReady
  });

  // 4) Track previous ready flags to diff in logs
  const prevFlags = useRef({
    expAssetsLoaded,
    skillsAssetsLoaded,
    backgroundReady,
    pagesReady
  });

  useEffect(() => {
    const changed = {};
    if (prevFlags.current.expAssetsLoaded !== expAssetsLoaded)
      changed.expAssetsLoaded = [prevFlags.current.expAssetsLoaded, expAssetsLoaded];
    if (prevFlags.current.skillsAssetsLoaded !== skillsAssetsLoaded)
      changed.skillsAssetsLoaded = [prevFlags.current.skillsAssetsLoaded, skillsAssetsLoaded];
    if (prevFlags.current.backgroundReady !== backgroundReady)
      changed.backgroundReady = [prevFlags.current.backgroundReady, backgroundReady];
    if (prevFlags.current.pagesReady !== pagesReady)
      changed.pagesReady = [prevFlags.current.pagesReady, pagesReady];

    if (Object.keys(changed).length) {
      log("ready flags changed", changed);
      prevFlags.current = {
        expAssetsLoaded,
        skillsAssetsLoaded,
        backgroundReady,
        pagesReady
      };
    }

    // only hide once **all four** are true
    if (
      expAssetsLoaded &&
      skillsAssetsLoaded &&
      backgroundReady &&
      pagesReady
    ) {
      log("all ready → start hide timer (400ms)");
      const timer = setTimeout(() => {
        log("hide timer fired → setShow(false)");
        setShow(false);
      }, 400);
      return () => {
        log("cleanup hide timer");
        clearTimeout(timer);
      };
    }
  }, [expAssetsLoaded, skillsAssetsLoaded, backgroundReady, pagesReady]);

  // 5) When ready, switch to children
  if (!show) {
    log("show === false → returning children");
    return <>{children}</>;
  }

  // 6) Otherwise render the spinner overlay
  log("show === true → rendering overlay spinner");
  return (
    <div className="preloader-overlay">
      <div
        className="preloader-center"
        style={{ width: SPINNER_SIZE, height: SPINNER_SIZE }}
      >
        {/* OUTER SPINNER */}
        {log("render outer spinner")}
        <div
          className="preloader-spinner"
          style={{
            width: SPINNER_SIZE,
            height: SPINNER_SIZE,
            border: `${SPINNER_THICKNESS}px solid rgba(255,255,255,0.2)`,
            borderTop: `${SPINNER_THICKNESS}px solid #00E5FF`,
            borderRadius: "50%",
          }}
        />

        {/* INNER GEAR */}
        {log("render inner gear")}
        <div
          style={{
            position:     "absolute",
            top:          "50%",
            left:         "50%",
            width:        GEAR_SIZE,
            height:       GEAR_SIZE,
            transform:    "translate(-50%, -50%)",
            overflow:     "hidden",
            borderRadius: "50%",
          }}
        >
          <div
            className="preloader-gear"
            style={{
              width:           "100%",
              height:          "100%",
              transformOrigin: "50% 50%",
            }}
          >
            <GearIcons style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
