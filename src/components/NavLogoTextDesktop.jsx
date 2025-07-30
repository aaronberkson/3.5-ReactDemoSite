// NavLogoTextDesktop.jsx
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useContext
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.webp";
import { getDecryptedEmail } from "../utilities/emailUtility.js";
import { NavbarHoverContext } from "../contexts/NavbarHoverContext";
import { useAppReady } from "../contexts/AppReadyContext";
import "./NavLogoText.css"; // Shared global CSS

import NavSections from "./NavSections";
import { flattenJSON } from "three/src/animation/AnimationUtils.js";
const HOVER_IDS = ["email", "linkedin", "resume", "mit", "cmu"];
  
// ---------------------------------------------------------------------------
// DEBUG_BORDER FLAGS
const DEBUG_BORDER = false;
const DEBUG_CONSOLE = false;

// ---------------------------------------------------------------------------
// Global & Layout Constants
const LOGO_WIDTH = 123;
const LOGO_HEIGHT = 130;
const LOGO_BORDER_THICKNESS = 1;
const LOGO_SHADOW_OFFSET_X = 0;
const LOGO_SHADOW_OFFSET_Y = -1;

const MAIN_TEXT_CONTAINER_HEIGHT = 130;
const LINE1_CONTAINER_HEIGHT = 70;
const LINE2_CONTAINER_HEIGHT = 60;
const LEFT_MARGIN = "16px";
const leftMarginPx = parseInt(LEFT_MARGIN, 10);
const LINE2_TOP_MARGIN = "3px";
const LINE2_BOTTOM_PADDING = "12px";
const LINE1_TEXT_Y_OFFSET = 3;

// ---------------------------------------------------------------------------
// Fallback Font Sizes
const DEFAULT_LINE_1 = 50;
const DEFAULT_LINE_2 = 36;
const MAX_FONT_LINE1 = 50;
const MAX_FONT_LINE2 = 36;

// ---------------------------------------------------------------------------
// Breakpoint Constants for Desktop (≥ 769px)
const TEXT_LINE1_DESKTOP_BREAKPOINTS = [
  { width: 1280, size: 48 },
  { width: 1024, size: 45 },
  { width: 769, size: 28 }
];
const TEXT_LINE2_DESKTOP_BREAKPOINTS = [
  { width: 1280, size: 36 },
  { width: 1024, size: 32 },
  { width: 769, size: 20 }
];

const IMAGE_BREAKPOINTS = [
  { width: 1024, size: 123 },
  { width: 768, size: 116 },
  { width: 640, size: 116 },
  { width: 480, size: 96 },
  { width: 320, size: 0 }
];
const IMAGE_MIN_VISIBLE = 70;

const RESERVED_RIGHT_SPACE_BREAKPOINTS = [
  { width: 1024, size: 200 },
  { width: 768, size: 150 },
  { width: 640, size: 120 },
  { width: 480, size: 100 },
  { width: 320, size: 80 }
];

// NEW: NAV_TEXT_LEFT_PADDING breakpoints for fluid logo-to-text spacing
const NAV_TEXT_LEFT_PADDING_BREAKPOINTS = [
  { width: 1280, size: 18 }, // Full HD and above
  { width: 1024, size: 12 }, // Standard tablet landscape or smaller desktop
  { width: 769, size: 6 },  // Tablet portrait or small laptop
];

// Helper to interpolate left padding based on viewport width
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

// ---------------------------------------------------------------------------
// Shadow Constants
const SHADOW_COLOR = "black";
const SHADOW_OPACITY = 1;
const SHADOW_BLUR = "0px";
const LINE1_SHADOW_OFFSET_X = -2.5;
const LINE1_SHADOW_OFFSET_Y = 2.5;
const LINE2_SHADOW_OFFSET_X = -2.5;
const LINE2_SHADOW_OFFSET_Y = 2.5;

/// ---------------------------------------------------------------------------
// Default Content for Line 2 – Default Text
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
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      React&nbsp;
    </span>
    <span
      style={{
        fontFamily: "var(--font-focal-medium)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      full stack demos
    </span>
  </>
);

// ---------------------------------------------------------------------------
// Hover State Content for Line 2
const LINE_2_EMAIL_MAIN = (
  <>
    <strong className="glow-email">Email</strong>&nbsp;{getDecryptedEmail()}
  </>
);
const LINE_2_EMAIL_SHADOW = (
  <>
    <strong
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      Email
    </strong>
    &nbsp;{getDecryptedEmail()}
  </>
);
const LINE_2_LINKEDIN_MAIN = (
  <>
    <strong className="glow-linkedin">LinkedIn</strong>.com/in/aaronberkson
  </>
);
const LINE_2_LINKEDIN_SHADOW = (
  <>
    <strong
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      LinkedIn
    </strong>
    .com/in/aaronberkson
  </>
);
const LINE_2_RESUME_MAIN = (
  <>
    <strong className="glow-pdf">Resume</strong>&nbsp;.pdf download
  </>
);
const LINE_2_RESUME_SHADOW = (
  <>
    <strong
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      Resume
    </strong>
    &nbsp;.pdf download
  </>
);
const LINE_2_MIT_MAIN = (
  <>
    <span className="glow-mit">
      <strong>MIT xPRO</strong>
    </span>
    &nbsp;Full Stack Certificate in MERN
  </>
);
const LINE_2_MIT_SHADOW = (
  <>
    <span
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      MIT xPRO
    </span>
    &nbsp;Full Stack Certificate in MERN
  </>
);
const LINE_2_CMU_MAIN = (
  <>
    <strong className="glow-cmu">Carnegie Mellon</strong>{" "}
    <span style={{ fontFamily: "var(--font-focal-medium)" }}>
      &nbsp;B.S. in Computer Science
    </span>
  </>
);
const LINE_2_CMU_SHADOW = (
  <>
    <strong
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      Carnegie Mellon
    </strong>{" "}
    <span
      style={{
        fontFamily: "var(--font-focal-medium)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      &nbsp;B.S. in Computer Science
    </span>
  </>
);

// ---------------------------------------------------------------------------
// NEW: Shortened versions for 769-1023 viewport for CMU and MIT
const LINE_2_CMU_SHORT_MAIN = (
  <>
    <strong className="glow-cmu">Carnegie Mellon</strong>&nbsp;B.S. in Comp. Sci.
  </>
);
const LINE_2_CMU_SHORT_SHADOW = (
  <>
    <strong
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      Carnegie Mellon
    </strong>
    &nbsp;B.S. in Comp. Sci.
  </>
);
const LINE_2_MIT_SHORT_MAIN = (
  <>
    <span className="glow-mit">
      <strong>MITxPRO</strong>
    </span>
    &nbsp;MERN Certificate
  </>
);
const LINE_2_MIT_SHORT_SHADOW = (
  <>
    <span
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      MITxPRO
    </span>
    &nbsp;MERN Certificate
  </>
);

// ---------------------------------------------------------------------------
// Modify getLine2Content to accept currentWidth and return short text for cmu/mit if needed.
const getLine2Content = (line2Id, curWidth) => {
  if (curWidth >= 769 && curWidth < 1024) {
    switch (line2Id) {
      case "cmu":
        return { main: LINE_2_CMU_SHORT_MAIN, shadow: LINE_2_CMU_SHORT_SHADOW };
      case "mit":
        return { main: LINE_2_MIT_SHORT_MAIN, shadow: LINE_2_MIT_SHORT_SHADOW };
      default:
        break;
    }
  }
  switch (line2Id) {
    case "email":
      return { main: LINE_2_EMAIL_MAIN, shadow: LINE_2_EMAIL_SHADOW };
    case "linkedin":
      return { main: LINE_2_LINKEDIN_MAIN, shadow: LINE_2_LINKEDIN_SHADOW };
    case "resume":
      return { main: LINE_2_RESUME_MAIN, shadow: LINE_2_RESUME_SHADOW };
    case "cmu":
      return { main: LINE_2_CMU_MAIN, shadow: LINE_2_CMU_SHADOW };
    case "mit":
      return { main: LINE_2_MIT_MAIN, shadow: LINE_2_MIT_SHADOW };
    default:
      return { main: LINE_2_DEFAULT_MAIN, shadow: LINE_2_DEFAULT_SHADOW };
  }
};

// ---------------------------------------------------------------------------
// Helper Functions
const measureTextWidth = (text, fontSize, fontFamily) => {
  const temp = document.createElement("span");
  temp.style.fontSize = `${fontSize}px`;
  temp.style.fontFamily = fontFamily;
  temp.style.whiteSpace = "nowrap";
  temp.style.visibility = "hidden";
  temp.innerText = text;
  document.body.appendChild(temp);
  const width = temp.scrollWidth;
  document.body.removeChild(temp);
  if (DEBUG_CONSOLE) console.log("[IO][NavDesk] measureTextWidth:", text, "=", width);
  return width;
};

const getRawText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(getRawText).join(" ");
  if (content && content.props && content.props.children)
    return getRawText(content.props.children);
  return "";
};

const interpolateSize = (breakpoints, curWidth) => {
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

const computeLogoDimensions = (curWidth) => {
  const imageSize = interpolateSize(IMAGE_BREAKPOINTS, curWidth);
  if (imageSize < IMAGE_MIN_VISIBLE) {
    return { width: 0, height: 0, visible: false };
  }
  const height = Math.round((imageSize / IMAGE_BREAKPOINTS[0].size) * LOGO_HEIGHT);
  return { width: imageSize, height, visible: true };
};

// ---------------------------------------------------------------------------
// Main Component: NavLogoTextDesktop
const NavLogoTextDesktop = ({
  section,
  setSection,
  line1ShadowOffsetX,
  line1ShadowOffsetY,
  line2ShadowOffsetX,
  line2ShadowOffsetY
}) => {
  if (DEBUG_CONSOLE) console.log("[IO][NavDesk] NavLogoTextDesktop rendered");
  const { appReady } = useAppReady();
  const { line2Id } = useContext(NavbarHoverContext);
  // Pass currentWidth to getLine2Content so that we choose full vs. short content.
  const [currentWidth, setCurrentWidth] = useState(window.innerWidth);
  const { main: currentLine2Main, shadow: currentLine2Shadow } = getLine2Content(line2Id, currentWidth);

  // Inside the component
  const [navTextLeftPadding, setNavTextLeftPadding] = useState(
    getInterpolatedPadding(NAV_TEXT_LEFT_PADDING_BREAKPOINTS, window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => {
      setNavTextLeftPadding(
        getInterpolatedPadding(NAV_TEXT_LEFT_PADDING_BREAKPOINTS, window.innerWidth)
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track viewport width.
  useEffect(() => {
    const handleResize = () => {
      setCurrentWidth(window.innerWidth);
      if (DEBUG_CONSOLE) console.log("[IO][NavDesk] Window resized:", window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use desktop breakpoints for Line 1 and 2.
  const activeLine1Breakpoints = TEXT_LINE1_DESKTOP_BREAKPOINTS;
  const activeLine2Breakpoints = TEXT_LINE2_DESKTOP_BREAKPOINTS;

  const [firstLine] = useState("aaronberkson.io");


  const [line1FontSize, setLine1FontSize] = useState(DEFAULT_LINE_1);
  const [line2FontSize, setLine2FontSize] = useState(DEFAULT_LINE_2);
  const [logoDimensions, setLogoDimensions] = useState(computeLogoDimensions(window.innerWidth));
  const [containerWidth, setContainerWidth] = useState(0);
  const [triggerLine1, setTriggerLine1] = useState(false);
  const [triggerLine2, setTriggerLine2] = useState(false);
  
  // State for Line 2 hover extra padding.
  const [line2Hovered, setLine2Hovered] = useState(false);

  // Dynamically compute reserved right space.
  const [reservedRightSpace, setReservedRightSpace] = useState(
    interpolateSize(RESERVED_RIGHT_SPACE_BREAKPOINTS, window.innerWidth)
  );
  useEffect(() => {
    const updateReservedSpace = () => {
      setReservedRightSpace(
        interpolateSize(RESERVED_RIGHT_SPACE_BREAKPOINTS, window.innerWidth)
      );
    };
    updateReservedSpace();
    window.addEventListener("resize", updateReservedSpace);
    return () => window.removeEventListener("resize", updateReservedSpace);
  }, []);

  const textContainerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    ) {
      setIsTouchDevice(true);
    }
  }, []);

  const [isFluid, setIsFluid] = useState(false);
  useEffect(() => {
    const handleFluid = () => {
      setIsFluid(window.innerWidth < 1024);
    };
    handleFluid();
    window.addEventListener("resize", handleFluid);
    return () => window.removeEventListener("resize", handleFluid);
  }, []);

  // Dynamic Font Sizing for Line 1.
  useLayoutEffect(() => {
    const recalcLine1 = () => {
      if (textContainerRef.current) {
        const fullAvailable = textContainerRef.current.clientWidth;
        const availableWidth = fullAvailable - reservedRightSpace;
        const safetyMargin = 42;
        const safeAvailableWidth = availableWidth - safetyMargin;
        const text = getRawText(firstLine);
        const baseLine1Font = interpolateSize(activeLine1Breakpoints, currentWidth);
        const naturalWidth = measureTextWidth(text, baseLine1Font, "var(--font-focal-extrabold)");
        const factor = safeAvailableWidth / naturalWidth;
        const widthScale = factor < 1 ? factor : 1;
        const finalLine1Font = Math.min(baseLine1Font * widthScale, baseLine1Font);
        setLine1FontSize(finalLine1Font);
        if (DEBUG_CONSOLE) console.log("[IO][NavDesk] Recalc Line1 font size:", finalLine1Font);
      }
    };
    recalcLine1();
    window.addEventListener("resize", recalcLine1);
    return () => window.removeEventListener("resize", recalcLine1);
  }, [firstLine, reservedRightSpace, currentWidth, activeLine1Breakpoints]);

  // Dynamic Font Sizing for Line 2.
  useLayoutEffect(() => {
    const recalcLine2 = () => {
      if (textContainerRef.current) {
        const fullAvailable = textContainerRef.current.clientWidth;
        const availableWidth = fullAvailable - reservedRightSpace;
        const safetyMargin = 35;
        const safeAvailableWidth = availableWidth - safetyMargin;
        const text = getRawText(currentLine2Main);
        const baseLine2Font = interpolateSize(activeLine2Breakpoints, currentWidth);
        const naturalWidth = measureTextWidth(text, baseLine2Font, "var(--font-focal-medium)");
        const factor = safeAvailableWidth / naturalWidth;
        const widthScale = factor < 1 ? factor : 1;
        const finalLine2Font = Math.min(baseLine2Font * widthScale, baseLine2Font);
        setLine2FontSize(finalLine2Font);
        if (DEBUG_CONSOLE) console.log("[IO][NavDesk] Recalc Line2 font size:", finalLine2Font);
      }
    };
    recalcLine2();
    window.addEventListener("resize", recalcLine2);
    return () => window.removeEventListener("resize", recalcLine2);
  }, [line2Id, currentLine2Main, reservedRightSpace, currentWidth, activeLine2Breakpoints]);

  useLayoutEffect(() => {
    const updateContainerWidth = () => {
      if (textContainerRef.current) {
        setContainerWidth(textContainerRef.current.clientWidth);
        if (DEBUG_CONSOLE) console.log("[IO][NavDesk] Text container width:", textContainerRef.current.clientWidth);
      }
    };
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  useEffect(() => {
    const updateLogoDimensions = () => {
      setLogoDimensions(computeLogoDimensions(window.innerWidth));
    };
    updateLogoDimensions();
    window.addEventListener("resize", updateLogoDimensions);
    return () => window.removeEventListener("resize", updateLogoDimensions);
  }, []);

  useEffect(() => {
    let timer1, timer2;
    if (appReady) {
      timer1 = setTimeout(() => setTriggerLine1(true), 200);
      timer2 = setTimeout(() => setTriggerLine2(true), 200);
    } else {
      setTriggerLine1(false);
      setTriggerLine2(false);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [appReady]);

  // Compute animation variants for Line 1.
  const computedLine1Variants = useMemo(() => {
    const effectiveOffset = (containerWidth * 1.75) + leftMarginPx;
    return {
      initial: { x: -effectiveOffset, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: 0.66, ease: "easeOut" } },
      exit: { x: -effectiveOffset, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }
    };
  }, [containerWidth]);

  // Compute animation variants for Line 2.
  const computedLine2Variants = useMemo(() => {
    return {
      initial: { x: "-100%", opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { delay: 0.5, duration: 0.5, ease: "easeOut" } },
      exit: { x: "100%", opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }
    };
  }, [containerWidth]);





  return (
    <div
      className="navbar-wrapper"
      style={
        DEBUG_BORDER
          ? { border: "2px solid purple", backgroundColor: "transparent" }
          : {
              minHeight: "var(--navbar-min-height)",
              padding: "var(--navbar-vertical-padding) 0",
              backgroundColor: "transparent"
            }
      }
    >
      <div
        className="navbar-container"
        style={
          DEBUG_BORDER
            ? { border: "2px solid teal", backgroundColor: "transparent" }
            : isFluid
            ? {
                maxWidth: "100%",
                padding: "0 var(--container-padding-x)",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                backgroundColor: "transparent"
              }
            : {
                maxWidth: "var(--desktop-max-width)",
                padding: "0 var(--container-padding-x)",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                backgroundColor: "transparent"
              }
        }
      >
        {/* Column 1: Logo */}
        <div
          className="navbar-logo"
          style={{
            position: "relative",
            width: logoDimensions.visible ? `${logoDimensions.width}px` : "0px",
            height: logoDimensions.visible ? `${logoDimensions.height}px` : "0px",
            display: logoDimensions.visible ? "flex" : "none",
            alignItems: "center",
            paddingRight: "0px",   
            marginRight: "0px",     
            backgroundColor: "transparent",
            ...(DEBUG_BORDER && { border: "2px dashed red" })
          }}
        >
          {/* Shadow Logo */}
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
              filter: "brightness(0) saturate(100%) blur(1px)"
            }}
          />
          {/* Main Logo */}
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

        {/* Column 2: Combined Text Container */}
        <div
          className="navbar-text navbar-text-wrapper"
          ref={textContainerRef}
          style={{
            position: "relative",
            width: "100%",
            height: `${MAIN_TEXT_CONTAINER_HEIGHT}px`,
            margin: 0,
            marginLeft: `${navTextLeftPadding}px`,
            padding: 0,
            boxSizing: "border-box",
            overflow: "hidden",
            backgroundColor: "transparent",
            ...(DEBUG_BORDER && { border: "2px dotted orange" })
          }}
        >
        {/* Line 1 Container */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: `${LINE1_CONTAINER_HEIGHT}px`
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
                  className="NavBar-Ln1"
                  style={{
                    position: "absolute",
                    transform: `translate(${line1ShadowOffsetX}px, ${line1ShadowOffsetY}px)`,
                    zIndex: 0,
                    color: "black",
                    opacity: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    fontSize: `${line1FontSize}px`,
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                  }}
                >
                  {firstLine}
                </span>

                {/* Main Layer with gradient dot */}
                <span
                  className="NavBar-Ln1"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    fontSize: `${line1FontSize}px`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    ...(DEBUG_BORDER && { border: "2px solid pink" })
                  }}
                >
                  {"aaronberkson"}
                  <span className="glow-react">.</span>
                  {"io"}
                </span>

                {/* Overlay CMU-glow dot on "i" only */}
                <span
                  className="NavBar-Ln1"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "flex-end",
                    fontSize: `${line1FontSize}px`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    pointerEvents: "none"
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



<div
  style={{
    position: "absolute",
    top: `${LINE1_CONTAINER_HEIGHT}px`,
    left: 0,
    width: "100%",
    height: `calc(${LINE2_CONTAINER_HEIGHT}px + ${LINE2_BOTTOM_PADDING})`,
    overflow: "visible",
    boxSizing: "border-box",
    backgroundColor: "transparent"
  }}
>
  <AnimatePresence exitBeforeEnter>
    {HOVER_IDS.includes(line2Id) ? (
      <motion.div
        key={line2Id}
        variants={computedLine2Variants}
        initial="initial"
        animate={triggerLine2 ? "animate" : "initial"}
        exit="exit"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          // paddingLeft: `${navTextLeftPadding}px`,
          paddingTop: LINE2_TOP_MARGIN,
          fontSize: `${line2FontSize}px`,
          whiteSpace: "nowrap",
          overflow: "visible"
        }}
        onMouseEnter={() => setLine2Hovered(true)}
        onMouseLeave={() => setLine2Hovered(false)}
      >
        <span
          style={{
            position: "absolute",
            transform: `translate(${line2ShadowOffsetX}px, ${line2ShadowOffsetY}px)`,
            zIndex: 0,
            color: SHADOW_COLOR,
            opacity: SHADOW_OPACITY,
            filter: `blur(${SHADOW_BLUR})`,
            backgroundColor: "transparent"
          }}
        >
          {currentLine2Shadow}
        </span>
        <span
          ref={line2Ref}
          style={{
            position: "relative",
            zIndex: 1,
            backgroundColor: "transparent",
            transition: "padding-right 0.3s ease",
            ...(line2Hovered && currentWidth >= 769 && currentWidth < 1024
              ? { paddingRight: "80px" }
              : {})
          }}
        >
          {currentLine2Main}
        </span>
      </motion.div>
    ) : (
      <motion.div
        key="nav-sections"
        variants={computedLine2Variants}
        initial="initial"
        animate={triggerLine2 ? "animate" : "initial"}
        exit="exit"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          // paddingLeft: `${navTextLeftPadding}px`
        }}
      >
        <NavSections active={section} onChange={setSection} />
      </motion.div>
    )}
  </AnimatePresence>
</div>




        </div>

        {/* Column 3: Reserved Space for Nav Icons */}
        <div
          style={{
            width: `${reservedRightSpace}px`,
            flexShrink: 0
          }}
        />
      </div>
    </div>
  );
};

export default NavLogoTextDesktop;
