import React, { useState, useEffect, useRef } from "react";
import { BsPlayBtnFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player/youtube";
import { useWaveAnimation } from "../contexts/WaveAnimationContext";
import GradientCircleXIcon from "../components/GradientCircleXIcon";

const CLOSE_BTN_HOVER_SCALE      = 1.1;
const CLOSE_BTN_TAP_SCALE        = 0.9;
const CLOSE_BTN_HOVER_TRANSITION = { type: "spring", stiffness: 500, damping: 20 };
const CLOSE_BTN_TAP_TRANSITION   = { type: "spring", stiffness: 500, damping: 20 };

const VIDEO_ID = "YShVEXb7-ic";
const THUMBNAIL_URL = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;
const NAVBAR_HEIGHT = 150;
const PREVIEW_TOP = 38;
const DEBUG_BORDER = false;

const ANIM_EASE = [0.4, 0, 0.2, 1];
const ENTER_DURATION = 0.3;
const EXIT_DURATION = 0.4;

export default function AboutDesktop() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [padding, setPadding] = useState(32);
  const [isOpen, setIsOpen] = useState(false);
  const { setIsPaused } = useWaveAnimation();
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rootStyles = getComputedStyle(document.documentElement);
      const px = parseInt(rootStyles.getPropertyValue("--container-padding-x")) || 32;
      setPadding(px);

      const contentHeight = isOpen ? vh - px * 2 : vh - NAVBAR_HEIGHT - px * 2;
      const maxWidth = vw - px * 2;

      let width = maxWidth;
      let height = (width * 9) / 16;

      if (height > contentHeight) {
        height = contentHeight;
        width = (height * 16) / 9;
      }

      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isOpen]);

  useEffect(() => {
    setIsPaused(isOpen);
    return () => setIsPaused(false);
  }, [isOpen, setIsPaused]);

const commonStyle = {
  // outer red border
  border: "1px solid #FF0000",

  // inner black “padding” area
  padding: "2px",

  // fills that inner area with black
  background: "#282828",

  // rounds both the red border and inner box
  borderRadius: "12px",

  // clip everything inside to the same 12px radius
  clipPath: "inset(0 round 12px)",

  boxSizing: "border-box",
  overflow: "hidden",
  width: dimensions.width,
  height: dimensions.height,
  aspectRatio: "16 / 9",
  position: "relative",
};


return (
  <>
    {/* 1) Backdrop: full-viewport fade only */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          style={{
            position: "fixed",
            inset: 0,                       // top:0; right:0; bottom:0; left:0
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            // raise above the FeedbackBubble (z-2000) but below the video container (z-2001)
            zIndex: 2001,
          }}
        />
      )}
    </AnimatePresence>
    {/* 2) Layout-driven wrapper: expands/contracts as before */}
      <motion.div
        className="about-section"
        id="about"
        layout
        initial={false}
        style={{
          position: isOpen ? "fixed" : "absolute",
          top:      isOpen ? 0 : PREVIEW_TOP,
          left:     0,
          width:    "100vw",
          height:   isOpen
                      ? "100vh"
                      : `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          display:       "flex",
          justifyContent:"center",
          alignItems:    "center",
          boxSizing:     "border-box",
          border:        DEBUG_BORDER ? "2px dashed lime" : "none",
          // ↑ wrap z-index is now dynamic:
          //    preview => 1001 (below bubble @2000)
          //    play    => 2002 (above backdrop @2001 & bubble @2000)
          zIndex:        isOpen ? 2002 : 1001,
        }}
      >

      {/* 3) Video container: same red border, inner black padding, rounded corners */}
      <motion.div
        key="video-container"
        layout
        ref={containerRef}
        initial={{ scale: 1 }}
        animate={{
          scale: 1,
          transition: { duration: ENTER_DURATION, ease: ANIM_EASE }
        }}
        exit={{
          scale: 0.6,
          opacity: 0,
          transition: { duration: EXIT_DURATION, ease: ANIM_EASE }
        }}
        style={{
          ...commonStyle,
          cursor: isOpen ? "default" : "pointer",
          zIndex: isOpen ? 1002 : 1,
        }}
        onClick={() => !isOpen && setIsOpen(true)}
      >
{isOpen ? (
  <div
    style={{
      width: "100%",
      height: "100%",
      position: "relative",
      borderRadius: "inherit",
      overflow: "hidden",
    }}
  >
    <ReactPlayer
      url={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
      playing
      controls
      width="100%"
      height="100%"
      config={{ /* … */ }}
    />
  </div>
) : (
  <div
    style={{
      width: "100%",
      height: "100%",
      position: "relative",
      borderRadius: "inherit",
      overflow: "hidden",
    }}
  >
    <img
      src={THUMBNAIL_URL}
      alt="Video Preview"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "1.8rem",
          fontFamily: "var(--font-focal-medium)",
          color: "white",
          textShadow: "1px 1px 6px black",
        }}
      >
        <BsPlayBtnFill
          size={56}
          color="#FFF"
          style={{ filter: "drop-shadow(2px 2px 6px rgba(0,0,0,0.7))" }}
        />
        <span>About Me in 100 Seconds</span>
      </div>
    </div>
  </div>
)}


        {/* 4) Close button: absolute inside video window */}
        {isOpen && (
          <motion.button
            onClick={() => setIsOpen(false)}
            whileHover={{
              scale: CLOSE_BTN_HOVER_SCALE,
              transition: CLOSE_BTN_HOVER_TRANSITION,
              color: "#E5E5E5",
            }}
            whileTap={{
              scale: CLOSE_BTN_TAP_SCALE,
              transition: CLOSE_BTN_TAP_TRANSITION,
              color: "#B3B3B3",
            }}
            aria-label="Close About Me Video"
            style={{
              position: "absolute",
              top:     "20px",
              right:   "20px",
              zIndex:  10002,
              background: "none",
              border:     "none",
              padding:    0,
              cursor:     "pointer",
              outline:    "none",
            }}
          >
            <GradientCircleXIcon />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  </>
);

}
