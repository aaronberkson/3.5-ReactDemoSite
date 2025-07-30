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
import MessageModal from "./MessageModal";
import "./NavIconsDesktop.css";

// Debug flag
const DEBUG_MODE = false;
if (DEBUG_MODE) {
  console.log("[IO][NavIconsDesktop] File loaded.");
}

// Set the navbar height to 150px
const NAVBAR_HEIGHT = 150; // px

/* ================== Intro Animation Constants ================== */
const ICON_INTRO_OVERALL_DELAY = 0.1; // seconds
const ICON_CASCADE_DELAY = 0.1;       // seconds

const ICON_START_SCALE = 0.7;
const ICON_EXPANSION_DURATION = 0.5;
const ICON_EXPANSION_EASING = [0.42, 0, 0.58, 1];

/* ================== Design Constants ================== */
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

// Scaling constants for the special 769–1023 range:
const MIN_ICON_SCALE = 0.76;           // minimum horizontal scale factor
const MIN_ICON_VERTICAL_SCALE = 0.88;  // minimum vertical scale factor

/* ================== Background Colors ================== */
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

/* ================== Glow Colors (Drop Shadows) ================== */
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

/* ================== Helper: Create Interactive Variants ================== */
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
    transition: { type: "spring", stiffness: 500, damping: 20 },
  },
});

/* ================== Icon Definitions ================== */
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
  const [showMessageModal, setShowMessageModal] = useState(false);
  if (DEBUG_MODE) {
    console.log("[IO][NavIconsDesktop] Component mounted. appReady =", appReady);
  }

  // Consume NavbarHoverContext.
  const { setLine2Id } = useContext(NavbarHoverContext);
  if (DEBUG_MODE) {
    console.log("[IO][NavIconsDesktop] Consumed NavbarHoverContext.");
  }

  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [rightOffset, setRightOffset] = useState(() => computeRightOffset());

  function computeRightOffset() {
    const dMax =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--desktop-max-width")
      ) || 1280;
    const cp =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--container-padding-x")
      ) || 0;
    const vw = window.innerWidth;
    if (vw < dMax) {
      return cp; // Fluid layout.
    } else {
      return (vw - dMax) / 2 + cp;
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setRightOffset(computeRightOffset());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      if (DEBUG_MODE) {
        console.log("[IO][NavIconsDesktop] Cleaning up resize listener.");
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (DEBUG_MODE) {
    console.log("[IO][NavIconsDesktop] Computed rightOffset:", rightOffset, "px");
  }

  // Use a container with fixed height equal to the NAVBAR_HEIGHT. This container is expected to be placed inside
  // a navbar that is positioned relative.
  const containerStyle = {
    position: "fixed",
    top: "0",
    height: `${NAVBAR_HEIGHT}px`,
    right: `${rightOffset}px`,
    zIndex: 9999,
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center", // Flex centering vertically
    gap: ICON_SPACING,
  };

  // Determine if we are in the special 769–1023 range.
  const isSmallDesktop = viewportWidth >= 769 && viewportWidth <= 1024;
  // Compute gradual horizontal scale factor from 1 to MIN_ICON_SCALE.
  const computedIconWidthScale =
    viewportWidth >= 1024
      ? 1
      : viewportWidth >= 769
      ? MIN_ICON_SCALE + ((viewportWidth - 769) / (1024 - 769)) * (1 - MIN_ICON_SCALE)
      : 1;
  // Compute gradual vertical scale factor from 1 to MIN_ICON_VERTICAL_SCALE.
  const computedIconHeightScale =
    viewportWidth >= 1024
      ? 1
      : viewportWidth >= 769
      ? MIN_ICON_VERTICAL_SCALE + ((viewportWidth - 769) / (1024 - 769)) * (1 - MIN_ICON_VERTICAL_SCALE)
      : 1;
  const iconContainerWidth = `${Math.round(parseInt(ICON_BOX_WIDTH) * computedIconWidthScale)}px`;
  const iconContainerHeight = `${Math.round(parseInt(ICON_BOX_HEIGHT) * computedIconHeightScale)}px`;

  // Helper: Scale a dimension string (e.g., "70px") by a provided scale factor.
  const scaleDimension = (dimStr, scale) => {
    const num = parseInt(dimStr, 10);
    return `${Math.round(num * scale)}px`;
  };

  // Helper: Adjust an icon element's style by scaling its relevant size properties.
  const scaleIconElement = (iconElement) => {
    if (!iconElement || !iconElement.props || !iconElement.props.style) return iconElement;
    const origStyle = iconElement.props.style;
    return React.cloneElement(iconElement, {
      style: {
        ...origStyle,
        fontSize: origStyle.fontSize ? scaleDimension(origStyle.fontSize, computedIconWidthScale) : undefined,
        width: origStyle.width ? scaleDimension(origStyle.width, computedIconWidthScale) : undefined,
        height: origStyle.height ? scaleDimension(origStyle.height, computedIconHeightScale) : undefined,
      },
    });
  };

  const handleHover = (iconId) => {
    if (DEBUG_MODE) {
      console.log("[IO][NavIconsDesktop] handleHover called for icon:", iconId);
    }
    switch (iconId) {
      case "email":
        setLine2Id("email");
        break;
      case "linkedin":
        setLine2Id("linkedin");
        break;
      case "resume":
        setLine2Id("resume");
        break;
      case "cmu":
        setLine2Id("cmu");
        break;
      case "mit":
        setLine2Id("mit");
        break;
      default:
        if (DEBUG_MODE) {
          console.log("[IO][NavIconsDesktop] handleHover: No case matched for icon:", iconId);
        }
        break;
    }
  };

const handleMouseLeave = () => {
   // if the message‐modal is up, don’t hide the email hover text
   if (showMessageModal) return;

   if (DEBUG_MODE) {
     console.log(
       "[IO][NavIconsDesktop] handleMouseLeave called. Resetting to default info."
     );
   }
   setLine2Id("default");
};

  return (
    <>
      <motion.div
        className="nav-icons-desktop"
        style={containerStyle}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            delay: ICON_INTRO_OVERALL_DELAY,
            duration: ICON_EXPANSION_DURATION,
            ease: ICON_EXPANSION_EASING,
          },
        }}
      >
        {navIcons.map((iconData, index) => {
          // Adjust the icon element for scaling if needed.
          const iconElement = iconData.icon;
          const adjustedIconElement =
            isSmallDesktop && iconElement ? scaleIconElement(iconElement) : iconElement;
          return (
            <motion.div
              key={iconData.id}
              initial={{ opacity: 0, scale: ICON_START_SCALE }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  delay: appReady ? ICON_INTRO_OVERALL_DELAY + index * ICON_CASCADE_DELAY : 0,
                  duration: ICON_EXPANSION_DURATION,
                  ease: ICON_EXPANSION_EASING,
                },
              }}
              style={{
                width: iconContainerWidth,
                height: iconContainerHeight,
                // Use auto margins to let flex centering in the parent handle vertical centering.
                marginTop: "auto",
                marginBottom: "auto",
              }}
            >
              {iconData.href ? (
                <div
                  style={{ textDecoration: "none", cursor: "pointer" }}
                  onClick={() => {
                    if (iconData.id === "email") {
                      setShowMessageModal(true)
                    } else {
                      window.open(iconData.href, "_blank", "noopener")
                    }
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
                      width: iconContainerWidth,
                      height: iconContainerHeight,
                      display: "flex",
                      flexDirection: isSmallDesktop ? "row" : "column",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {adjustedIconElement}
                    </div>
                    {!isSmallDesktop && (
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
                    )}
                  </motion.div>
                </div>

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
                    width: iconContainerWidth,
                    height: iconContainerHeight,
                    display: "flex",
                    flexDirection: isSmallDesktop ? "row" : "column",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {adjustedIconElement}
                  </div>
                  {!isSmallDesktop && (
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
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
      {showMessageModal && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setLine2Id("default");    // reset the nav text
          }}
        />
      )}
    </>
  );
};

export default NavIconsDesktop;
