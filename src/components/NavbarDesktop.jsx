// src/NavbarDesktop.jsx
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
import resumePDF from "../assets/Aaron-Berkson-Design-Technologist-2pgs.pdf";
import "./NavbarDesktop.css";
import { getDecryptedEmail } from "../utilities/emailUtility.js";
import { NavbarHoverContext } from "../contexts/NavbarHoverContext";
// Import the unified AppReadyContext hook
import { useAppReady } from "../contexts/AppReadyContext";

// ---------------------------------------------------------------------------
// Debug flags and global constants
const DEBUG_MODE = false;
if (DEBUG_MODE) console.log("[IO][NavbarDesktop] File loaded.");

// (For conditional styling, you can change DEBUG to true when needed)
const DEBUG = false;

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

// New constant: Push Line 1 text down. Adjust as needed.
const LINE1_TEXT_Y_OFFSET = 3;  // Both the main and the shadow text will be pushed down by 10px

// Font Sizing & Spacing Constants
const DEFAULT_LINE_1 = 50;
const DEFAULT_LINE_2 = 36;
const VERTICAL_GAP_BTW_LINES = 8;
const MIN_MARGIN_BELOW_LINE2 = 10;
const MAX_FONT_LINE1 = 50;
const MAX_FONT_LINE2 = 36;

// New constant: This reserves a fixed amount (in pixels) from the right side for the icons.
const RESERVED_RIGHT_SPACE = 200;

// Shadow Style Constants
const SHADOW_COLOR = "black";
const SHADOW_OPACITY = 1;
const SHADOW_BLUR = "0px";
const LINE1_SHADOW_OFFSET_X = -2.5;
const LINE1_SHADOW_OFFSET_Y = 2.5;
const LINE2_SHADOW_OFFSET_X = -2;
const LINE2_SHADOW_OFFSET_Y = 5.5;

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

// Hover State Content for Line 2 – Email
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
    </strong>{" "}
    &nbsp;{getDecryptedEmail()}
  </>
);

// Hover State Content for Line 2 – LinkedIn
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

// Hover State Content for Line 2 – Resume
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
    </strong>{" "}
    &nbsp;.pdf download
  </>
);

// Hover State Content for Line 2 – MIT xPRO
const LINE_2_MIT_MAIN = (
  <>
    <strong className="glow-mit">MIT xPRO</strong>&nbsp;Full Stack Certificate in MERN
  </>
);
const LINE_2_MIT_SHADOW = (
  <>
    <strong
      style={{
        fontFamily: "var(--font-focal-extrabold)",
        color: SHADOW_COLOR,
        opacity: SHADOW_OPACITY,
        filter: `blur(${SHADOW_BLUR})`
      }}
    >
      MIT xPRO
    </strong>
    &nbsp;Full Stack Certificate in MERN
  </>
);

// Hover State Content for Line 2 – Carnegie Mellon
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
// Helper Functions for Text Measurement
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
  if (DEBUG_MODE)
    console.log("[IO][NavbarDesktop] measureTextWidth: text =", text, "width =", width);
  return width;
};

const getRawText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(getRawText).join(" ");
  if (content && content.props && content.props.children)
    return getRawText(content.props.children);
  return "";
};

// ---------------------------------------------------------------------------
// NavbarDesktop Component
const NavbarDesktop = () => {
  // Retrieve appReady from the unified context.
  const { appReady } = useAppReady();
  if (DEBUG_MODE)
    console.log("[IO][NavbarDesktop] NavbarDesktop component mounted with appReady =", appReady);

  // Consume the hover context for Line 2 content.
  // --- UPDATED: Now reading the simple identifier 'line2Id' ---
  const { line2Id } = useContext(NavbarHoverContext);
  if (DEBUG_MODE)
    console.log("[IO][NavbarDesktop] Consumed NavbarHoverContext. line2Id =", line2Id);

  // Determine Line 2 content based on the identifier.
  const getLine2Content = () => {
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
  const { main: currentLine2Main, shadow: currentLine2Shadow } = getLine2Content();

  // Touch detection to disable rollover functionality.
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    ) {
      if (DEBUG_MODE) console.log("[IO][NavbarDesktop] Touch device detected.");
      setIsTouchDevice(true);
    } else {
      if (DEBUG_MODE) console.log("[IO][NavbarDesktop] Touch device not detected.");
    }
  }, []);

  // New: Fluid container state – if the viewport is narrower than 1024px, override the fixed max width.
  const [isFluid, setIsFluid] = useState(false);
  useEffect(() => {
    const handleFluid = () => {
      setIsFluid(window.innerWidth < 1024);
    };
    handleFluid();
    window.addEventListener("resize", handleFluid);
    return () => window.removeEventListener("resize", handleFluid);
  }, []);

  // Component States & Refs.
  const [firstLine, setFirstLine] = useState("Aaron Berkson's");
  if (DEBUG_MODE) console.log("[IO][NavbarDesktop] firstLine initialized as:", firstLine);
  // We use the context for second line; only firstLine is stored locally.
  const [line1FontSize, setLine1FontSize] = useState(DEFAULT_LINE_1);
  const [line2FontSize, setLine2FontSize] = useState(DEFAULT_LINE_2);
  if (DEBUG_MODE)
    console.log("[IO][NavbarDesktop] Initial font sizes:", { line1FontSize, line2FontSize });
  const textContainerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);

  // ---------------------- Dynamic Font Sizing for Line 1 ----------------------
  useLayoutEffect(() => {
    const recalcLine1 = () => {
      if (textContainerRef.current) {
        // Subtract RESERVED_RIGHT_SPACE from the measured width to reserve space for the icons.
        const fullAvailable = textContainerRef.current.clientWidth;
        const availableWidth = fullAvailable - RESERVED_RIGHT_SPACE;
        const safetyMargin = 42;
        const safeAvailableWidth = availableWidth - safetyMargin;
        const text = getRawText(firstLine);
        const naturalWidth = measureTextWidth(
          text,
          DEFAULT_LINE_1,
          "var(--font-focal-extrabold)"
        );
        const factor = safeAvailableWidth / naturalWidth;
        const widthScale = factor < 1 ? factor : 1;
        const fontBasedOnWidth = DEFAULT_LINE_1 * widthScale;
        const finalLine1Font = Math.min(fontBasedOnWidth, MAX_FONT_LINE1);
        setLine1FontSize(finalLine1Font);
      }
    };
    recalcLine1();
    window.addEventListener("resize", recalcLine1);
    return () => window.removeEventListener("resize", recalcLine1);
  }, [firstLine]);

  // ---------------------- Dynamic Font Sizing for Line 2 ----------------------
  useLayoutEffect(() => {
    const recalcLine2 = () => {
      if (textContainerRef.current) {
        // Subtract RESERVED_RIGHT_SPACE from the container's width.
        const fullAvailable = textContainerRef.current.clientWidth;
        const availableWidth = fullAvailable - RESERVED_RIGHT_SPACE;
        const safetyMargin = 35;
        const safeAvailableWidth = availableWidth - safetyMargin;
        // Use the effective content for Line 2 based on line2Id.
        const effectiveSecond = line2Id === "default" ? LINE_2_DEFAULT_MAIN : getLine2Content().main;
        const text = getRawText(effectiveSecond);
        const naturalWidth = measureTextWidth(
          text,
          DEFAULT_LINE_2,
          "var(--font-focal-medium)"
        );
        const factor = safeAvailableWidth / naturalWidth;
        const fontBasedOnWidth = DEFAULT_LINE_2 * (factor < 1 ? factor : 1);
        const finalLine2Font = Math.min(fontBasedOnWidth, MAX_FONT_LINE2);
        setLine2FontSize(finalLine2Font);
      }
    };
    recalcLine2();
    window.addEventListener("resize", recalcLine2);
    return () => window.removeEventListener("resize", recalcLine2);
  }, [line2Id]);

  // ---------------------- Measure Container Width on Resize ----------------------
  // This effect re-measures the clientWidth of the text container on every window resize.
  useLayoutEffect(() => {
    const updateContainerWidth = () => {
      if (textContainerRef.current) {
        const newWidth = textContainerRef.current.clientWidth;
        setContainerWidth(newWidth);
        if (DEBUG_MODE) console.log("[IO][NavbarDesktop] Updated containerWidth:", newWidth);
      }
    };
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  // ---------------------- Measurements and Animation Variant Calculation (Part 2) ----------------------
  // Trigger state for Line 1 and Line 2 animations.
  const [triggerLine1, setTriggerLine1] = useState(false);
  const [triggerLine2, setTriggerLine2] = useState(false);
  if (DEBUG_MODE)
    console.log("[IO][NavbarDesktop] triggerLine1 initialized as:", triggerLine1);

  // Use refs as guards to ensure each trigger is only set once.
  const hasTriggeredLine1 = useRef(false);
  const hasTriggeredLine2 = useRef(false);

  // Trigger re‑mounting of Line 1 after the loader is done.
  useEffect(() => {
    if (appReady && !hasTriggeredLine1.current) {
      hasTriggeredLine1.current = true;
      if (DEBUG_MODE)
        console.log("[IO][NavbarDesktop] appReady is true. Setting triggerLine1 after 200ms.");
      const timer = setTimeout(() => {
        setTriggerLine1(true);
        if (DEBUG_MODE) console.log("[IO][NavbarDesktop] triggerLine1 set to true.");
      }, 200);
      return () => {
        clearTimeout(timer);
        if (DEBUG_MODE) console.log("[IO][NavbarDesktop] Cleared triggerLine1 timer.");
      };
    } else if (!appReady) {
      setTriggerLine1(false);
      hasTriggeredLine1.current = false;
      if (DEBUG_MODE)
        console.log("[IO][NavbarDesktop] appReady is false. triggerLine1 set to false.");
    }
  }, [appReady]);

  // Trigger re‑mounting of Line 2 in a similar manner.
  useEffect(() => {
    if (appReady && !hasTriggeredLine2.current) {
      hasTriggeredLine2.current = true;
      if (DEBUG_MODE)
        console.log("[IO][NavbarDesktop] appReady is true. Setting triggerLine2 after 200ms.");
      const timer = setTimeout(() => {
        setTriggerLine2(true);
        if (DEBUG_MODE) console.log("[IO][NavbarDesktop] triggerLine2 set to true.");
      }, 200);
      return () => {
        clearTimeout(timer);
        if (DEBUG_MODE) console.log("[IO][NavbarDesktop] Cleared triggerLine2 timer.");
      };
    } else if (!appReady) {
      setTriggerLine2(false);
      hasTriggeredLine2.current = false;
      if (DEBUG_MODE)
        console.log("[IO][NavbarDesktop] appReady is false. triggerLine2 set to false.");
    }
  }, [appReady]);

  // Measure Line 2's width.
  const [line2Width, setLine2Width] = useState(null);
  useLayoutEffect(() => {
    if (line2Ref.current) {
      const width = line2Ref.current.getBoundingClientRect().width;
      setLine2Width(width);
      if (DEBUG_MODE) console.log("[IO][NavbarDesktop] Measured line2Width:", width);
    }
  }, [line2Id, line2FontSize]);

  // Measure Line 1's width.
  const [line1Width, setLine1Width] = useState(null);
  useLayoutEffect(() => {
    if (line1Ref.current) {
      const width = line1Ref.current.getBoundingClientRect().width;
      setLine1Width(width);
      if (DEBUG_MODE) console.log("[IO][NavbarDesktop] Measured line1Width:", width);
    }
  }, [firstLine, line1FontSize, triggerLine1]);

  // Measure the width of the container holding the text.
  const [containerWidth, setContainerWidth] = useState(0);
  // Now updated continuously by the effect above.

  // Measure the full rendered width of Line 1 (including hidden overflow).
  const [realLine1Width, setRealLine1Width] = useState(0);
  useLayoutEffect(() => {
    if (line1Ref.current) {
      const width = line1Ref.current.scrollWidth;
      setRealLine1Width(width);
      if (DEBUG_MODE)
        console.log("[IO][NavbarDesktop] Measured realLine1Width (scrollWidth):", width);
    }
  }, [firstLine, line1FontSize, triggerLine1]);

  // Define the new Line 1 animation variants.
  const computedLine1Variants = useMemo(() => {
    const offset = realLine1Width > 0 ? realLine1Width : containerWidth;
    const effectiveOffset = (offset * 1.75) + leftMarginPx;
    if (DEBUG_MODE) {
      console.log("[IO][NavbarDesktop] Computed Line1 animation variants with effectiveOffset:", effectiveOffset);
    }
    return {
      initial: { x: -effectiveOffset, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
      exit: { x: -effectiveOffset, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }
    };
  }, [realLine1Width, containerWidth]);

  // Define Line 2 animation variants.
  const line2Variants = {
    initial: (custom) => ({
      x: custom != null ? -custom : "-100%",
      opacity: 0
    }),
    animate: (custom) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.5, duration: 0.5, ease: "easeOut" }
    }),
    exit: (custom) => ({
      x: custom != null ? custom : "100%",
      opacity: 0,
      transition: { duration: 0.5, ease: "easeIn" }
    })
  };

  // ---------------------------------------------------------------------------
  // PART 3: Render (Layout)
  return (
    <div
      className="navbar-wrapper"
      style={
        DEBUG
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
          DEBUG
            ? { border: "2px solid teal", backgroundColor: "transparent" }
            : isFluid
              ? {
                  // Fluid container style for narrow viewports.
                  maxWidth: "100%",
                  padding: "0 20px",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "transparent"
                }
              : {
                  // Normal container style.
                  maxWidth: "var(--desktop-max-width)",
                  padding: "0 calc(var(--app-wide-gutter) / 2)",
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
            width: `${LOGO_WIDTH}px`,
            height: `${LOGO_HEIGHT}px`,
            display: "flex",
            alignItems: "center",
            marginRight: 0,
            backgroundColor: "transparent",
            ...(DEBUG && { border: "2px dashed red" })
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
              width: `calc(${LOGO_WIDTH}px + ${2 * LOGO_BORDER_THICKNESS}px)`,
              height: `calc(${LOGO_HEIGHT}px + ${2 * LOGO_BORDER_THICKNESS}px)`,
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
              width: `${LOGO_WIDTH}px`,
              height: `${LOGO_HEIGHT}px`
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
            padding: 0,
            boxSizing: "border-box",
            overflow: "hidden",
            backgroundColor: "transparent",
            ...(DEBUG && { border: "2px dotted orange" })
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
                <div key="line1">
                  {/* Shadow Layer for Line 1 */}
                  <motion.span
                    key="line1-shadow"
                    ref={line1Ref}
                    className="NavBar-Ln1"
                    variants={computedLine1Variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{
                      position: "absolute",
                      // Combine the shadow offset with the new text vertical offset.
                      top: `${LINE1_SHADOW_OFFSET_Y + LINE1_TEXT_Y_OFFSET}px`,
                      left: `${LINE1_SHADOW_OFFSET_X}px`,
                      zIndex: 0,
                      color: SHADOW_COLOR,
                      opacity: SHADOW_OPACITY,
                      display: "flex",
                      alignItems: "flex-end",
                      paddingLeft: LEFT_MARGIN,
                      fontSize: `${line1FontSize}px`,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      backgroundColor: "transparent",
                      ...(DEBUG && { border: "2px solid blue" })
                    }}
                  >
                    {firstLine}
                  </motion.span>
                  {/* Main Text Layer for Line 1 */}
                  <motion.span
                    key="line1-main"
                    className="NavBar-Ln1"
                    variants={computedLine1Variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{
                      position: "absolute",
                      // Set the main text layer's top offset using the new constant.
                      top: `${LINE1_TEXT_Y_OFFSET}px`,
                      left: 0,
                      zIndex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      paddingLeft: LEFT_MARGIN,
                      fontSize: `${line1FontSize}px`,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      backgroundColor: "transparent",
                      ...(DEBUG && { border: "2px solid pink" })
                    }}
                  >
                    {firstLine}
                  </motion.span>
                </div>
              ) : (
                <div key="line1-placeholder" style={{ height: "100%" }} />
              )}
            </AnimatePresence>
          </div>

          {/* Line 2 Container */}
          <div
            style={{
              position: "absolute",
              top: `${LINE1_CONTAINER_HEIGHT}px`,
              left: 0,
              width: "100%",
              height: `calc(${LINE2_CONTAINER_HEIGHT}px + ${LINE2_BOTTOM_PADDING})`,
              overflow: "visible",
              display: "flex",
              alignItems: "flex-start",
              paddingTop: LINE2_TOP_MARGIN,
              paddingBottom: LINE2_BOTTOM_PADDING,
              boxSizing: "border-box",
              backgroundColor: "transparent",
              ...(DEBUG && { border: "2px solid cyan" })
            }}
          >
            <AnimatePresence exitBeforeEnter>
              {/* Use the line2Id as the key so that changes force an AnimatePresence re-render */}
              <React.Fragment key={line2Id}>
                {/* Shadow Layer for Line 2 */}
                <motion.span
                  key="line2-shadow"
                  variants={line2Variants}
                  initial="initial"
                  animate={triggerLine2 ? "animate" : "initial"}
                  exit="exit"
                  style={{
                    position: "absolute",
                    top: `${LINE2_SHADOW_OFFSET_Y}px`,
                    left: `${LINE2_SHADOW_OFFSET_X}px`,
                    zIndex: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    paddingLeft: LEFT_MARGIN,
                    paddingTop: LINE2_TOP_MARGIN,
                    fontSize: `${line2FontSize}px`,
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    color: SHADOW_COLOR,
                    opacity: SHADOW_OPACITY,
                    filter: `blur(${SHADOW_BLUR})`,
                    ...(DEBUG && { border: "2px solid green" })
                  }}
                >
                  {currentLine2Shadow}
                </motion.span>
                {/* Main Text Layer for Line 2 */}
                <motion.span
                  key="line2-main"
                  ref={line2Ref}
                  variants={line2Variants}
                  initial="initial"
                  animate={triggerLine2 ? "animate" : "initial"}
                  exit="exit"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    paddingLeft: LEFT_MARGIN,
                    paddingTop: LINE2_TOP_MARGIN,
                    fontSize: `${line2FontSize}px`,
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    backgroundColor: "transparent"
                  }}
                >
                  {currentLine2Main}
                </motion.span>
              </React.Fragment>
            </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Empty reserved space (same width as nav icons) */}
        <div style={{ width: `${RESERVED_RIGHT_SPACE}px`, flexShrink: 0 }}></div>
      </div>
    </div>
  );
};

export default NavbarDesktop;
