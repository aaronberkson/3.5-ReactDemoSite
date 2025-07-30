// src/components/TechPill.jsx
import React, { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import mongoIcon from "../assets/stack-logo-mongodb.svg";
import expressIcon from "../assets/stack-logo-express-circle.svg";
import reactIcon from "../assets/stack-logo-react-circle.svg";
import nodeIcon from "../assets/stack-logo-nodejs.svg";
import stripeIcon from "../assets/stack-logo-stripe-payments-darkbg.svg";
import apolloIcon from "../assets/stack-logo-apollo.svg";

import "./TechPill.css";

// DEBUG flag (set false for production)
const DEBUG = false;

// --- Layout Constants ---
const PILL_HEIGHT = 24;  // Pill height in px
const PILL_PADDING_HORIZONTAL = 12; // Horizontal padding in the pill
const FONT_SPEC = "11px sans-serif";
const DEFAULT_ICON_TEXT_SPACING = 3;
const VERTICAL_GAP = 2; // Vertical gap (in px) between pill bottom and tooltip

// --- Liquid Layout Constants (for switching between full and icon-only modes)
const ICON_WIDTH_CONST = 16;                    // Fixed width reserved for the icon (in px)
const EPSILON = 15;                             // Allowable slack for ideal full width calculation
const PILL_ICON_ONLY_THRESHOLD = 66;            // Force icon-only mode if allocatedWidth < 66px

// Tooltip width factor: tooltip width = 2.5 * pill width.
const TOOLTIP_WIDTH_FACTOR = 2.5;

// Define drop shadows
const TOOLTIP_DROP_SHADOW = "-2px 2px 2px rgba(0, 0, 0, 0.2)";
const PILL_DROP_SHADOW = "0px 1px 2px rgba(0, 0, 0, 0.2)";

// For the arrow, treat ARROW_SIZE as half its effective width.
const ARROW_SIZE = 6; // px
const ARROW_BORDER_THICKNESS = 2; // px
const ARROW_TOTAL_HEIGHT = ARROW_SIZE + ARROW_BORDER_THICKNESS; // px

// --- Framer Motion Variants for Tooltip ---
const tooltipVariants = {
  hidden: { opacity: 0, y: -5, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25, duration: 0.35 }
  },
  exit: { opacity: 0, y: -5, scale: 0.95, transition: { duration: 0.25 } },
};


// --- Tech Lookup Data ---
const techLookup = {
  mongo: {
    label: "MongoDB",
    icon: mongoIcon,
    gradient: "linear-gradient(135deg, #4DB33D 0%, #2D6E2E 100%)",
    tooltipGradient: "linear-gradient(135deg, #4DB33D 0%, #2D6E2E 100%)",
    iconHeight: "16px",
    iconTextSpacing: 2,
    description: "is a NoSQL document database, offering flexible schemas and robust scalability.",
    link: "https://www.mongodb.com/",
  },
  express: {
    label: "Express",
    icon: expressIcon,
    gradient: "linear-gradient(135deg, #EEB52A 0%, #C08500 50%, #8F5A00 100%)",
    tooltipGradient: "linear-gradient(135deg, #D6A326 0%, #AD7800 50%, #7F5000 100%)",
    iconHeight: "16px",
    iconTextSpacing: 2,
    description: "is a Node.js framework for rapidly building scalable backend APIs and services.",
    link: "https://expressjs.com/",
  },
  react: {
    label: "React",
    icon: reactIcon,
    gradient: "linear-gradient(135deg, #00EAFF 0%, #00AEDF 50%, #0077B0 100%)",
    tooltipGradient: "linear-gradient(135deg, #00C2D7 0%, #009AB7 50%, #00698D 100%)",
    iconHeight: "16px",
    iconTextSpacing: 3,
    description: "is a JavaScript library for rapid development of component-based designs in fluid & responsive web apps.",
    link: "https://react.dev/",
  },
  node: {
    label: "Node.js",
    icon: nodeIcon,
    gradient: "linear-gradient(135deg, #3C873A 0%, #1B4D2A 100%)",
    tooltipGradient: "linear-gradient(135deg, #3C873A 0%, #1B4D2A 100%)",
    iconHeight: "16px",
    iconTextSpacing: 2,
    description: "a JavaScript runtime environment for executing server-side scalable web apps.",
    link: "https://nodejs.org/",
  },
  stripe: {
    label: "Stripe",
    icon: stripeIcon,
    gradient: "linear-gradient(135deg, #0B162A 0%, #09203F 50%, #1E3A5F 100%)",
    tooltipGradient: "linear-gradient(135deg, #0B162A 0%, #09203F 50%, #1E3A5F 100%)",
    iconHeight: "11px",
    iconTextSpacing: 1,
    description: "is a payment platform powering secure & global online transactions.",
    link: "https://stripe.com/",
  },
  apollo: {
    label: "Apollo",
    icon: apolloIcon,
    gradient: "linear-gradient(135deg, #e36f30 0%, #8e380a 100%)",
    tooltipGradient: "linear-gradient(135deg, #e36f30 0%, #8e380a 100%)",
    iconHeight: "16px",
    description: "s a GraphQL platform for efficient data management in web applications.",
    link: "https://www.apollographql.com/",
  },
};

// --- Utility: measureTextWidth ---
function measureTextWidth(text, font = FONT_SPEC) {
  const canvas = measureTextWidth.canvas || (measureTextWidth.canvas = document.createElement("canvas"));
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
}

/**
 * TechPill Component
 *
 * Props:
 * - tech: Technology key (e.g. "mongo", "express", "react", "node", "stripe", "apollo").
 * - allocatedWidth: Optional fixed width (in px) for the pill.
 *
 * Desired Layout (all calculations are relative only to the pill):
 *   • For Pill Group "left" (mongo, apollo, stripe):
 *         Tooltip’s left edge aligns with the pill’s left edge (computedTooltipLeft = 0).
 *   • For Pill Group "center" (express, react):
 *         Tooltip is centered under the pill (computedTooltipLeft = (pillWidth/2) - (tooltipWidth/2)).
 *   • For Pill Group "right" (node):
 *         Tooltip’s right edge aligns with the pill’s right edge (computedTooltipLeft = pillWidth - tooltipWidth).
 *
 *   Additionally:
 *         Tooltip width = TOOLTIP_WIDTH_FACTOR × pill width.
 *         Tooltip top = pill height + VERTICAL_GAP.
 *         Arrow’s x-position within the tooltip = (pillWidth/2) - computedTooltipLeft (using translateX(-50%)).
 *         Tooltip z-index is high so it appears in front.
 */
const TechPill = ({ tech, allocatedWidth }) => {
  const data = techLookup[tech] || techLookup[tech.toLowerCase()];
  if (!data) return null;
  const label = data.label;

  // --- Liquid Layout Mode: Determine whether to render "full" (icon+text) or "icon-only"
  const textWidth = measureTextWidth(label, FONT_SPEC);
  const adjustedTextWidth = tech.toLowerCase() === "mongo" ? textWidth * 0.7 : textWidth;
  const idealFullWidth = 2 * PILL_PADDING_HORIZONTAL + ICON_WIDTH_CONST + adjustedTextWidth;
  let mode;
  if (allocatedWidth !== undefined && allocatedWidth < PILL_ICON_ONLY_THRESHOLD) {
    mode = "icon-only";
  } else {
    mode = (allocatedWidth === undefined || allocatedWidth >= (idealFullWidth - EPSILON))
      ? "full" : "icon-only";
  }

  // Determine pill group based solely on the tech key.
  let group = "center";
  const techLow = tech.toLowerCase();
  if (["mongo", "apollo", "stripe"].includes(techLow)) {
    group = "left";
  } else if (["express", "react"].includes(techLow)) {
    group = "center";
  } else if (techLow.includes("node")) {
    group = "right";
  }
  if (DEBUG) {
    console.log(`[IO][TechPill] Tech: ${tech} - Group: ${group}`);
  }

  // ---- State & Refs ----
  const [hover, setHover] = useState(false);
  const pillRef = useRef(null);

  // ---- Mobile Long-Press Handlers ----
  const longPressTimeoutRef = useRef(null);
  const handleTouchStart = () => {
    longPressTimeoutRef.current = setTimeout(() => setHover(true), 600);
  };
  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setHover(false);
  };

  // ---- Measure the Pill's Geometry (relative only to itself)
  const [pillGeom, setPillGeom] = useState({
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  useLayoutEffect(() => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      const newGeom = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
      };
      setPillGeom(newGeom);
      if (DEBUG) {
        console.log("[IO][TechPill] Pill Geometry:", newGeom);
      }
    }
  }, [allocatedWidth, hover]);

  // If the pill geometry is not yet measured, render the pill without the tooltip.
  if (pillGeom.width === 0) {
    return (
      <div className="tech-pill-wrapper" style={{ position: "relative", display: "inline-block", transformStyle: "preserve-3d" }} ref={pillRef}>
        <a href={data.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}>
          <div className="tech-pill" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `4px ${PILL_PADDING_HORIZONTAL}px`,
            borderRadius: "9999px",
            background: data.gradient,
            fontFamily: "var(--font-focal-regular)",
            fontSize: "11px",
            color: "white",
            whiteSpace: "nowrap",
            userSelect: "none",
            minWidth: "33px",
            width: allocatedWidth ? `${allocatedWidth}px` : "auto",
            height: `${PILL_HEIGHT}px`,
            flexShrink: 0,
            overflow: "hidden",
            boxShadow: PILL_DROP_SHADOW,
            cursor: "pointer"
          }}>
            <div className="tech-pill-icon-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "16px", overflow: "visible" }}>
              {data.icon && (
                <img src={data.icon} alt={label} style={{ height: data.iconHeight || "16px", width: "auto", objectFit: "contain" }} />
              )}
            </div>
            <span style={{ marginLeft: "3px" }}>{label}</span>
          </div>
        </a>
      </div>
    );
  }

  // ---- Compute Tooltip Width (2.5 * pill width)
  const tooltipWidth = Math.round(TOOLTIP_WIDTH_FACTOR * pillGeom.width);

  // ---- Compute Horizontal Tooltip Position (relative to the pill)
  let computedTooltipLeft = 0;
  if (group === "left") {
    computedTooltipLeft = 0;
    if (DEBUG) console.log("[IO][TechPill] [Group LEFT] computedTooltipLeft = 0");
  } else if (group === "center") {
    computedTooltipLeft = Math.round((pillGeom.width / 2) - (tooltipWidth / 2));
    if (DEBUG) console.log("[IO][TechPill] [Group CENTER] computedTooltipLeft = (pillWidth/2) - (tooltipWidth/2) =", computedTooltipLeft, "px");
  } else if (group === "right") {
    computedTooltipLeft = Math.round(pillGeom.width - tooltipWidth);
    if (DEBUG) console.log("[IO][TechPill] [Group RIGHT] computedTooltipLeft = pillWidth - tooltipWidth =", computedTooltipLeft, "px");
  }

  // ---- Compute Vertical Tooltip Position: tooltip top = pill height + VERTICAL_GAP.
  const computedTooltipTop = pillGeom.height + VERTICAL_GAP;

  // ---- Compute Arrow Position within the Tooltip:
  // Pill center (relative to the pill) is pillGeom.width / 2.
  // Arrow's x-position in tooltip = (pillWidth/2) - computedTooltipLeft.
  const arrowX = Math.round((pillGeom.width / 2) - computedTooltipLeft);
  if (DEBUG) {
    console.log("[IO][TechPill] Tooltip Metrics Relative to Pill:");
    console.log("  Pill Width =", pillGeom.width, "px");
    console.log("  Tooltip Width =", tooltipWidth, "px");
    console.log("  Computed Tooltip Left =", computedTooltipLeft, "px");
    console.log("  Computed Tooltip Top =", computedTooltipTop, "px");
    console.log("  Pill Center =", (pillGeom.width / 2), "px");
    console.log("  Computed Arrow X (within tooltip) =", arrowX, "px");
  }

  // ---- Build Styles ----
  const tooltipStyle = {
    position: "absolute",
    top: `${computedTooltipTop}px`,
    left: `${computedTooltipLeft}px`,
    zIndex: 100000, // Very high to bring the tooltip to the front.
    width: `${tooltipWidth}px`,
    background: data.tooltipGradient,
    color: "#fff",
    border: "2px solid #FFEB3B",
    borderRadius: "4px",
    boxShadow: TOOLTIP_DROP_SHADOW,
    padding: "6px",
    fontFamily: "var(--font-focal-regular)",
    fontSize: "12px",
    textAlign: "left",
    whiteSpace: "normal",
    opacity: 1,
  };

  const arrowStyle = {
    position: "absolute",
    bottom: "100%", // Arrow's tip touches tooltip's top border.
    left: `${arrowX}px`,
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: `${ARROW_SIZE}px solid transparent`,
    borderRight: `${ARROW_SIZE}px solid transparent`,
    borderBottom: `${ARROW_TOTAL_HEIGHT}px solid #FFEB3B`,
  };

  // ---- Standard Pill Styles ----
  const pillMinWidth = 33;
  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `4px ${PILL_PADDING_HORIZONTAL}px`,
    borderRadius: "9999px",
    background: data.gradient,
    fontFamily: "var(--font-focal-regular)",
    fontSize: "11px",
    color: "white",
    whiteSpace: "nowrap",
    userSelect: "none",
    minWidth: `${pillMinWidth}px`,
    width: allocatedWidth ? `${allocatedWidth}px` : "auto",
    height: `${PILL_HEIGHT}px`,
    flexShrink: 0,
    overflow: "hidden",
    boxShadow: PILL_DROP_SHADOW,
    cursor: "pointer",
  };

  const iconContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    overflow: "visible",
  };

  const iconTextSpacing = data.iconTextSpacing || DEFAULT_ICON_TEXT_SPACING;

  const wrapperStyle = {
    position: "relative",
    display: "inline-block",
    transformStyle: "preserve-3d",
  };

  return (
    <div
      ref={pillRef}
      className="tech-pill-wrapper"
      style={wrapperStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <a
        href={data.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}
      >
        <div className="tech-pill" style={pillStyle}>
          <div className="tech-pill-icon-container" style={iconContainerStyle}>
            {data.icon && (
              <img
                src={data.icon}
                alt={label}
                style={{
                  height: data.iconHeight || "16px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            )}
          </div>
          {mode === "full" && (
            <span style={{ marginLeft: `${iconTextSpacing}px` }}>{label}</span>
          )}
        </div>
      </a>
      <AnimatePresence>
        {hover && (
          <motion.div initial="hidden" animate="visible" exit="exit" variants={tooltipVariants} style={tooltipStyle}>
            <div style={arrowStyle} />
            <div>
              <span
                style={{
                  fontFamily: "var(--font-focal-bold)",
                  textShadow: "-1px 1px 0px rgba(0,0,0,0.33)",
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                  display: "inline",
                }}
              >
                {data.label}
              </span>
              <span
                style={{
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                  display: "inline",
                }}
              >
                &nbsp;{data.description}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechPill;
