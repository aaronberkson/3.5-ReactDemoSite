// src/components/BackgroundLayers.jsx
import React, { useState, useEffect } from "react";
import AnimatedSmokeCanvas from "../three/AnimatedSmokeCanvas";
import WaveAnimation from "../three/WaveAnimation";
import { useAppReady } from "../contexts/AppReadyContext";

const DEBUG_MODE = true;
const HEADER_HEIGHT = "150px"; // Adjustable constant for header (navbar background) height

const BackgroundLayers = () => {
  // Global flag setter from AppReadyContext.
  const { setBackgroundReady } = useAppReady();

  // States to track when each background (wave and smoke) is ready.
  const [waveReady, setWaveReady] = useState(false);
  const [smokeReady, setSmokeReady] = useState(false);

  if (DEBUG_MODE) {
    console.log(
      "[BackgroundLayers] Initial render:",
      { waveReady, smokeReady }
    );
  }

  useEffect(() => {
    if (DEBUG_MODE) {
      console.log(
        "[BackgroundLayers] useEffect:",
        { waveReady, smokeReady }
      );
    }
    // When both are ready, signal that the app can proceed.
    if (waveReady && smokeReady) {
      if (DEBUG_MODE) {
        console.log(
          "[BackgroundLayers] Both wave and smoke are ready. Setting backgroundReady to true."
        );
      }
      setBackgroundReady(true);
    }
  }, [waveReady, smokeReady, setBackgroundReady]);

  return (
    <>
      {/* Full-screen fixed smoke background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: -2,
        }}
      >
        <AnimatedSmokeCanvas
          onReady={() => {
            if (DEBUG_MODE) {
              console.log("[BackgroundLayers] AnimatedSmokeCanvas onReady triggered.");
            }
            setSmokeReady(true);
          }}
        />
      </div>

      {/* Fixed header container with integrated wave animation */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: HEADER_HEIGHT,
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {/* Constrained container for the wave animation */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: HEADER_HEIGHT,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <WaveAnimation
            zoom={110}
            xOffset={0}
            yOffset={0}
            height={HEADER_HEIGHT}
            onReady={() => {
              if (DEBUG_MODE) {
                console.log("[BackgroundLayers] WaveAnimation onReady triggered.");
              }
              setWaveReady(true);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default BackgroundLayers;
