// src/components/NavbarDesktop.jsx
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavIconsDesktop from "./NavIconsDesktop";
import logo from "../assets/logo.webp";
import resumePDF from "../assets/Aaron-Berkson-Design-Technologist-2pgs.pdf";
import "./NavbarDesktop.css";
import { getDecryptedEmail } from "../utilities/emailUtility.js";

// Global & Layout Constants
const DEBUG = false;
const LOGO_WIDTH = 123;
const LOGO_HEIGHT = 130;
const LOGO_BORDER_THICKNESS = 1;
const LOGO_SHADOW_OFFSET_X = 0;
const LOGO_SHADOW_OFFSET_Y = -1;
const MAIN_TEXT_CONTAINER_HEIGHT = 130;
const LINE1_CONTAINER_HEIGHT = 80;
const LINE2_CONTAINER_HEIGHT = 50;
const LEFT_MARGIN = "16px";
const LINE2_TOP_MARGIN = "3px";
const LINE2_BOTTOM_PADDING = "12px";
const LINE2_SHADOW_EXTRA_PADDING = "6spx";

// Font Sizing & Spacing Constants
const DEFAULT_LINE_1 = 50;
const DEFAULT_LINE_2 = 36;
const VERTICAL_GAP_BTW_LINES = 8;
const MIN_MARGIN_BELOW_LINE2 = 10;
const MAX_FONT_LINE1 = 50;
const MAX_FONT_LINE2 = 36;

// Shadow Style Constants
const SHADOW_COLOR = "black";
const SHADOW_OPACITY = 1;
const SHADOW_BLUR = "0px";
const LINE1_SHADOW_OFFSET_X = -2.5;
const LINE1_SHADOW_OFFSET_Y = 2.5;
const LINE2_SHADOW_OFFSET_X = -2;
const LINE2_SHADOW_OFFSET_Y = 5.5;

// Helper to measure text width for a given font size and font family.
const measureTextWidth = (text, fontSize, fontFamily) => {
  const temp = document.createElement("span");
  temp.style.fontSize = fontSize + "px";
  temp.style.fontFamily = fontFamily;
  temp.style.whiteSpace = "nowrap";
  temp.style.visibility = "hidden";
  temp.innerText = text;
  document.body.appendChild(temp);
  const width = temp.scrollWidth;
  document.body.removeChild(temp);
  return width;
};

// Helper to recursively extract plain text from a React element.
const getRawText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(getRawText).join(" ");
  if (content && content.props && content.props.children)
    return getRawText(content.props.children);
  return "";
};

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
    &nbsp;MERN Certificate
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
      &nbsp;B.S. Comp Sci
    </span>
  </>
);

// For simplicity, we define Line 1's variants to match Line 2 (with percentages)
const computedLine1Variants = {
  initial: { x: "-100%", opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }
};

// Line 2 variants remain unchanged.
const line2Variants = {
  initial: { x: "-100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { delay: 0.5, duration: 0.5, ease: "easeOut" }
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.5, ease: "easeIn" }
  }
};

const NavbarDesktop = ({ startAnimation }) => {
  // Touch detection to disable rollover functionality
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
      setIsTouchDevice(true);
    }
  }, []);

  // Component States & Refs
  const [firstLine, setFirstLine] = useState("Aaron Berkson's");
  const [secondLine, setSecondLine] = useState({
    main: LINE_2_DEFAULT_MAIN,
    shadow: LINE_2_DEFAULT_SHADOW
  });
  const [line1FontSize, setLine1FontSize] = useState(DEFAULT_LINE_1);
  const [line2FontSize, setLine2FontSize] = useState(DEFAULT_LINE_2);
  const textContainerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);

  // New state to trigger re‑mounting of Line 1 after the loader is done.
  const [triggerLine1, setTriggerLine1] = useState(false);
  useEffect(() => {
    if (startAnimation) {
      const timer = setTimeout(() => {
        setTriggerLine1(true);
      }, 200); // increase delay if needed
      return () => clearTimeout(timer);
    } else {
      setTriggerLine1(false);
    }
  }, [startAnimation]);

  // Dynamic Font Sizing for Line 1
  useLayoutEffect(() => {
    const recalcLine1 = () => {
      if (textContainerRef.current) {
        const availableWidth = textContainerRef.current.clientWidth;
        const safetyMargin = 42;
        const safeAvailableWidth = availableWidth - safetyMargin;
        const text = firstLine;
        const temp = document.createElement("span");
        temp.style.fontSize = DEFAULT_LINE_1 + "px";
        temp.style.fontFamily = "var(--font-focal-extrabold)";
        temp.style.whiteSpace = "nowrap";
        temp.style.visibility = "hidden";
        temp.innerText = text;
        document.body.appendChild(temp);
        const naturalWidth = temp.scrollWidth;
        document.body.removeChild(temp);
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

// Dynamic Font Sizing for Line 2
useLayoutEffect(() => {
  const recalcLine2 = () => {
    if (textContainerRef.current) {
      const availableWidth = textContainerRef.current.clientWidth;
      const safetyMargin = 35;
      const safeAvailableWidth = availableWidth - safetyMargin;
      
      // Extract the raw text from the JSX element rather than checking its type.
      const text = getRawText(secondLine.main);
      
      // Measure the natural width of the text.
      const naturalWidth = measureTextWidth(text, DEFAULT_LINE_2, "var(--font-focal-medium)");
      
      const factor = safeAvailableWidth / naturalWidth;
      const fontBasedOnWidth = DEFAULT_LINE_2 * (factor < 1 ? factor : 1);
      const finalLine2Font = Math.min(fontBasedOnWidth, MAX_FONT_LINE2);
      setLine2FontSize(finalLine2Font);
    }
  };
  recalcLine2();
  window.addEventListener("resize", recalcLine2);
  return () => window.removeEventListener("resize", recalcLine2);
}, [secondLine]);


  // Hover & Click Handlers for Line 2 rollover
  const handleEmailHover = () => {
    setSecondLine({
      main: LINE_2_EMAIL_MAIN,
      shadow: LINE_2_EMAIL_SHADOW
    });
  };

  const handleLinkedInHover = () => {
    setSecondLine({
      main: LINE_2_LINKEDIN_MAIN,
      shadow: LINE_2_LINKEDIN_SHADOW
    });
  };

  const handleResumeHover = () => {
    setSecondLine({
      main: LINE_2_RESUME_MAIN,
      shadow: LINE_2_RESUME_SHADOW
    });
  };

  const handleMITHover = () => {
    setSecondLine({
      main: LINE_2_MIT_MAIN,
      shadow: LINE_2_MIT_SHADOW
    });
  };

  const handleCMUHover = () => {
    setSecondLine({
      main: LINE_2_CMU_MAIN,
      shadow: LINE_2_CMU_SHADOW
    });
  };

  const handleHoverLeave = () => {
    setSecondLine({
      main: LINE_2_DEFAULT_MAIN,
      shadow: LINE_2_DEFAULT_SHADOW
    });
  };

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
            : {
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
  
        {/* Combined Text Container */}
        <div
          className="navbar-text navbar-text-wrapper"
          ref={textContainerRef}
          style={{
            flex: 1,
            width: "100%",
            height: `${MAIN_TEXT_CONTAINER_HEIGHT}px`,
            display: "flex",
            flexDirection: "column",
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
              position: "relative",
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
                    className="NavBar-Ln1"
                    variants={computedLine1Variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{
                      position: "absolute",
                      top: `${LINE1_SHADOW_OFFSET_Y}px`,
                      left: `${LINE1_SHADOW_OFFSET_X}px`,
                      zIndex: 0,
                      color: SHADOW_COLOR,
                      opacity: SHADOW_OPACITY,
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      alignItems: "flex-end",
                      paddingLeft: LEFT_MARGIN,
                      margin: 0,
                      boxSizing: "border-box",
                      lineHeight: 1,
                      fontSize: `${line1FontSize}px`,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
                    ref={line1Ref}
                    variants={computedLine1Variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      zIndex: 1,
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      alignItems: "flex-end",
                      paddingLeft: LEFT_MARGIN,
                      margin: 0,
                      boxSizing: "border-box",
                      lineHeight: 1,
                      fontSize: `${line1FontSize}px`,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
              position: "relative",
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
              <React.Fragment key={JSON.stringify(secondLine)}>
                {/* Shadow Layer for Line 2 */}
                <motion.span
                  key="line2-shadow"
                  variants={line2Variants}
                  initial="initial"
                  animate={startAnimation ? "animate" : "initial"}
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
                    margin: 0,
                    boxSizing: "border-box",
                    fontSize: `${line2FontSize}px`,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "ellipsis",
                    backgroundColor: "transparent",
                    color: SHADOW_COLOR,
                    opacity: SHADOW_OPACITY,
                    filter: `blur(${SHADOW_BLUR})`,
                    pointerEvents: "none",
                    ...(DEBUG && { border: "2px solid green" })
                  }}
                >
                  {secondLine.shadow}
                </motion.span>
  
                <motion.span
                  key="line2-main"
                  variants={line2Variants}
                  initial="initial"
                  animate={startAnimation ? "animate" : "initial"}
                  exit="exit"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    width: "100%",
                    alignItems: "flex-start",
                    paddingLeft: LEFT_MARGIN,
                    paddingTop: LINE2_TOP_MARGIN,
                    boxSizing: "border-box",
                    fontSize: `${line2FontSize}px`,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "ellipsis",
                    backgroundColor: "transparent"
                  }}
                >
                  {secondLine.main}
                </motion.span>
              </React.Fragment>
            </AnimatePresence>
          </div>
        </div>
  
        {/* Column 3: Desktop Icons */}
        <div
          className="navbar-icons"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "transparent",
            ...(DEBUG && { border: "2px dashed brown" })
          }}
        >
          <NavIconsDesktop
            onEmailHover={isTouchDevice ? () => {} : handleEmailHover}
            onLinkedInHover={isTouchDevice ? () => {} : handleLinkedInHover}
            onResumeHover={isTouchDevice ? () => {} : handleResumeHover}
            onMITHover={isTouchDevice ? () => {} : handleMITHover}
            onCMUHover={isTouchDevice ? () => {} : handleCMUHover}
            onHoverLeave={isTouchDevice ? () => {} : handleHoverLeave}
            onEmailClick={() =>
              window.open(`mailto:${getDecryptedEmail()}`, "_blank")
            }
            onLinkedInClick={() =>
              window.open("https://linkedin.com/in/aaronberkson", "_blank")
            }
            onResumeClick={() => window.open(resumePDF, "_blank")}
            onMITClick={() =>
              window.open("https://xpro.mit.edu/courses/course-v1:xPRO+PCCx+R1/", "_blank")
            }
            onCMUClick={() => window.open("https://csd.cmu.edu/", "_blank")}
            onEmailContextMenu={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(getDecryptedEmail());
            }}
          />
        </div>
      </div>
    </div>
  );
};
  
export default NavbarDesktop;