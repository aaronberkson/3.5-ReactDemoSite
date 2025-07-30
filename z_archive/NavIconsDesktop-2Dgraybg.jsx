import React from "react";
import { motion } from "framer-motion";
import { FaEnvelopeSquare, FaLinkedin } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6"; // Using FA6 PDF icon for better proportions
import mitLogo from "../assets/mit-xpro-light-blue.svg";
import cmuLogo from "../assets/carnegie-mellon-carnegie-red.svg";
import { getDecryptedEmail } from "../utilities/emailUtility";

// ===== Design Constants =====
// Define tall rectangular icon blocks.
const ICON_BOX_WIDTH = "70px";
const ICON_BOX_HEIGHT = "110px";

// Spacing: slightly reducing the gap.
const ICON_SPACING = "10px";
const ICON_SPACER_WIDTH = "28px";  // About half of box width but a bit smaller

//
// Background colors (darker grays similar to DemoCards)
const EMAIL_BG = "#5A5A5A";      // Lighter dark-gray
const LINKEDIN_BG = "#4E4E4E";   
const RESUME_BG = "#424242";     
const CMU_BG = "#393939";        // Darker; red glow on hover for CMU
const MIT_BG = "#2F2F2F";        // Darkest

// Inner Icon area allocation – 75% of the box height for the icon.
const ICON_AREA_HEIGHT_PERCENT = "75%";

// Icon sizes – use percentages to fill about 90% of the icon area.
const ICON_SIZE_PERCENT = "90%";

// Label styling
const LABEL_FONT_SIZE = "11px";
const LABEL_FONT_FAMILY = "var(--font-focal-light)";
const LABEL_PADDING = "2px";

// ----- Helper: Create Variants for Hard & Glowing Drop Shadows -----
// Here, we've reduced the padding from "8px" down to "6px" in all states.
const defaultGlowColor = "rgba(122,210,247,0.75)";
const createItemVariants = (glowColor = defaultGlowColor) => ({
  initial: { 
    scale: 1, 
    boxShadow: "-3px 3px 0 rgba(0,0,0,0.5)",
    borderRadius: "8px",
    padding: "6px", // reduced internal margin
    boxSizing: "border-box"
  },
  hover: { 
    scale: 1.03, 
    boxShadow: `-3px 3px 0 rgba(0,0,0,0.5), 0px 0px 12px 4px ${glowColor}`,
    borderRadius: "8px",
    padding: "6px",
    boxSizing: "border-box",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  tap: { 
    scale: 0.97, 
    boxShadow: "-1.5px 1.5px 0 rgba(0,0,0,0.5)",
    borderRadius: "8px",
    padding: "6px",
    boxSizing: "border-box",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  active: {
    scale: 1,
    boxShadow: "-3px 3px 0 rgba(0,0,0,0.5)",
    borderRadius: "8px",
    padding: "6px",
    boxSizing: "border-box",
    transition: { duration: 0.1 }
  }
});

const NavIconsDesktop = ({
  onEmailHover,
  onLinkedInHover,
  onResumeHover,
  onMITHover,
  onCMUHover,
  onHoverLeave,
  onLinkedInClick,
  onResumeClick,
  onCMUClick,
  onMITClick,
}) => {
  // Build the mailto: link using emailUtility.js.
  const emailHref = `mailto:${getDecryptedEmail()}`;

  return (
    <div
      className="desktop-icons-container"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: ICON_SPACING,
      }}
    >
      {/* Spacer */}
      <div
        style={{
          width: ICON_SPACER_WIDTH,
          height: ICON_BOX_HEIGHT,
        }}
      />

      {/* Email Icon Block */}
      <a href={emailHref} style={{ textDecoration: "none" }}>
        <motion.div
          className="desktop-icon"
          style={{
            width: ICON_BOX_WIDTH,
            height: ICON_BOX_HEIGHT,
            backgroundColor: EMAIL_BG,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
          variants={createItemVariants()}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onMouseEnter={onEmailHover}
          onMouseLeave={onHoverLeave}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div
            className="icon-container"
            style={{
              height: ICON_AREA_HEIGHT_PERCENT,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaEnvelopeSquare
              className="desktop-icon-svg"
              style={{
                fontSize: ICON_SIZE_PERCENT,
                width: ICON_SIZE_PERCENT,
                height: ICON_SIZE_PERCENT,
                color: "#FFFFFF",
              }}
            />
          </div>
          <div
            className="label-container"
            style={{
              height: "25%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="desktop-icon-label"
              style={{
                fontSize: LABEL_FONT_SIZE,
                fontFamily: LABEL_FONT_FAMILY,
                color: "#FFFFFF",
              }}
            >
              Email
            </span>
          </div>
        </motion.div>
      </a>

      {/* LinkedIn Icon Block */}
      <motion.div
        className="desktop-icon"
        style={{
          width: ICON_BOX_WIDTH,
          height: ICON_BOX_HEIGHT,
          backgroundColor: LINKEDIN_BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants()}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onMouseEnter={onLinkedInHover}
        onMouseLeave={onHoverLeave}
        onClick={onLinkedInClick}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className="icon-container"
          style={{
            height: ICON_AREA_HEIGHT_PERCENT,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaLinkedin
            className="desktop-icon-svg"
            style={{
              fontSize: ICON_SIZE_PERCENT,
              width: ICON_SIZE_PERCENT,
              height: ICON_SIZE_PERCENT,
              color: "#FFFFFF",
            }}
          />
        </div>
        <div
          className="label-container"
          style={{
            height: "25%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
            }}
          >
            LinkedIn
          </span>
        </div>
      </motion.div>

      {/* Resume Icon Block */}
      <motion.div
        className="desktop-icon"
        style={{
          width: ICON_BOX_WIDTH,
          height: ICON_BOX_HEIGHT,
          backgroundColor: RESUME_BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants()}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onMouseEnter={onResumeHover}
        onMouseLeave={onHoverLeave}
        onClick={onResumeClick}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className="icon-container"
          style={{
            height: ICON_AREA_HEIGHT_PERCENT,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaFilePdf
            className="desktop-icon-svg"
            style={{
              fontSize: ICON_SIZE_PERCENT,
              width: ICON_SIZE_PERCENT,
              height: ICON_SIZE_PERCENT,
              color: "#FFFFFF",
            }}
          />
        </div>
        <div
          className="label-container"
          style={{
            height: "25%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
            }}
          >
            Resume
          </span>
        </div>
      </motion.div>

      {/* CMU Icon Block */}
      <motion.div
        className="desktop-icon"
        style={{
          width: ICON_BOX_WIDTH,
          height: ICON_BOX_HEIGHT,
          backgroundColor: CMU_BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants("rgba(200,16,46,0.75)")}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onMouseEnter={onCMUHover}
        onMouseLeave={onHoverLeave}
        onClick={onCMUClick}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className="icon-container"
          style={{
            height: ICON_AREA_HEIGHT_PERCENT,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={cmuLogo}
            alt="CMU SCS"
            className="desktop-icon-img"
            style={{
              width: "90%",
              height: "90%",
              objectFit: "contain",
            }}
          />
        </div>
        <div
          className="label-container"
          style={{
            height: "25%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
            }}
          >
            CMU SCS
          </span>
        </div>
      </motion.div>

      {/* MIT Icon Block */}
      <motion.div
        className="desktop-icon"
        style={{
          width: ICON_BOX_WIDTH,
          height: ICON_BOX_HEIGHT,
          backgroundColor: MIT_BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants("rgba(0,123,255,0.75)")}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onMouseEnter={onMITHover}
        onMouseLeave={onHoverLeave}
        onClick={onMITClick}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className="icon-container"
          style={{
            height: ICON_AREA_HEIGHT_PERCENT,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={mitLogo}
            alt="MIT xPRO"
            className="desktop-icon-img"
            style={{
              width: "90%",
              height: "90%",
              objectFit: "contain",
            }}
          />
        </div>
        <div
          className="label-container"
          style={{
            height: "25%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
            }}
          >
            MIT xPRO
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default NavIconsDesktop;
