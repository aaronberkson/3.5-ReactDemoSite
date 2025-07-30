// NavIconsMobile.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaEnvelopeSquare, FaLinkedin } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import mitLogo from "../assets/mit-xpro-light-blue.svg";
import cmuLogo from "../assets/carnegie-mellon-carnegie-red.svg";
import { getDecryptedEmail } from "../utilities/emailUtility.js";
import "./NavIconsMobile.css";

const NavIconsMobile = ({ resumePDF }) => {
  console.log("[IO][NavIconsMobile] Component mounting.");

  // Compute viewport width
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setViewportWidth(currentWidth);
      console.log("[IO][NavIconsMobile] Viewport width updated:", currentWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute rightOffset using desktop positioning logic.
  const desktopMaxWidth = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--desktop-max-width")
  ) || 1280;
  const appWideGutter = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--app-wide-gutter")
  ) || 50;
  const offsetCorrection = 28;
  const rightOffset =
    viewportWidth >= desktopMaxWidth
      ? `${(viewportWidth - desktopMaxWidth) / 2 + appWideGutter - offsetCorrection}px`
      : `${appWideGutter - offsetCorrection}px`;
  console.log("[IO][NavIconsMobile] Computed rightOffset:", rightOffset);

  // Resolved Links using email utility.
  const emailLink = `mailto:${getDecryptedEmail()}`;
  console.log("[IO][NavIconsMobile] Resolved email link:", emailLink);
  const linkedInLink = "https://linkedin.com/in/aaronberkson";
  const resumeLink = resumePDF;
  const cmuLink = "https://csd.cmu.edu/";
  const mitLink = "https://xpro.mit.edu/courses/course-v1:xPRO+PCCx+R1/";

  // State for dropdown menu.
  const [menuOpen, setMenuOpen] = useState(false);
  console.log("[IO][NavIconsMobile] Initial menuOpen state:", menuOpen);

  // Auto-collapse timer: collapse menu after 5 seconds if left open.
  useEffect(() => {
    if (menuOpen) {
      console.log("[IO][NavIconsMobile] Dropdown open. Setting auto-collapse timer (5s).");
      const timer = setTimeout(() => {
        console.log("[IO][NavIconsMobile] Auto-collapse timer triggered. Collapsing dropdown.");
        setMenuOpen(false);
      }, 5000);
      return () => {
        console.log("[IO][NavIconsMobile] Clearing auto-collapse timer.");
        clearTimeout(timer);
      };
    }
  }, [menuOpen]);

  // Toggle menu on click.
  const toggleMenu = () => {
    console.log("[IO][NavIconsMobile] Toggling menu. Previous state:", menuOpen);
    setMenuOpen(!menuOpen);
    console.log("[IO][NavIconsMobile] New menu state will be:", !menuOpen);
  };

  // Container style replicates NavIconsDesktop positioning.
  const containerStyle = {
    position: "fixed",
    top: "28px", // same as ICON_TOP_MARGIN in desktop
    right: rightOffset,
    zIndex: 9999,
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  };

  // Framer Motion variants for hamburger button.
  const buttonVariants = {
    initial: { scale: 1, backgroundColor: "rgba(0,0,0,0)" },
    hover: { scale: 1.05, backgroundColor: "rgba(122,210,247,0.25)" },
    tap: { scale: 0.95, backgroundColor: "rgba(122,210,247,0.35)" },
  };

  // Variants for dropdown appearance.
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="hamburger-container" style={containerStyle}>
      {/* Hamburger button: displays a stack icon above "menu" label */}
      <motion.div
        className="hamburger-button"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onClick={toggleMenu}
      >
        <FaBars className="hamburger-icon" />
        <span className="hamburger-label">menu</span>
      </motion.div>
      
      {/* Dropdown menu, only visible if menuOpen === true */}
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            className="dropdown-list-mobile"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <li>
              <a
                href={emailLink}
                style={{ textDecoration: "none", color: "#FFF" }}
                onClick={() => {
                  console.log("[IO][NavIconsMobile] Email link clicked.");
                  setMenuOpen(false);
                }}
              >
                <span>Email</span>
              </a>
            </li>
            <li>
              <a
                href={linkedInLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#FFF" }}
                onClick={() => {
                  console.log("[IO][NavIconsMobile] LinkedIn link clicked.");
                  setMenuOpen(false);
                }}
              >
                <span>LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href={resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#FFF" }}
                onClick={() => {
                  console.log("[IO][NavIconsMobile] Resume link clicked.");
                  setMenuOpen(false);
                }}
              >
                <span>Resume</span>
              </a>
            </li>
            <li>
              <a
                href={cmuLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#FFF" }}
                onClick={() => {
                  console.log("[IO][NavIconsMobile] CMU link clicked.");
                  setMenuOpen(false);
                }}
              >
                <span>CMU SCS</span>
              </a>
            </li>
            <li>
              <a
                href={mitLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#FFF" }}
                onClick={() => {
                  console.log("[IO][NavIconsMobile] MIT link clicked.");
                  setMenuOpen(false);
                }}
              >
                <span>MIT xPRO</span>
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavIconsMobile;
