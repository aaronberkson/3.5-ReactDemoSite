// src/NavIconsDesktop.jsx
import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEnvelopeSquare, FaLinkedin, FaFilePdf } from "react-icons/fa";
import cmuLogo from "../assets/carnegie-mellon-carnegie-red.svg";
import mitLogo from "../assets/mit-xpro-light-blue.svg";
import { getDecryptedEmail } from "../utilities/emailUtility";
import resumePDF from "../assets/Aaron-Berkson-Design-Technologist-2pgs.pdf";
import { NavbarHoverContext } from "../contexts/NavbarHoverContext";
import { useAppReady } from "../contexts/AppReadyContext";
import "./NavIconsDesktop.css";

// Debug flag for this file
const DEBUG_MODE = true;
if (DEBUG_MODE) {
  console.log("[IO][NavIconsDesktop] File loaded.");
}

/* ================= Intro Animation Constants ================= */
// Overall delay before any icon animations start (in seconds)
const ICON_INTRO_OVERALL_DELAY = 0.2;
// The initial scale for the icons (as a percentage of final scale)
const ICON_INITIAL_SCALE = 0.7;
// How long the expansion (scaling up) animation takes (in seconds)
const ICON_EXPANSION_DURATION = 0.6;
// Delay between each individual icon’s animation (in seconds)
const ICON_CASCADE_DELAY = 0.15;
// Easing curve for the animations (cubic-bezier values)
const ICON_ANIMATION_EASING = [0.42, 0, 0.58, 1];

/* ================= Design Constants ================= */
const ICON_BOX_WIDTH = "70px";
const ICON_BOX_HEIGHT = "90px";
const ICON_SPACING = "10px";
const ICON_AREA_HEIGHT_PERCENT = "75%";

const EMAIL_ICON_SIZE = "57px";
const LINKEDIN_ICON_SIZE = "57px";
const RESUME_ICON_SIZE = "50px";
const CMU_ICON_SIZE = "50px";
const MIT_ICON_SIZE = "50px";

const LABEL_FONT_SIZE = "11px";
const LABEL_FONT_FAMILY = "var(--font-focal-light)";
const CORNER_RADIUS = "8px";

// Background Colors
const CONTAINER_BG_ALPHA = 0.77;
const HOVER_CONTAINER_BG_ALPHA = 1;
const MOUSE_DOWN_CONTAINER_BG_ALPHA = 0.85;

const EMAIL_BG = `rgba(90,90,90,${CONTAINER_BG_ALPHA})`;
const EMAIL_BG_HOVER = `rgba(90,90,90,${HOVER_CONTAINER_BG_ALPHA})`;
const EMAIL_BG_MOUSEDOWN = `rgba(90,90,90,${MOUSE_DOWN_CONTAINER_BG_ALPHA})`;

const LINKEDIN_BG = `rgba(78,78,78,${CONTAINER_BG_ALPHA})`;
const LINKEDIN_BG_HOVER = `rgba(78,78,78,${HOVER_CONTAINER_BG_ALPHA})`;
const LINKEDIN_BG_MOUSEDOWN = `rgba(78,78,78,${MOUSE_DOWN_CONTAINER_BG_ALPHA})`;

const RESUME_BG = `rgba(66,66,66,${CONTAINER_BG_ALPHA})`;
const RESUME_BG_HOVER = `rgba(66,66,66,${HOVER_CONTAINER_BG_ALPHA})`;
const RESUME_BG_MOUSEDOWN = `rgba(66,66,66,${MOUSE_DOWN_CONTAINER_BG_ALPHA})`;

const CMU_BG = `rgba(57,57,57,${CONTAINER_BG_ALPHA})`;
const CMU_BG_HOVER = `rgba(57,57,57,${HOVER_CONTAINER_BG_ALPHA})`;
const CMU_BG_MOUSEDOWN = `rgba(57,57,57,${MOUSE_DOWN_CONTAINER_BG_ALPHA})`;

const MIT_BG = `rgba(47,47,47,${CONTAINER_BG_ALPHA})`;
const MIT_BG_HOVER = `rgba(47,47,47,${HOVER_CONTAINER_BG_ALPHA})`;
const MIT_BG_MOUSEDOWN = `rgba(47,47,47,${MOUSE_DOWN_CONTAINER_BG_ALPHA})`;

// Glow Colors (Drop Shadows)
const DROP_SHADOW_ALPHA = 0.66;
const HOVER_DROP_SHADOW_ALPHA = 1;
const MOUSE_DOWN_DROP_SHADOW_ALPHA = 0.85;

const EMAIL_GLOW_COLOR = `rgba(0,234,255,${DROP_SHADOW_ALPHA})`;
const EMAIL_HOVER_GLOW_COLOR = `rgba(0,234,255,${HOVER_DROP_SHADOW_ALPHA})`;
const EMAIL_MOUSEDOWN_GLOW_COLOR = `rgba(0,234,255,${MOUSE_DOWN_DROP_SHADOW_ALPHA})`;

const LINKEDIN_GLOW_COLOR = `rgba(0,198,255,${DROP_SHADOW_ALPHA})`;
const LINKEDIN_HOVER_GLOW_COLOR = `rgba(0,198,255,${HOVER_DROP_SHADOW_ALPHA})`;
const LINKEDIN_MOUSEDOWN_GLOW_COLOR = `rgba(0,198,255,${MOUSE_DOWN_DROP_SHADOW_ALPHA})`;

const RESUME_GLOW_COLOR = `rgba(0,138,207,${DROP_SHADOW_ALPHA})`;
const RESUME_HOVER_GLOW_COLOR = `rgba(0,138,207,${HOVER_DROP_SHADOW_ALPHA})`;
const RESUME_MOUSEDOWN_GLOW_COLOR = `rgba(0,138,207,${MOUSE_DOWN_DROP_SHADOW_ALPHA})`;

const CMU_GLOW_COLOR = `rgba(200,16,46,${DROP_SHADOW_ALPHA})`;
const CMU_HOVER_GLOW_COLOR = `rgba(200,16,46,${HOVER_DROP_SHADOW_ALPHA})`;
const CMU_MOUSEDOWN_GLOW_COLOR = `rgba(200,16,46,${MOUSE_DOWN_DROP_SHADOW_ALPHA})`;

const MIT_GLOW_COLOR = `rgba(0,123,255,${DROP_SHADOW_ALPHA})`;
const MIT_HOVER_GLOW_COLOR = `rgba(0,123,255,${HOVER_DROP_SHADOW_ALPHA})`;
const MIT_MOUSEDOWN_GLOW_COLOR = `rgba(0,123,255,${MOUSE_DOWN_DROP_SHADOW_ALPHA})`;

// Helper: Create interactive variants for icon containers.
const createItemVariants = (
  defaultGlowColor,
  hoverGlowColor,
  mousedownGlowColor,
  defaultBg,
  hoverBg,
  mousedownBg
) => ({
  initial: {
    scale: 1,
    backgroundColor: defaultBg,
    boxShadow: `-2px 2px 0 ${defaultGlowColor}`,
    borderRadius: CORNER_RADIUS,
    padding: "6px",
    boxSizing: "border-box",
  },
  hover: {
    scale: 1.03,
    backgroundColor: hoverBg,
    boxShadow: `-3px 3px 0 ${hoverGlowColor}, 0px 0px 10px 3px ${hoverGlowColor}`,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  mousedown: {
    scale: 0.97,
    backgroundColor: mousedownBg,
    boxShadow: `-1.5px 1.5px 0 ${mousedownGlowColor}`,
    transition: { duration: 0 },
    transition: { type: "spring", stiffness: 500, damping: 20 },
  },
});

// Define our icon definitions.
const navIcons = [
  {
    id: "email",
    label: "Email",
    href: `mailto:${getDecryptedEmail()}`,
    icon: (
      <FaEnvelopeSquare
        style={{
          fontSize: EMAIL_ICON_SIZE,
          width: EMAIL_ICON_SIZE,
          height: EMAIL_ICON_SIZE,
          color: "#FFF",
        }}
      />
    ),
    variants: {
      defaultBg: EMAIL_BG,
      hoverBg: EMAIL_BG_HOVER,
      mousedownBg: EMAIL_BG_MOUSEDOWN,
      defaultGlow: EMAIL_GLOW_COLOR,
      hoverGlow: EMAIL_HOVER_GLOW_COLOR,
      mousedownGlow: EMAIL_MOUSEDOWN_GLOW_COLOR,
    },
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/aaronberkson",
    icon: (
      <FaLinkedin
        style={{
          fontSize: LINKEDIN_ICON_SIZE,
          width: LINKEDIN_ICON_SIZE,
          height: LINKEDIN_ICON_SIZE,
          color: "#FFF",
        }}
      />
    ),
    variants: {
      defaultBg: LINKEDIN_BG,
      hoverBg: LINKEDIN_BG_HOVER,
      mousedownBg: LINKEDIN_BG_MOUSEDOWN,
      defaultGlow: LINKEDIN_GLOW_COLOR,
      hoverGlow: LINKEDIN_HOVER_GLOW_COLOR,
      mousedownGlow: LINKEDIN_MOUSEDOWN_GLOW_COLOR,
    },
  },
  {
    id: "resume",
    label: "Resume",
    href: resumePDF,
    icon: (
      <FaFilePdf
        style={{
          fontSize: RESUME_ICON_SIZE,
          width: RESUME_ICON_SIZE,
          height: RESUME_ICON_SIZE,
          color: "#FFF",
        }}
      />
    ),
    variants: {
      defaultBg: RESUME_BG,
      hoverBg: RESUME_BG_HOVER,
      mousedownBg: RESUME_BG_MOUSEDOWN,
      defaultGlow: RESUME_GLOW_COLOR,
      hoverGlow: RESUME_HOVER_GLOW_COLOR,
      mousedownGlow: RESUME_MOUSEDOWN_GLOW_COLOR,
    },
  },
  {
    id: "cmu",
    label: "CMU SCS",
    href: "https://csd.cmu.edu/",
    icon: (
      <img
        src={cmuLogo}
        alt="CMU SCS"
        style={{
          width: CMU_ICON_SIZE,
          height: CMU_ICON_SIZE,
          objectFit: "contain",
        }}
      />
    ),
    variants: {
      defaultBg: CMU_BG,
      hoverBg: CMU_BG_HOVER,
      mousedownBg: CMU_BG_MOUSEDOWN,
      defaultGlow: CMU_GLOW_COLOR,
      hoverGlow: CMU_HOVER_GLOW_COLOR,
      mousedownGlow: CMU_MOUSEDOWN_GLOW_COLOR,
    },
  },
  {
    id: "mit",
    label: "MIT xPRO",
    href: "https://xpro.mit.edu/courses/course-v1:xPRO+PCCx+R1/",
    icon: (
      <img
        src={mitLogo}
        alt="MIT xPRO"
        style={{
          width: MIT_ICON_SIZE,
          height: MIT_ICON_SIZE,
          objectFit: "contain",
        }}
      />
    ),
    variants: {
      defaultBg: MIT_BG,
      hoverBg: MIT_BG_HOVER,
      mousedownBg: MIT_BG_MOUSEDOWN,
      defaultGlow: MIT_GLOW_COLOR,
      hoverGlow: MIT_HOVER_GLOW_COLOR,
      mousedownGlow: MIT_MOUSEDOWN_GLOW_COLOR,
    },
  },
];

const NavIconsDesktop = () => {
  const { appReady } = useAppReady();
  if (DEBUG_MODE) {
    console.log("[IO][NavIconsDesktop] Component mounted. appReady =", appReady);
  }

  const { setLine2Data } = useContext(NavbarHoverContext);
  if (DEBUG_MODE) {
    console.log("[IO][NavIconsDesktop] Consumed NavbarHoverContext.");
  }

  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      if (DEBUG_MODE) {
        console.log("[IO][NavIconsDesktop] Window resized. New viewportWidth:", newWidth);
      }
      setViewportWidth(newWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      if (DEBUG_MODE) {
        console.log("[IO][NavIconsDesktop] Cleaning up resize listener.");
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const desktopMaxWidth =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--desktop-max-width")
    ) || 1280;
  const appWideGutter =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--app-wide-gutter")
    ) || 50;
  const offsetCorrection = 28;

  const rightOffset =
    viewportWidth >= desktopMaxWidth
      ? `${(viewportWidth - desktopMaxWidth) / 2 + appWideGutter - offsetCorrection}px`
      : `${appWideGutter - offsetCorrection}px`;
  if (DEBUG_MODE) {
    console.log("[IO][NavIconsDesktop] Computed rightOffset:", rightOffset);
  }

  // Use a fixed container so the icons remain in place even when scrolling.
  const containerStyle = {
    position: "fixed",
    top: "calc((var(--navbar-min-height) - 90px) / 2)",
    right: rightOffset,
    zIndex: 9999,
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    gap: ICON_SPACING,
  };

  const handleHover = (iconId) => {
    if (DEBUG_MODE) {
      console.log("[IO][NavIconsDesktop] handleHover called for icon:", iconId);
    }
    switch (iconId) {
      case "email":
        setLine2Data({
          main: (
            <>
              <strong className="glow-email">Email</strong>&nbsp;{getDecryptedEmail()}
            </>
          ),
          shadow: (
            <>
              <strong style={{ fontFamily: "var(--font-focal-extrabold)", color: "black", opacity: 1 }}>
                Email
              </strong>
              &nbsp;{getDecryptedEmail()}
            </>
          ),
        });
        break;
      case "linkedin":
        setLine2Data({
          main: (
            <>
              <strong className="glow-linkedin">LinkedIn</strong>.com/in/aaronberkson
            </>
          ),
          shadow: (
            <>
              <strong style={{ fontFamily: "var(--font-focal-extrabold)", color: "black", opacity: 1 }}>
                LinkedIn
              </strong>
              .com/in/aaronberkson
            </>
          ),
        });
        break;
      case "resume":
        setLine2Data({
          main: (
            <>
              <strong className="glow-pdf">Resume</strong>&nbsp;.pdf download
            </>
          ),
          shadow: (
            <>
              <strong style={{ fontFamily: "var(--font-focal-extrabold)", color: "black", opacity: 1 }}>
                Resume
              </strong>
              &nbsp;.pdf download
            </>
          ),
        });
        break;
      case "cmu":
        setLine2Data({
          main: (
            <>
              <strong className="glow-cmu">Carnegie Mellon</strong>&nbsp;B.S. in Computer Science
            </>
          ),
          shadow: (
            <>
              <strong style={{ fontFamily: "var(--font-focal-extrabold)", color: "black", opacity: 1 }}>
                Carnegie Mellon
              </strong>
              &nbsp;B.S. in Computer Science
            </>
          ),
        });
        break;
      case "mit":
        setLine2Data({
          main: (
            <>
              <strong className="glow-mit">MIT xPRO</strong>&nbsp;Full Stack Certificate in MERN
            </>
          ),
          shadow: (
            <>
              <strong style={{ fontFamily: "var(--font-focal-extrabold)", color: "black", opacity: 1 }}>
                MIT xPRO
              </strong>
              &nbsp;Full Stack Certificate in MERN
            </>
          ),
        });
        break;
      default:
        if (DEBUG_MODE) {
          console.log("[IO][NavIconsDesktop] handleHover: No case matched for icon:", iconId);
        }
        break;
    }
  };

  const handleMouseLeave = () => {
    if (DEBUG_MODE) {
      console.log("[IO][NavIconsDesktop] handleMouseLeave called. Resetting to default info.");
    }
    setLine2Data({
      main: (
        <>
          <span className="glow-react">React&nbsp;</span>
          <span style={{ fontFamily: "var(--font-focal-medium)" }}>full stack demos</span>
        </>
      ),
      shadow: (
        <>
          <span style={{ fontFamily: "var(--font-focal-extrabold)", color: "black", opacity: 1 }}>
            React&nbsp;
          </span>
          <span style={{ fontFamily: "var(--font-focal-medium)", color: "black", opacity: 1 }}>
            full stack demos
          </span>
        </>
      ),
    });
  };

  return (
    <motion.div
      className="nav-icons-desktop"
      style={containerStyle}
      initial={{ opacity: 0, scale: ICON_INITIAL_SCALE }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          delay: ICON_INTRO_OVERALL_DELAY,
          duration: ICON_EXPANSION_DURATION,
          ease: ICON_ANIMATION_EASING,
        },
      }}
    >
      {navIcons.map((iconData, index) => (
        <motion.div
          key={iconData.id}
          initial={{ opacity: 0, scale: ICON_INITIAL_SCALE }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              delay: appReady ? ICON_INTRO_OVERALL_DELAY + index * ICON_CASCADE_DELAY : 0,
              duration: ICON_EXPANSION_DURATION,
              ease: ICON_ANIMATION_EASING,
            },
          }}
          style={{ width: ICON_BOX_WIDTH, height: ICON_BOX_HEIGHT }}
        >
          {iconData.href ? (
            <a
              href={iconData.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              onClick={(e) => {
                e.preventDefault();
                if (DEBUG_MODE) {
                  console.log("[IO][NavIconsDesktop] Link clicked for icon:", iconData.id);
                }
                window.open(iconData.href, "_blank");
              }}
              onMouseEnter={() => handleHover(iconData.id)}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                variants={createItemVariants(
                  iconData.variants.defaultGlow,
                  iconData.variants.hoverGlow,
                  iconData.variants.mousedownGlow,
                  iconData.variants.defaultBg,
                  iconData.variants.hoverBg,
                  iconData.variants.mousedownBg
                )}
                initial="initial"
                whileHover="hover"
                whileTap="mousedown"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: ICON_BOX_WIDTH,
                  height: ICON_BOX_HEIGHT,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    height: ICON_AREA_HEIGHT_PERCENT,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {iconData.icon}
                </div>
                <div
                  style={{
                    height: "25%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: LABEL_FONT_SIZE,
                      fontFamily: LABEL_FONT_FAMILY,
                      color: "#FFF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {iconData.label}
                  </span>
                </div>
              </motion.div>
            </a>
          ) : (
            <motion.div
              variants={createItemVariants(
                iconData.variants.defaultGlow,
                iconData.variants.hoverGlow,
                iconData.variants.mousedownGlow,
                iconData.variants.defaultBg,
                iconData.variants.hoverBg,
                iconData.variants.mousedownBg
              )}
              initial="initial"
              whileHover="hover"
              whileTap="mousedown"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onMouseEnter={() => handleHover(iconData.id)}
              onMouseLeave={handleMouseLeave}
              style={{
                width: ICON_BOX_WIDTH,
                height: ICON_BOX_HEIGHT,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  height: ICON_AREA_HEIGHT_PERCENT,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {iconData.icon}
              </div>
              <div
                style={{
                  height: "25%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: LABEL_FONT_SIZE,
                    fontFamily: LABEL_FONT_FAMILY,
                    color: "#FFF",
                    whiteSpace: "nowrap",
                  }}
                >
                  {iconData.label}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default NavIconsDesktop;
