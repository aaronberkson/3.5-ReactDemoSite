// src/components/NavLogoTextMobile.jsx
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.webp";
import { getDecryptedEmail } from "../utilities/emailUtility.js";
import { useAppReady } from "../contexts/AppReadyContext";
import NavSections from "./NavSections";
import "./NavLogoTextMobile.css";

// Define your sections array
const SECTIONS = [
  { id: "demos",      full: "Demos",      short: "Demos" },
  { id: "experience", full: "Experience", short: "Exp."   },
  { id: "skills",     full: "Skills",     short: "Skills" }
];

// Now receive section & setSection from ForegroundContent
const NavLogoTextMobile = ({ section, setSection }) => {
  // ─── Refs ──────────────────────────────────────────────────────────────────
  const line1Ref        = useRef(null);
  const line2Ref        = useRef(null);
  const textContainerRef= useRef(null);

  // ─── Text Content ─────────────────────────────────────────────────────────
  const firstLine         = "aaronberkson.io";
  const LINE_2_DEFAULT_MAIN = (
    <>
      <span className="glow-react">React&nbsp;</span>
      <span style={{ fontFamily: "var(--font-focal-medium)" }}>
        full stack demos
      </span>
    </>
  );
  const LINE_2_DEFAULT_SHADOW = (
    <>
      <span
        style={{
          fontFamily: "var(--font-focal-extrabold)",
          color: "black",
          opacity: 1,
          filter: "blur(0px)"
        }}
      >
        React&nbsp;
      </span>
      <span
        style={{
          fontFamily: "var(--font-focal-medium)",
          color: "black",
          opacity: 1,
          filter: "blur(0px)"
        }}
      >
        full stack demos
      </span>
    </>
  );
  const defaultLine2Content = LINE_2_DEFAULT_MAIN;
  const defaultLine2Shadow  = LINE_2_DEFAULT_SHADOW;

  // ─── Debug Flags ──────────────────────────────────────────────────────────
  const DEBUG         = false;
  const DEBUG_CONSOLE = false;

  // ─── Layout Constants (Mobile) ────────────────────────────────────────────
  const LOGO_HEIGHT           = 130;
  const LOGO_BORDER_THICKNESS = 1;
  const LOGO_SHADOW_OFFSET_X  = -3;
  const LOGO_SHADOW_OFFSET_Y  = 3;
  const MAIN_TEXT_CONTAINER_HEIGHT = 130;
  const LINE1_CONTAINER_HEIGHT     = 70;
  const LINE2_CONTAINER_HEIGHT     = 60;
  const LEFT_MARGIN                = "16px";
  const leftMarginPx               = parseInt(LEFT_MARGIN, 10);
  const LINE2_TOP_MARGIN           = "3px";
  const LINE2_BOTTOM_PADDING       = "12px";

  // ─── Mobile Font Breakpoints ──────────────────────────────────────────────
  const TEXT_LINE1_MOBILE_BREAKPOINTS = [
    { width: 768, size: 45 },
    { width: 640, size: 45 },
    { width: 480, size: 28 },
    { width: 320, size: 22 }
  ];
  const TEXT_LINE2_MOBILE_BREAKPOINTS = [
    { width: 768, size: 32 },
    { width: 640, size: 35 },
    { width: 480, size: 20 },
    { width: 320, size: 16 }
  ];
  const RESERVED_RIGHT_SPACE_BREAKPOINTS = [
    { width: 1024, size: 10 },
    { width: 768, size: 10 },
    { width: 640, size: 10 },
    { width: 480, size: 10 },
    { width: 320, size: 10 }
  ];

  // ─── Image Breakpoints ────────────────────────────────────────────────────
  const IMAGE_BREAKPOINTS = [
    { width: 768, size: 116 },
    { width: 640, size: 116 },
    { width: 480, size: 96  },
    { width: 320, size: 0   }
  ];
  const IMAGE_MIN_VISIBLE = 70;

  const NAV_TEXT_LEFT_PADDING_BREAKPOINTS = [
  { width: 768, size: 16 },
  { width: 640, size: 12 },
  { width: 480, size: 10 },
  { width: 436, size: 6 },
  { width: 435, size: 0 },
  { width: 320, size: 0 }
];

const getInterpolatedPadding = (breakpoints, curWidth) => {
  if (curWidth >= breakpoints[0].width) return breakpoints[0].size;
  if (curWidth <= breakpoints[breakpoints.length - 1].width)
    return breakpoints[breakpoints.length - 1].size;
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const bpHigh = breakpoints[i];
    const bpLow = breakpoints[i + 1];
    if (curWidth <= bpHigh.width && curWidth >= bpLow.width) {
      const ratio = (curWidth - bpLow.width) / (bpHigh.width - bpLow.width);
      return bpLow.size + ratio * (bpHigh.size - bpLow.size);
    }
  }
  return breakpoints[breakpoints.length - 1].size;
};

  // ─── Shadow Constants ─────────────────────────────────────────────────────
  const SHADOW_COLOR        = "black";
  const SHADOW_OPACITY      = 1;
  const SHADOW_BLUR         = "0px";
  const LINE1_SHADOW_OFFSET_X = -2.5;
  const LINE1_SHADOW_OFFSET_Y =  2.5;
  const LINE2_SHADOW_OFFSET_X = -2;
  const LINE2_SHADOW_OFFSET_Y =  5.5;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const interpolateSize = (breakpoints, curWidth) => {
    if (curWidth >= breakpoints[0].width) return breakpoints[0].size;
    if (curWidth <= breakpoints[breakpoints.length - 1].width)
      return breakpoints[breakpoints.length - 1].size;
    for (let i = 0; i < breakpoints.length - 1; i++) {
      const bpHigh = breakpoints[i];
      const bpLow  = breakpoints[i + 1];
      if (curWidth < bpHigh.width && curWidth >= bpLow.width) {
        const frac = (curWidth - bpLow.width) / (bpHigh.width - bpLow.width);
        return bpLow.size + frac * (bpHigh.size - bpLow.size);
      }
    }
    return breakpoints[breakpoints.length - 1].size;
  };

  const computeLogoDimensions = (curWidth) => {
    const imageSize = interpolateSize(IMAGE_BREAKPOINTS, curWidth);
    if (imageSize < IMAGE_MIN_VISIBLE) {
      return { width: 0, height: 0, visible: false };
    }
    const height = Math.round((imageSize / IMAGE_BREAKPOINTS[0].size) * LOGO_HEIGHT);
    return { width: imageSize, height, visible: true };
  };

  // ─── State & Effects ─────────────────────────────────────────────────────
  // Track viewport width
  const [curWidth, setCurWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => {
      setCurWidth(window.innerWidth);
      if (DEBUG_CONSOLE) console.log("[IO][NavMob] Window resized:", window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Logo dimensions
  const [logoDimensions, setLogoDimensions] = useState(
    computeLogoDimensions(window.innerWidth)
  );
  useEffect(() => {
    const updateLogo = () => setLogoDimensions(computeLogoDimensions(window.innerWidth));
    updateLogo();
    window.addEventListener("resize", updateLogo);
    return () => window.removeEventListener("resize", updateLogo);
  }, []);

  // Reserved right space
  const [reservedRightSpace, setReservedRightSpace] = useState(
    interpolateSize(RESERVED_RIGHT_SPACE_BREAKPOINTS, window.innerWidth)
  );
  useEffect(() => {
    const updateSpace = () =>
      setReservedRightSpace(
        interpolateSize(RESERVED_RIGHT_SPACE_BREAKPOINTS, window.innerWidth)
      );
    window.addEventListener("resize", updateSpace);
    return () => window.removeEventListener("resize", updateSpace);
  }, []);

  // Container width for text sizing
  const [containerWidth, setContainerWidth] = useState(0);
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (textContainerRef.current) {
        setContainerWidth(textContainerRef.current.clientWidth);
        if (DEBUG_CONSOLE)
          console.log("[IO][NavMob] Text container width:", textContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Compute mobile font sizes
  const [line1FontSize, setLine1FontSize] = useState(
    interpolateSize(TEXT_LINE1_MOBILE_BREAKPOINTS, curWidth)
  );
  const [line2FontSize, setLine2FontSize] = useState(
    interpolateSize(TEXT_LINE2_MOBILE_BREAKPOINTS, curWidth)
  );
  useLayoutEffect(() => {
    setLine1FontSize(interpolateSize(TEXT_LINE1_MOBILE_BREAKPOINTS, curWidth));
  }, [curWidth]);
  useLayoutEffect(() => {
    setLine2FontSize(interpolateSize(TEXT_LINE2_MOBILE_BREAKPOINTS, curWidth));
  }, [curWidth]);

  const [navTextLeftPadding, setNavTextLeftPadding] = useState(
  getInterpolatedPadding(NAV_TEXT_LEFT_PADDING_BREAKPOINTS, window.innerWidth)
);

useEffect(() => {
  const updatePadding = () => {
    setNavTextLeftPadding(
      getInterpolatedPadding(NAV_TEXT_LEFT_PADDING_BREAKPOINTS, window.innerWidth)
    );
  };
  window.addEventListener("resize", updatePadding);
  return () => window.removeEventListener("resize", updatePadding);
}, []);

  // Intro animation triggers
  const { appReady } = useAppReady();
  const [triggerLine1, setTriggerLine1] = useState(false);
  const [triggerLine2, setTriggerLine2] = useState(false);
  useEffect(() => {
    let t1, t2;
    if (appReady) {
      t1 = setTimeout(() => setTriggerLine1(true), 200);
      t2 = setTimeout(() => setTriggerLine2(true), 200);
    } else {
      setTriggerLine1(false);
      setTriggerLine2(false);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [appReady]);

  // Framer-motion variants
  const computedLine1Variants = useMemo(() => {
    const offset = containerWidth * 1.75 + leftMarginPx;
    return {
      initial: { x: -offset, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: 0.66, ease: "easeOut" } },
      exit:    { x: -offset, opacity: 0, transition: { duration: 0.5,  ease: "easeIn" } }
    };
  }, [containerWidth, leftMarginPx]);

  const computedLine2Variants = useMemo(() => ({
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { delay: 0.5, duration: 0.5, ease: "easeOut" } },
    exit:    { x: "100%", opacity: 0, transition: { duration: 0.5, ease: "easeIn"  } }
  }), [containerWidth]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="navbar-wrapper"
      style={{
        minHeight: "var(--navbar-min-height)",
        padding: "var(--navbar-vertical-padding) 0",
        backgroundColor: "transparent"
      }}
    >
      <div
        className="navbar-container"
        style={{
          maxWidth: "var(--mobile-max-width, 768px)",
          padding: "0 var(--container-padding-x)",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          backgroundColor: "transparent"
        }}
      >
        {/* Logo Column */}
        <div
          className="navbar-logo"
          style={{
            position: "relative",
            width: logoDimensions.visible ? `${logoDimensions.width}px` : "0px",
            height: logoDimensions.visible ? `${logoDimensions.height}px` : "0px",
            display: logoDimensions.visible ? "flex" : "none",
            alignItems: "center",
            marginRight: 0,
            backgroundColor: "transparent"
          }}
        >
          <img
            src={logo}
            alt="Logo Shadow"
            style={{
              position: "absolute",
              top: `calc(${LOGO_SHADOW_OFFSET_Y}px - ${LOGO_BORDER_THICKNESS}px)`,
              left: `calc(${LOGO_SHADOW_OFFSET_X}px - ${LOGO_BORDER_THICKNESS}px)`,
              zIndex: 0,
              width: logoDimensions.visible
                ? `calc(${logoDimensions.width}px + ${2 * LOGO_BORDER_THICKNESS}px)`
                : "0px",
              height: logoDimensions.visible
                ? `calc(${logoDimensions.height}px + ${2 * LOGO_BORDER_THICKNESS}px)`
                : "0px",
              filter: "brightness(0) saturate(100%) blur(1px)",
              transform: "scale(.93)",
              transformOrigin: "top"
            }}
          />
          <img
            src={logo}
            alt="Logo"
            style={{
              position: "relative",
              zIndex: 1,
              width: logoDimensions.visible ? `${logoDimensions.width}px` : "0px",
              height: logoDimensions.visible ? `${logoDimensions.height}px` : "0px",
              objectFit: "contain"
            }}
          />
        </div>

        {/* Text + Tabs Column */}
        <div
          className="navbar-text navbar-text-wrapper"
          ref={textContainerRef}
          style={{
            position: "relative",
            width: "100%",
            height: `${MAIN_TEXT_CONTAINER_HEIGHT}px`,
            overflow: "hidden",
            boxSizing: "border-box"
          }}
        >
          {/* Line 1 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: `${LINE1_CONTAINER_HEIGHT}px`,
              width: "100%"
            }}
          >
            <AnimatePresence exitBeforeEnter>
              {triggerLine1 ? (
                <motion.div
                  key="line1-group"
                  variants={computedLine1Variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ position: "relative" }}
                >
                  {/* Shadow Layer */}
                  <span
                    ref={line1Ref}
                    className="NavBar-Ln1"
                    style={{
                      position: "absolute",
                      transform: `translate(${LINE1_SHADOW_OFFSET_X}px, ${LINE1_SHADOW_OFFSET_Y}px)`,
                      zIndex: 0,
                      color: SHADOW_COLOR,
                      opacity: SHADOW_OPACITY,
                      display: "flex",
                      alignItems: "flex-end",
                      paddingLeft: logoDimensions.visible ? `${navTextLeftPadding}px` : "0px",
                      fontSize: `${line1FontSize}px`,
                      whiteSpace: "nowrap",
                      overflow: "hidden"
                    }}
                  >
                    {firstLine}
                  </span>

                  {/* Main Layer */}
                  <span
                    className="NavBar-Ln1"
                    style={{
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      alignItems: "flex-end",
                      paddingLeft: logoDimensions.visible ? `${navTextLeftPadding}px` : "0px",
                      fontSize: `${line1FontSize}px`,
                      whiteSpace: "nowrap",
                      overflow: "hidden"
                    }}
                  >
                    aaronberkson
                    <span className="glow-react">.</span>
                    io
                  </span>

                  {/* Orange Glow Dot Layer */}
                  <span
                    className="NavBar-Ln1"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 3,
                      display: "flex",
                      alignItems: "flex-end",
                      pointerEvents: "none",
                      paddingLeft: logoDimensions.visible ? `${navTextLeftPadding}px` : "0px",
                      fontSize: `${line1FontSize}px`,
                      whiteSpace: "nowrap",
                      overflow: "hidden"
                    }}
                  >
                    <span style={{ opacity: 0 }}>aaronberkson.</span>
                    <span
                      className="glow-dot-wave-orange"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(to bottom, black 0%, black 38%, transparent 38%, transparent 100%)",
                        maskImage:
                          "linear-gradient(to bottom, black 0%, black 38%, transparent 38%, transparent 100%)"
                      }}
                    >
                      i
                    </span>
                  </span>
                </motion.div>
              ) : (
                <div key="line1-placeholder" style={{ height: "100%" }} />
              )}
            </AnimatePresence>
          </div>

          {/* Line 2: Animated Tabs */}
          <div
            style={{
              position: "absolute",
              top: `${LINE1_CONTAINER_HEIGHT}px`,
              left: 0,
              width: "100%",
              height: `calc(${LINE2_CONTAINER_HEIGHT}px + ${LINE2_BOTTOM_PADDING})`,
              display: "flex",
              alignItems: "flex-start",
              paddingTop: LINE2_TOP_MARGIN,
              paddingBottom: LINE2_BOTTOM_PADDING,
              overflow: "visible",
              boxSizing: "border-box"
            }}
          >
            <AnimatePresence exitBeforeEnter>
              {triggerLine2 && (
                  <motion.div
                    key="navsections"
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      transition: { delay: 0.5, duration: 0.5, ease: "easeOut" }
                    }}
                    exit={{
                      x: "100%",
                      opacity: 0,
                      transition: { duration: 0.5, ease: "easeIn" }
                    }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-start",
                      paddingLeft: logoDimensions.visible ? `${navTextLeftPadding}px` : "0px",
                      height: `${LINE2_CONTAINER_HEIGHT}px`,
                      overflow: "visible"
                    }}
                  >
                  <NavSections
                    active={section}
                    onChange={setSection}
                    className="nav-sections-mobile"
                    style={{ fontSize: `${line2FontSize}px` }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Icons Placeholder */}
        <div style={{ width: `${reservedRightSpace}px`, flexShrink: 0 }} />
      </div>
    </div>
  );
};

export default NavLogoTextMobile;