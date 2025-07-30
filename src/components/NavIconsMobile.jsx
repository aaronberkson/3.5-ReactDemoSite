// src/NavIconsMobile.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelopeSquare, FaLinkedin, FaFilePdf, FaLayerGroup } from "react-icons/fa";
import mitLogo from "../assets/mit-xpro-light-blue.svg";
import cmuLogo from "../assets/carnegie-mellon-carnegie-red.svg";
import resumePDF from "../assets/Aaron-Berkson-Design-Technologist-2pgs.pdf";
import { getDecryptedEmail } from "../utilities/emailUtility";
import { createPortal } from "react-dom";
import "./NavIconsMobile.css";

// For production, set DEBUG_BORDER to false.
const DEBUG_BORDER = false;
const DEBUG_CONSOLE = false;

// -------------------------------------------------------------
// CONFIGURATION CONSTANTS – ADJUSTABLE PARAMETERS
// -------------------------------------------------------------
const CONFIG = {
  BASE_BG_COLOR: "44,62,80",          // use only the RGB part as a string
  BASE_BG_TRANSPARENCY: 0.5,           // e.g., 0.5 = 50% transparent

  SHADOW_COLOR: "0,138,207",
  BASE_SHADOW_TRANSPARENCY: 0.5,
  
  ANIM_INTRO_FADE: {
    duration: 0.3,
    delay: 0.0,
    easing: [0.42, 0, 0.58, 1],
  },
  ANIM_INTRO_EXPAND: {
    duration: 0.5,
    delay: 0.1,
    easing: [0.42, 0, 0.58, 1],
  },
  
  ANIM_HOVER: {
    stiffness: 300,
    damping: 20,
    scale: 1.03,
  },
  
  ANIM_SELECTION: {
    stiffness: 500,
    damping: 20,
    scale: 0.97,
    duration: 0.2,
  },
  
  ANIM_EXIT: {
    duration: 0.2,
    easing: [0.42, 0, 0.58, 1],
    scale: 0.95,
  },
};

const ICON_START_SCALE = 0.7;
const COLLAPSE_TIMEOUT = 300;

// Added mobile auto-close timeout constant.
const MOBILE_AUTO_CLOSE_TIMEOUT = 5000; // 5 seconds

// Removed resumePDF from the props and use the imported asset instead.
const NavIconsMobile = ({ controls, hamburgerVariants }) => {
  if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Component loaded.");

  // ---------------------------
  // Link definitions
  // ---------------------------
  const emailLink = `mailto:${getDecryptedEmail()}`;
  const linkedInLink = "https://linkedin.com/in/aaronberkson";
  const resumeLink = resumePDF;
  const cmuLink = "https://csd.cmu.edu/";
  const mitLink = "https://xpro.mit.edu/courses/course-v1:xPRO+PCCx+R1/";

  // ---------------------------
  // Refs for logging positions
  // ---------------------------
  const hamburgerRef = useRef(null);
  const dropdownRef = useRef(null);

  // ---------------------------
  // 1. Track viewport width for positioning.
  // ---------------------------
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Window resized:", window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRightOffset = (vw) => {
    const desktopMaxWidth = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--desktop-max-width")
    ) || 1280;
    const appWideGutter = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--app-wide-gutter")
    ) || 50;
    const offsetCorrection = 28;
    return vw >= desktopMaxWidth
      ? `${(vw - desktopMaxWidth) / 2 + appWideGutter - offsetCorrection}px`
      : `${appWideGutter - offsetCorrection}px`;
  };
  const rightOffset = getRightOffset(viewportWidth);

  // ---------------------------
  // 2. Outer Container Style.
  // ---------------------------
  const containerStyle = {
    position: "fixed",
    top: "28px",
    right: rightOffset || "20px",
    zIndex: 9999,
    pointerEvents: "auto",
    backgroundColor: "transparent",
  };

  // ---------------------------
  // 3. Menu state, pointer state, and animateState.
  // ---------------------------
  const [menuOpen, setMenuOpen] = useState(false);
  // animateState can be: "base", "hover", "tap", or "selected"
  const [animateState, setAnimateState] = useState("base");
  const [isHamburgerHovered, setIsHamburgerHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);

  const toggleMenu = () => {
    if (!menuOpen) {
      setMenuOpen(true);
      // When opened, force the "selected" state
      setAnimateState("selected");
      if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Menu opened (selected).");
    } else {
      setMenuOpen(false);
      if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Menu closed.");
    }
  };

  // ---------------------------
  // 4. Control animateState manually based on pointer events and menu state.
  // ---------------------------
  useEffect(() => {
    // Log current states for troubleshooting
    if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Current states:", { menuOpen, isHamburgerHovered, isPointerDown, animateState });
    
    if (menuOpen) {
      if (animateState !== "selected") {
        if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Forcing selected state because menu is open.");
        setAnimateState("selected");
      }
    } else {
      if (isPointerDown) {
        if (animateState !== "tap") {
          if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Pointer down; setting state to tap.");
          setAnimateState("tap");
        }
      } else {
        if (isHamburgerHovered) {
          if (animateState !== "hover") {
            if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Pointer hovering; setting state to hover.");
            setAnimateState("hover");
          }
        } else {
          if (animateState !== "base") {
            if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] No pointer; reverting state to base.");
            setAnimateState("base");
          }
        }
      }
    }
  }, [menuOpen, isHamburgerHovered, isPointerDown, animateState]);

  // ---------------------------
  // 5. Collapse dropdown with a timeout when pointer is not over.
  // ---------------------------
  useEffect(() => {
    if (menuOpen && !isHamburgerHovered && !isDropdownHovered) {
      const timer = setTimeout(() => {
        if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Collapse timeout reached; closing dropdown.");
        setMenuOpen(false);
      }, COLLAPSE_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [menuOpen, isHamburgerHovered, isDropdownHovered]);

  // ---------------------------
  // 5a. Mobile-specific auto close for touch devices.
  // ---------------------------
  useEffect(() => {
    // For mobile devices, where hover events may not reliably occur, auto-close the dropdown.
    if (menuOpen && viewportWidth < 769) {
      const mobileTimer = setTimeout(() => {
        if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Mobile auto-close timeout reached; closing dropdown.");
        setMenuOpen(false);
      }, MOBILE_AUTO_CLOSE_TIMEOUT);
      return () => clearTimeout(mobileTimer);
    }
  }, [menuOpen, viewportWidth]);

  // ---------------------------
  // Debug Logging for positions.
  // ---------------------------
  useEffect(() => {
    if (hamburgerRef.current) {
      const rect = hamburgerRef.current.getBoundingClientRect();
      if (DEBUG_CONSOLE) console.log(
        `[IO][NavIconsMobile] Hamburger Bounds: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`
      );
    }
  }, [animateState]);

  useEffect(() => {
    if (menuOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      if (DEBUG_CONSOLE) console.log(
        `[IO][NavIconsMobile] Dropdown Bounds: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`
      );
    }
  }, [menuOpen, isDropdownHovered]);

  // ---------------------------
  // 6. Variants for dropdown items.
  // ---------------------------
  const itemVariants = {
    initial: { scale: 1, backgroundColor: "transparent", borderRadius: "8px" },
    hover: { scale: 1.05, backgroundColor: "rgba(122,210,247,0.25)", borderRadius: "8px" },
    tap: { scale: 0.97, backgroundColor: "rgba(122,210,247,0.35)", borderRadius: "8px" },
  };

  // ---------------------------
  // 7. Variants for the hamburger container.
  // ---------------------------
  const defaultHamburgerVariants = {
    initial: {
      opacity: 0,
      scale: ICON_START_SCALE,
    },
    base: {
      opacity: 1,
      scale: 1,
      backgroundColor: `rgba(${CONFIG.BASE_BG_COLOR},${CONFIG.BASE_BG_TRANSPARENCY})`,
      boxShadow: `-2px 2px 0 rgba(${CONFIG.SHADOW_COLOR},${CONFIG.BASE_SHADOW_TRANSPARENCY})`,
      borderRadius: "8px",
      padding: "8px",
      boxSizing: "border-box",
    },
    // Added opacity: 1 here to ensure the element is visible in hover.
    hover: {
      opacity: 1,
      scale: CONFIG.ANIM_HOVER.scale,
      backgroundColor: "rgba(44,62,80,1)",
      boxShadow: `-3px 3px 0 rgba(${CONFIG.SHADOW_COLOR},1), 0px 0px 10px 3px rgba(${CONFIG.SHADOW_COLOR},1)`,
      transition: { type: "spring", stiffness: CONFIG.ANIM_HOVER.stiffness, damping: CONFIG.ANIM_HOVER.damping },
    },
    // Similarly, for tap state.
    tap: {
      opacity: 1,
      scale: CONFIG.ANIM_SELECTION.scale,
      backgroundColor: "rgba(44,62,80,1)",
      boxShadow: `-3px 3px 0 rgba(${CONFIG.SHADOW_COLOR},1), 0px 0px 10px 3px rgba(${CONFIG.SHADOW_COLOR},1)`,
      transition: { type: "spring", stiffness: CONFIG.ANIM_SELECTION.stiffness, damping: CONFIG.ANIM_SELECTION.damping },
    },
    selected: {
      opacity: 1,
      scale: 1,
      backgroundColor: "rgba(44,62,80,1)",
      boxShadow: "none",
      borderTopLeftRadius: "var(--menu-border-radius)",
      borderTopRightRadius: "var(--menu-border-radius)",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      padding: "8px",
      transition: { duration: CONFIG.ANIM_SELECTION.duration },
    },
    postExit: {
      opacity: 1,
      scale: 1,
      backgroundColor: `rgba(${CONFIG.BASE_BG_COLOR},${CONFIG.BASE_BG_TRANSPARENCY})`,
      boxShadow: `-2px 2px 0 rgba(${CONFIG.SHADOW_COLOR},${CONFIG.BASE_SHADOW_TRANSPARENCY})`,
      borderRadius: "8px",
      padding: "8px",
      boxSizing: "border-box",
      transition: { duration: CONFIG.ANIM_EXIT.duration, ease: CONFIG.ANIM_EXIT.easing },
    },
  };

// ─────────────────────────────────────────
// Hooks & measurement (inside NavIconsMobile)
// ─────────────────────────────────────────
const [dropdownCoords, setDropdownCoords] = useState({
  top:        0,
  left:       0,
  innerWidth: 0
});
const [isMeasured, setIsMeasured] = useState(false);

// When menuOpen flips true, mount portal, then measure next frame
useEffect(() => {
  if (menuOpen) {
    setIsMeasured(false);
    requestAnimationFrame(() => {
      if (hamburgerRef.current && dropdownRef.current) {
        const hbRect = hamburgerRef.current.getBoundingClientRect();
        const ddRect = dropdownRef.current.getBoundingClientRect();
        const border = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--menu-border-thickness")
        );
        setDropdownCoords({
          top:        hbRect.bottom,
          left:       hbRect.left + hbRect.width - ddRect.width,
          innerWidth: hbRect.width - 2 * border
        });
        setIsMeasured(true);
      }
    });
  } else {
    setIsMeasured(false);
  }
}, [menuOpen]);



  // ---------------------------
  // 8. Return statement.
  // The dropdown-menu is nested inside the hamburger-wrapper so that its absolute positioning
  // is relative to the hamburger.
  // ---------------------------
  return (
    <div className="burger-dropdown-container" style={DEBUG_BORDER ? { border: "2px dashed cyan" } : containerStyle}>
      <div
        className={`hamburger-wrapper ${menuOpen ? "selected" : ""}`}
        ref={hamburgerRef}
        onMouseEnter={() => {
          setIsHamburgerHovered(true);
          if (hamburgerRef.current) {
            const rect = hamburgerRef.current.getBoundingClientRect();
            console.log(
              `[IO][NavIconsMobile] Hamburger OnMouseEnter: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`
            );
          }
          if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Pointer entered hamburger area");
        }}
        onMouseLeave={() => {
          setIsHamburgerHovered(false);
          if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] Pointer left hamburger area");
        }}
        style={DEBUG_BORDER ? { outline: "2px dashed orange" } : {}}
      >
        <button
          className="hamburger-menu"
          onMouseDown={() => {
            if (!menuOpen) {
              setIsPointerDown(true);
              if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] MouseDown: Setting pointer down.");
            }
          }}
          onMouseUp={() => {
            if (!menuOpen) {
              setIsPointerDown(false);
              if (DEBUG_CONSOLE) console.log("[IO][NavIconsMobile] MouseUp: Releasing pointer down.");
            }
          }}
          onClick={() => {
            toggleMenu();
            setIsPointerDown(false);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#FFFFFF",
            cursor: "pointer",
            ...(DEBUG_BORDER ? { outline: "2px dashed red" } : {}),
          }}
        >
          <div className={`burger-btn ${menuOpen ? "selected" : ""}`}>
            <motion.div
              className="burger-anim"
              initial="initial"
              animate={animateState}
              variants={defaultHamburgerVariants}
              transition={{
                opacity: {
                  delay: CONFIG.ANIM_INTRO_FADE.delay,
                  duration: CONFIG.ANIM_INTRO_FADE.duration,
                  ease: CONFIG.ANIM_INTRO_FADE.easing,
                },
                scale: {
                  delay: CONFIG.ANIM_INTRO_EXPAND.delay,
                  duration: CONFIG.ANIM_INTRO_EXPAND.duration,
                  ease: CONFIG.ANIM_INTRO_EXPAND.easing,
                },
              }}
              style={DEBUG_BORDER ? { outline: "2px dashed blue" } : {}}
            >
              <div className="burger-icon" style={{ fontSize: "48px", color: "#FFFFFF" }}>
                <FaLayerGroup />
              </div>
              <span
                className="menu-text"
                style={{
                  display: "inline-block",
                  fontSize: "18px",
                  fontVariant: "small-caps",
                  fontFamily: "var(--font-focal-medium)",
                  marginTop: "0.25em",
                }}
              >
                Menu
              </span>
            </motion.div>
          </div>
        </button>

{menuOpen &&
  createPortal(
    <div
      className="dropdown-portal-wrapper"
      style={{
        position:   "fixed",
        top:        `${dropdownCoords.top}px`,
        left:       `${dropdownCoords.left}px`,
        zIndex:     2147483647,
        overflow:   "visible",
        visibility: dropdownCoords.innerWidth > 0 ? "visible" : "hidden"
      }}
    >
      {/* Erasing mask: 2px‐high stripe inset from the right */}
      <div
        style={{
          position:        "absolute",
          top:             0,
          right:           "var(--menu-border-thickness)",
          width:           `${dropdownCoords.innerWidth}px`,
          height:          "var(--menu-border-thickness)",
          backgroundColor: "var(--menu-background-color)",
          pointerEvents:   "none",
          zIndex:          2147483648
        }}
      />

      {/* The actual dropdown menu */}
      <div
        className="dropdown-menu"
        ref={dropdownRef}
        onMouseEnter={() => setIsDropdownHovered(true)}
        onMouseLeave={() => setIsDropdownHovered(false)}
      >
        <AnimatePresence>
          <motion.ul
            className="dropdown-list"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Email */}
            <a href={emailLink} style={{ textDecoration: "none" }}>
              <motion.li
                className="dropdown-item"
                variants={itemVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <FaEnvelopeSquare className="dropdown-icon dropdown-icon-email" />
                <span className="dropdown-text">Email</span>
              </motion.li>
            </a>

            {/* LinkedIn */}
            <a
              href={linkedInLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <motion.li
                className="dropdown-item"
                variants={itemVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <FaLinkedin className="dropdown-icon dropdown-icon-linkedin" />
                <span className="dropdown-text">LinkedIn</span>
              </motion.li>
            </a>

            {/* Resume */}
            <a
              href={resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <motion.li
                className="dropdown-item"
                variants={itemVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <FaFilePdf className="dropdown-icon dropdown-icon-pdf" />
                <span className="dropdown-text">Resume</span>
              </motion.li>
            </a>

            {/* CMU SCS */}
            <a
              href={cmuLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <motion.li
                className="dropdown-item"
                variants={itemVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <img
                  src={cmuLogo}
                  alt="CMU SCS"
                  className="dropdown-image-icon dropdown-icon-cmu"
                />
                <span className="dropdown-text">CMU SCS</span>
              </motion.li>
            </a>

            {/* MIT xPRO */}
            <a
              href={mitLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <motion.li
                className="dropdown-item"
                variants={itemVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <img
                  src={mitLogo}
                  alt="MIT xPRO"
                  className="dropdown-image-icon dropdown-icon-mit"
                />
                <span className="dropdown-text">MIT xPRO</span>
              </motion.li>
            </a>
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  )}

      </div>
    </div>
  );
};

export default NavIconsMobile;
