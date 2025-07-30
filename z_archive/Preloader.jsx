// src/components/Preloader.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import imagesLoaded from "imagesloaded";
import WebFont from "webfontloader";

/* ----- Toggle each pre-loading process (true = enable) ----- */
const PRELOAD_IMAGES = false;
const PRELOAD_FONTS  = false;
// We no longer use this flag to “warm up” by mounting hidden THREE.js components;
// instead, we delay our reveal until after we know the modules have loaded 
// and (via extra wait) the THREE canvases in App (AnimatedSmokeCanvas, WaveAnimation inside NavbarBackground) have time to render.
const PRELOAD_THREE  = true; 

/* ----- Toggle Console Logging ----- */
const ENABLE_LOGS = true;
const log   = (...args) => { if (ENABLE_LOGS) console.log("[IO][Preloader]", ...args); };
const warn  = (...args) => { if (ENABLE_LOGS) console.warn("[IO][Preloader]", ...args); };
const error = (...args) => { if (ENABLE_LOGS) console.error("[IO][Preloader]", ...args); };

/* ===== 1) Preloading Static Images ===== */
// Group A: All PNG, SVG, and WEBP files in the root of src/assets.
const rootImages = Object.values(
  import.meta.glob("../assets/*.{png,svg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
  })
);
// Group B: All PNG files in the src/assets/smoke folder.
const smokeImages = Object.values(
  import.meta.glob("../assets/smoke/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  })
);
// Merge the two arrays.
const allStaticImages = [...rootImages, ...smokeImages];

function loadStaticImages(imageUrls) {
  return new Promise((resolve) => {
    // Create a hidden container to load the images.
    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);

    imageUrls.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      container.appendChild(img);
    });

    // Wait until all images are loaded.
    imagesLoaded(container, { background: false }, () => {
      log("All static images loaded.");
      requestAnimationFrame(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
      resolve();
    });
  });
}

/* ===== 2) Preloading Web Fonts ===== */
const fontCssModules = import.meta.glob("../assets/fonts/*.css", {
  eager: true,
  query: "?url",
  import: "default",
});
const fontCssUrls = Object.values(fontCssModules);
// Derive font family names from the file paths.
const fontFamilies = Object.keys(fontCssModules)
  .map((path) => {
    const match = path.match(/\/([^/]+)\.css$/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

function loadWebFonts() {
  return new Promise((resolve) => {
    WebFont.load({
      custom: {
        families: fontFamilies,
        urls: fontCssUrls,
      },
      active: () => {
        log("All web fonts loaded.");
        resolve();
      },
      inactive: () => {
        warn("Some web fonts failed to load, proceeding anyway.");
        resolve();
      },
    });
  });
}

/* ===== 3) Preloading Three.js Modules ===== */
// Previously, this simply dynamically imported the THREE.js animation modules.
// That ensures the code is loaded, but not that the canvases in your main App have drawn.
// We now use this promise as a signal that the THREE modules are ready,
// and then we add an extra delay (both timeout and extra animation frames)
// so that the THREE canvases (in AnimatedSmokeCanvas and NavbarBackground) – which are rendered in App.jsx – have time to render.
function loadThreeJSAnimations() {
  return Promise.all([
    import("../three/AnimatedSmokeCanvas"),
    import("../three/WaveAnimation"),
  ]).then(() => {
    log("THREE.js modules loaded.");
  }).catch((err) => {
    error("Error loading THREE.js animations:", err);
  });
}

/* ===== Main Preloader Component ===== */
const Preloader = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    async function preloadAll() {
      const tasks = [];
      if (PRELOAD_IMAGES) tasks.push(loadStaticImages(allStaticImages));
      if (PRELOAD_FONTS)  tasks.push(loadWebFonts());
      if (PRELOAD_THREE)  tasks.push(loadThreeJSAnimations());

      await Promise.all(tasks);
      log("Static assets and THREE.js modules preloading completed.");

      // Additional delay to allow THREE.js canvases in App.jsx to render in place.
      if (PRELOAD_THREE) {
        // Wait 1000ms.
        await new Promise((res) => setTimeout(res, 1000));
        // And wait for two more animation frames.
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
      }

      log("All preloading tasks completed; ready to reveal content.");
      setIsLoaded(true);
    }
    preloadAll();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* 
          While the overlay is active, nothing is visible.
          Notice that we do not render children (i.e. <App />) until preloading (and our extra delay) completes.
          That way the THREE.js canvases (in App.jsx) are already mounted and rendered.
      */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }} // The overlay stays fully opaque
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#160E30",
            color: "#FFFFFF",
            fontFamily: "var(--font-focal-regular)",
            zIndex: 9999,
          }}
        >
          <motion.div
            style={{
              width: "60px",
              height: "60px",
              border: "6px solid rgba(255, 255, 255, 0.2)",
              borderTop: "6px solid #00E5FF",
              borderRadius: "50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ loop: Infinity, ease: "linear", duration: 1.2 }}
          />
          <p style={{ marginTop: "20px", fontSize: "1.2em", fontWeight: "bold" }}>
            Loading...
          </p>
        </motion.div>
      )}

      {/* Only render children (your full App) once all tasks and extra delays are complete.
          This ensures that the THREE.js animations (smoke in the background, wave in the navbar)
          have had time to render, so that when the content appears the Framer animations start over them. */}
      {isLoaded && children}
    </div>
  );
};

export default Preloader;
