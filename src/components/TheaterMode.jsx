// src/components/TheaterMode.jsx
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import ReactPlayer from "react-player/youtube";
import { motion, AnimatePresence } from "framer-motion";
import mitLogo from "../assets/mit-xpro-light-blue.svg";
import * as THREE from "three";
import { useWaveAnimation } from "../contexts/WaveAnimationContext";

/* ----------------------------------------------------------------
   Custom Hook: useWindowSize (used for single-video sizing)
---------------------------------------------------------------- */
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

/* ======================
   Close Button – GradientCircleXIcon
   ====================== */
const CLOSE_BTN_HOVER_SCALE = 1.1;
const CLOSE_BTN_TAP_SCALE = 0.9;
const CLOSE_BTN_HOVER_TRANSITION = { type: "spring", stiffness: 500, damping: 20 };
const CLOSE_BTN_TAP_TRANSITION = { type: "spring", stiffness: 500, damping: 20 };
const CLOSE_BTN_ICON_SIZE = "32px";

const GRADIENT_START_COLOR = "#FF7777";  
const GRADIENT_END_COLOR   = "#FF0000";    

const CIRCLE_STROKE_COLOR = "#FF0000";  
const CIRCLE_STROKE_WIDTH = 3;
const CIRCLE_STROKE_OPACITY = 0.8;

const DROP_SHADOW_OFFSET_X = 3;
const DROP_SHADOW_OFFSET_Y = 3;
const DROP_SHADOW_BLUR     = 5;
const DROP_SHADOW_COLOR    = "#000000";
const DROP_SHADOW_OPACITY  = 0.7;

const X_FILL_COLOR = "#FFFFFF";

const GradientCircleXIcon = () => {
  const extra = CIRCLE_STROKE_WIDTH + DROP_SHADOW_BLUR;
  const viewBoxValue = `-${extra} -${extra} ${512 + 2 * extra} ${512 + 2 * extra}`;
  const xPath =
    "M175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 " +
    "33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 " +
    "9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBoxValue}
      width={CLOSE_BTN_ICON_SIZE}
      height={CLOSE_BTN_ICON_SIZE}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GRADIENT_START_COLOR} />
          <stop offset="100%" stopColor={GRADIENT_END_COLOR} />
        </linearGradient>
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset in="SourceAlpha" dx={DROP_SHADOW_OFFSET_X} dy={DROP_SHADOW_OFFSET_Y} result="offset" />
          <feGaussianBlur in="offset" stdDeviation={DROP_SHADOW_BLUR} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values={`
              0 0 0 0 ${parseInt(DROP_SHADOW_COLOR.slice(1,3),16)/255} 
              0 0 0 0 ${parseInt(DROP_SHADOW_COLOR.slice(3,5),16)/255} 
              0 0 0 0 ${parseInt(DROP_SHADOW_COLOR.slice(5,7),16)/255} 
              0 0 0 ${DROP_SHADOW_OPACITY} 0
            `}
            result="shadow"
          />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#dropShadow)">
        <circle
          cx="256"
          cy="256"
          r="256"
          fill="url(#circleGradient)"
          stroke={CIRCLE_STROKE_COLOR}
          strokeWidth={CIRCLE_STROKE_WIDTH}
          strokeOpacity={CIRCLE_STROKE_OPACITY}
          strokeLinejoin="round"
        />
        <path d={xPath} fill={X_FILL_COLOR} />
      </g>
    </svg>
  );
};

/* ======================
   Animation & Viewport Constants
   ====================== */

// --- Multi-video (Playlist) Mode ---
// In multi-video mode the outer container has a fixed width,
// and the video area is forced to 16:9 via CSS (aspectRatio: "16 / 9").
// The playlist sidebar is appended to the right.
const MULTI_VIEWPORT_WIDTH = "90vw";
const MULTI_ENTER_DURATION = 0.3;
const MULTI_ENTER_EASING = [0.42, 0, 0.58, 1];
const MULTI_EXIT_DURATION  = 0.3;
const MULTI_EXIT_EASING    = [0.42, 0, 0.58, 1];
const multiContainerVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: { duration: MULTI_ENTER_DURATION, ease: MULTI_ENTER_EASING }
  },
  exit: { 
    scale: 0.8,
    opacity: 0,
    transition: { duration: MULTI_EXIT_DURATION, ease: MULTI_EXIT_EASING }
  },
};

// --- Single-video Mode ---
// In single-video mode, compute optimal dimensions (maintaining 16:9)
// while not exceeding 80% of viewport dimensions.
const SINGLE_VIEWPORT_WIDTH = "80vw";  
const SINGLE_VIEWPORT_HEIGHT = "80vh";  
const SINGLE_ENTER_DURATION = 0.4;
const SINGLE_ENTER_EASING = [0.4, 0, 0.2, 1];
const SINGLE_EXIT_DURATION  = 0.5;
const SINGLE_EXIT_EASING    = [0.4, 0, 0.2, 1];
const singleContainerVariants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: { duration: SINGLE_ENTER_DURATION, ease: SINGLE_ENTER_EASING }
  },
  exit: { 
    scale: 0.7,
    opacity: 0,
    transition: { duration: SINGLE_EXIT_DURATION, ease: SINGLE_EXIT_EASING }
  },
};

/* ======================
   Other Constants & Utility Helpers
   ====================== */
const DEFAULT_SIDEBAR_PERCENT = 22;
const PLAYLIST_TITLE = "MITxPRO\nCapstone";
const MIT_LOGO_HEIGHT = "50px";
const PLAYLIST_HEADER_FONT_SIZE = "1em";
const VIDEO_TITLE_FONT_SIZE = "0.85em";
const VIDEO_DESC_FONT_SIZE = "0.75em";
const PLAYLIST_HEADER_FONT_WEIGHT = 700;
const VIDEO_TITLE_FONT_WEIGHT = 600;
const VIDEO_DESC_FONT_WEIGHT = 400;
const THUMBNAIL_WIDTH_PERCENT = 33;
const OVERLAY_TRANSITION_DURATION = 0.3;
const OVERLAY_TRANSITION_EASING = [0.42, 0, 0.58, 1];
const OUTER_BORDER_THICKNESS = 1;
const OUTER_BORDER_RADIUS = "12px";
const INNER_BORDER_THICKNESS = 2;
const INNER_BORDER_RADIUS = "12px";

const renderMultilineText = (text) =>
  text.split("\n").map((line, idx, arr) => (
    <React.Fragment key={idx}>
      {line}
      {idx < arr.length - 1 && <br />}
    </React.Fragment>
  ));

const getThumbnailUrl = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/* ========================
   TheaterMode Component
   ======================== */
const TheaterMode = ({
  isOpen,
  resetKey,       // OPTIONAL: Changing this forces remount.
  playlistData,   // Optionally provided; if null, fallback mapping is used.
  playlistKey,    // Legacy key if needed.
  cardType,       // "card1", "card2", or "card3"
  onClose,        // Callback to call after exit animation.
  customContainerStyle,
  sidebarPercent = DEFAULT_SIDEBAR_PERCENT,
}) => {
  // --------------- State & Wave Context ---------------
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef(null);
  const { setIsPaused } = useWaveAnimation();

  useEffect(() => {
    setLocalIsOpen(isOpen);
    if (isOpen) setIsPlaying(true);
  }, [isOpen]);

  const handleExitComplete = () => {
    if (!localIsOpen) onClose();
  };

  // --------------- Playlist Mapping (fallback) ---------------
  const playlistMappings = {
    card1: [
      {
        videoId: "zu0ZuGPph1o",
        title: "Banking Application Capstone Presentation",
        customTitle: "Part 1:\nIntro & Architecture",
        duration: "4:45",
      },
      {
        videoId: "l2NIonp4L8c",
        title: "Part 2: Database And AI",
        customTitle: "Part 2:\nDatabase & API",
        duration: "4:54",
      },
      {
        videoId: "YWtEv_vLcbw",
        title: "Part 3: Deployment And Additional Features",
        customTitle: "Part 3:\nDeployment & Extras",
        duration: "5:56",
      },
    ],
    card2: [
      {
        videoId: "2-8KBByCbwE",
        title: "Test Video Card2",
        customTitle: "Test Video Card2",
        duration: "3:00",
      },
    ],
    card3: [
      {
        videoId: "sN2oWELKsrA",
        title: "Test Video Card3",
        customTitle: "Test Video Card3",
        duration: "3:30",
      },
    ],
  };

  let mappingKey = "card1";
  if (playlistData) {
    // Use provided playlistData.
  } else if (cardType) {
    mappingKey = cardType;
  } else if (playlistKey) {
    mappingKey = playlistKey;
  }
  if (!playlistData) {
    playlistData = playlistMappings[mappingKey] || [];
  }
  if (playlistData.length === 0) return null;

  // --------------- Determine Mode ---------------
  const hasPlaylist = playlistData.length > 1;
  const effectiveContainerVariants = hasPlaylist ? multiContainerVariants : singleContainerVariants;
  const effectiveViewportWidth = hasPlaylist ? MULTI_VIEWPORT_WIDTH : SINGLE_VIEWPORT_WIDTH;

  // --------------- For Single-Video Mode: Compute Dimensions ---------------
  const windowSize = useWindowSize();
  let computedWidth, computedHeight;
  if (!hasPlaylist) {
    const maxWidth = windowSize.width * 0.8;
    const maxHeight = windowSize.height * 0.8;
    if (maxWidth / (16 / 9) <= maxHeight) {
      computedWidth = maxWidth;
      computedHeight = maxWidth / (16 / 9);
    } else {
      computedHeight = maxHeight;
      computedWidth = maxHeight * (16 / 9);
    }
  }

  // --------------- Outer Wrapper Style (Red Container) ---------------
  const outerWrapperStyle = hasPlaylist
    ? {
        width: effectiveViewportWidth,
        maxWidth: "1600px",
        borderRadius: OUTER_BORDER_RADIUS,
        background: "#FF0000",
        padding: `${OUTER_BORDER_THICKNESS}px`,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "center",
      }
    : {
        width: computedWidth,
        height: computedHeight,
        maxWidth: "1600px",
        borderRadius: OUTER_BORDER_RADIUS,
        background: "#FF0000",
        padding: `${OUTER_BORDER_THICKNESS}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

  // --------------- Middle Wrapper (Black Border, now Almost Black) ---------------
  const middleWrapperStyle = {
    width: "100%",
    height: hasPlaylist ? "auto" : "100%",
    borderRadius: INNER_BORDER_RADIUS,
    background: "#282828",
    padding: `${INNER_BORDER_THICKNESS}px`,
  };

  // --------------- Inner Container Style ---------------
  const innerContainerStyle = hasPlaylist
    ? {
        width: "100%",
        height: "auto",
        display: "flex",
        flexDirection: "row",
        background: "#282828",
        borderRadius: "inherit",
        overflow: "hidden",
        position: "relative",
        alignItems: "stretch",
        fontFamily: "var(--font-focal-medium)",
        ...customContainerStyle,
      }
    : {
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#282828",
        borderRadius: "inherit",
        overflow: "hidden",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-focal-medium)",
        ...customContainerStyle,
      };

  // --------------- Video Area ---------------
  const videoAreaWidth = hasPlaylist ? `${100 - sidebarPercent}%` : "100%";
  const videoAreaStyle = {
    width: videoAreaWidth,
    height: hasPlaylist ? "auto" : "100%",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // --------------- Responsive Video Wrapper ---------------
  // In multi-video mode, enforce 16:9 using CSS (via aspectRatio).
const responsiveVideoWrapperStyle = hasPlaylist 
  ? {
      width: "100%",
      aspectRatio: "16/9",
      position: "relative",
      overflow: "hidden",
    }
  : {
      width: "100%",
      // Use aspectRatio as fallback for accurate scaling in single-video mode:
      aspectRatio: "16/9",
      position: "relative",
      overflow: "hidden",
      // Optionally, force a minimum height based on width:
      minHeight: "calc(100vw * 9 / 16)",
    };


  // --------------- Sidebar (Playlist Column) ---------------
  const sidebarStyle = {
    width: `${sidebarPercent}%`,
    height: "100%",
    background: "#282828",
    overflowY: "auto",
    padding: "20px 10px",
    boxSizing: "border-box",
  };

  // Wrap the entire sidebar content so any extra empty space uses the same background.
  const sidebarContentStyle = {
    width: "100%",
    minHeight: "100%",
    backgroundColor: "#282828",
    boxSizing: "border-box",
  };

  const thumbnailStyle = {
    width: `${THUMBNAIL_WIDTH_PERCENT}%`,
    aspectRatio: "16 / 9",
    objectFit: "cover",
    borderRadius: "4px",
  };

  // --------------- State and Player Logic ---------------
  useEffect(() => {
    if (localIsOpen) {
      setCurrentIndex(0);
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
    return () => setIsPaused(false);
  }, [localIsOpen, setIsPaused]);

  useEffect(() => {
    return () => {
      playerRef.current = null;
    };
  }, []);

  const nativePlaylist = playlistData.map((item) => item.videoId).join(",");
  const currentVideoId = playlistData[currentIndex].videoId;
  const currentVideoUrl = `https://www.youtube.com/watch?v=${currentVideoId}`;

  const handleVideoEnd = () => {
    if (currentIndex < playlistData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleVideoSelect = (index) => {
    if (index !== currentIndex) setCurrentIndex(index);
  };

  // Poll the internal player for playlist index changes.
  useEffect(() => {
    if (!localIsOpen) return;
    const interval = setInterval(() => {
      if (playerRef.current) {
        try {
          const internalPlayer = playerRef.current.getInternalPlayer();
          if (internalPlayer && typeof internalPlayer.getPlaylistIndex === "function") {
            const idx = internalPlayer.getPlaylistIndex();
            if (typeof idx === "number" && idx !== currentIndex) {
              setCurrentIndex(idx);
            }
          }
        } catch (error) {
          console.error("Polling error: ", error);
        }
      }
    }, 800);
    return () => clearInterval(interval);
  }, [localIsOpen, currentIndex]);

  const playerConfig = {
    youtube: {
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        start: 0,
        playlist: nativePlaylist,
      },
    },
  };

  // --------------- Render Portal ---------------
  return ReactDOM.createPortal(
    <AnimatePresence exitBeforeEnter onExitComplete={handleExitComplete} key={resetKey}>
      {localIsOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: OVERLAY_TRANSITION_DURATION, ease: OVERLAY_TRANSITION_EASING }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            backdropFilter:     "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            variants={effectiveContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={outerWrapperStyle}
          >
            <div style={middleWrapperStyle}>
              <div style={innerContainerStyle}>
                {/* Video Area */}
                <div style={videoAreaStyle}>
                  <div style={responsiveVideoWrapperStyle}>
                    <ReactPlayer
                      key={currentVideoUrl}
                      url={currentVideoUrl}
                      playing={isPlaying}
                      controls
                      // Always fill the container.
                      width="100%"
                      height="100%"
                      config={playerConfig}
                      onEnded={handleVideoEnd}
                      ref={playerRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        // In single-video mode, use "fill" so the video covers the container.
                        objectFit: hasPlaylist ? "contain" : "fill",
                      }}
                    />
                  </div>
                </div>
                {/* Sidebar (Playlist Column) – Only in Multi-Video Mode */}
                {hasPlaylist && (
                  <div style={sidebarStyle}>
                    <div style={sidebarContentStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          marginBottom: "15px",
                          paddingLeft: "10px",
                        }}
                      >
                        <img src={mitLogo} alt="MITxPRO Logo" style={{ height: MIT_LOGO_HEIGHT, marginRight: "10px" }} />
                        <h3 style={{ color: "#fff", margin: 0, fontSize: PLAYLIST_HEADER_FONT_SIZE, fontWeight: PLAYLIST_HEADER_FONT_WEIGHT }}>
                          {renderMultilineText(PLAYLIST_TITLE)}
                        </h3>
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {playlistData.map((item, index) => (
                          <li key={item.videoId} onClick={() => handleVideoSelect(index)}
                            style={{
                              cursor: "pointer",
                              padding: "10px",
                              background: index === currentIndex ? "#333" : "transparent",
                              marginBottom: "10px",
                              display: "flex",
                              alignItems: "center",
                              borderRadius: "4px",
                            }}>
                            <img src={getThumbnailUrl(item.videoId)} alt={item.customTitle || item.title} style={thumbnailStyle} />
                            <div style={{ marginLeft: "10px", color: "#fff", flex: 1 }}>
                              <div style={{ fontWeight: VIDEO_TITLE_FONT_WEIGHT, fontSize: VIDEO_TITLE_FONT_SIZE }}>
                                {renderMultilineText(item.customTitle || item.title)}
                              </div>
                              {item.duration && (
                                <div style={{ fontWeight: VIDEO_DESC_FONT_WEIGHT, fontSize: VIDEO_DESC_FONT_SIZE, color: "#ccc" }}>
                                  {item.duration}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {/* Close Button */}
                <motion.button
                  onClick={() => {
                    if (playerRef.current) {
                      const internalPlayer = playerRef.current.getInternalPlayer();
                      if (internalPlayer && typeof internalPlayer.pauseVideo === "function") {
                        internalPlayer.pauseVideo();
                      }
                    }
                    setIsPlaying(false);
                    setLocalIsOpen(false);
                  }}
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
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    zIndex: 100001,
                    outline: "none",
                    color: "#FFFFFF",
                  }}
                  aria-label="Close Theater Mode"
                >
                  <GradientCircleXIcon />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TheaterMode;
