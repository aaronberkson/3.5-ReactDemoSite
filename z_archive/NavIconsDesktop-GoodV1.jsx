import React from "react";
import { motion } from "framer-motion";
import { FaEnvelopeSquare, FaLinkedin } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6"; // Using FA6 PDF icon for better proportions
import mitLogo from "../assets/mit-xpro-light-blue.svg";
import cmuLogo from "../assets/carnegie-mellon-carnegie-red.svg";
import { getDecryptedEmail } from "../utilities/emailUtility";

// ===== Design Constants =====

// Container dimensions for each icon block:
const ICON_BOX_WIDTH = "70px";
const ICON_BOX_HEIGHT = "90px";

// Spacing constants:
const ICON_SPACING = "10px";
const ICON_SPACER_WIDTH = "28px";

// Now restore the variety of grays for the background of each container:
const EMAIL_BG = "#5A5A5A";      // Lighter gray for Email
const LINKEDIN_BG = "#4E4E4E";   // Slightly darker for LinkedIn
const RESUME_BG = "#424242";     // Medium–dark for Resume
const CMU_BG = "#393939";        // Darker for CMU
const MIT_BG = "#2F2F2F";        // Darkest for MIT

// Inner icon area – 75% of container height.
const ICON_AREA_HEIGHT_PERCENT = "75%";

// --- Individual Icon Size Constants ---
// Adjust these values to fine‑tune each icon’s (visible) size.
const EMAIL_ICON_SIZE = "57px";
const LINKEDIN_ICON_SIZE = "57px";
const RESUME_ICON_SIZE = "50px";
const CMU_ICON_SIZE = "50px";
const MIT_ICON_SIZE = "50px";

// Label styling:
const LABEL_FONT_SIZE = "11px";
const LABEL_FONT_FAMILY = "var(--font-focal-light)";
const LABEL_PADDING = "2px";
const LABEL_MARGIN_TOP = "4px";

// ----- Controls for Drop Shadow & Corners -----
// Drop shadow opacity (applies to Email, LinkedIn, and Resume)
const DROP_SHADOW_ALPHA = 0.5;
// Container curved corner radius:
const CORNER_RADIUS = "8px";

// --- Glow / Drop-Shadow Colors ---
// For Email, LinkedIn, and Resume we use three different vivid cyan stops based on your gradient:
// Email: #00EAFF, LinkedIn: #00C6FF, Resume: #008ACF.
const EMAIL_GLOW_COLOR = `rgba(0,234,255,${DROP_SHADOW_ALPHA})`;
const LINKEDIN_GLOW_COLOR = `rgba(0,198,255,${DROP_SHADOW_ALPHA})`;
const RESUME_GLOW_COLOR = `rgba(0,138,207,${DROP_SHADOW_ALPHA})`;

// For CMU and MIT, retain the original glow colors (with our common alpha).
const CMU_GLOW_COLOR = `rgba(200,16,46,${DROP_SHADOW_ALPHA})`;
const MIT_GLOW_COLOR = `rgba(0,123,255,${DROP_SHADOW_ALPHA})`;

// ----- Helper: Create Variants for Hard & Glowing Drop Shadows -----
// The drop shadow is applied to the container via boxShadow.
const createItemVariants = (glowColor) => ({
  initial: {
    scale: 1,
    boxShadow: `-2px 2px 0 ${glowColor}`,
    borderRadius: CORNER_RADIUS,
    padding: "6px",
    boxSizing: "border-box"
  },
  hover: {
    scale: 1.03,
    boxShadow: `-3px 3px 0 ${glowColor}, 0px 0px 10px 3px ${glowColor}`,
    borderRadius: CORNER_RADIUS,
    padding: "6px",
    boxSizing: "border-box",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.97,
    boxShadow: `-1px 1px 0 ${glowColor}`,
    borderRadius: CORNER_RADIUS,
    padding: "6px",
    boxSizing: "border-box",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  active: {
    scale: 1,
    boxShadow: `-2px 2px 0 ${glowColor}`,
    borderRadius: CORNER_RADIUS,
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
  const emailHref = `mailto:${getDecryptedEmail()}`;

  return (
    <div
      className="nav-icons-desktop"
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
            cursor: "pointer",
            boxSizing: "border-box",
          }}
          variants={createItemVariants(EMAIL_GLOW_COLOR)}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={onEmailHover}
          onMouseLeave={onHoverLeave}
        >
          <div
            className="icon-container"
            style={{
              height: ICON_AREA_HEIGHT_PERCENT,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FaEnvelopeSquare
              className="desktop-icon-svg"
              style={{
                fontSize: EMAIL_ICON_SIZE,
                width: EMAIL_ICON_SIZE,
                height: EMAIL_ICON_SIZE,
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
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              className="desktop-icon-label"
              style={{
                fontSize: LABEL_FONT_SIZE,
                fontFamily: LABEL_FONT_FAMILY,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
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
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants(LINKEDIN_GLOW_COLOR)}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseEnter={onLinkedInHover}
        onMouseLeave={onHoverLeave}
        onClick={onLinkedInClick}
      >
        <div
          className="icon-container"
          style={{
            height: ICON_AREA_HEIGHT_PERCENT,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FaLinkedin
            className="desktop-icon-svg"
            style={{
              fontSize: LINKEDIN_ICON_SIZE,
              width: LINKEDIN_ICON_SIZE,
              height: LINKEDIN_ICON_SIZE,
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
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
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants(RESUME_GLOW_COLOR)}
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FaFilePdf
            className="desktop-icon-svg"
            style={{
              fontSize: RESUME_ICON_SIZE,
              width: RESUME_ICON_SIZE,
              height: RESUME_ICON_SIZE,
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
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
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants(CMU_GLOW_COLOR)}
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={cmuLogo}
            alt="CMU SCS"
            className="desktop-icon-img"
            style={{
              width: CMU_ICON_SIZE,
              height: CMU_ICON_SIZE,
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
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
          cursor: "pointer",
          boxSizing: "border-box",
        }}
        variants={createItemVariants(MIT_GLOW_COLOR)}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseEnter={onMITHover}
        onMouseLeave={onHoverLeave}
        onClick={onMITClick}
      >
        <div
          className="icon-container"
          style={{
            height: ICON_AREA_HEIGHT_PERCENT,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={mitLogo}
            alt="MIT xPRO"
            className="desktop-icon-img"
            style={{
              width: MIT_ICON_SIZE,
              height: MIT_ICON_SIZE,
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            className="desktop-icon-label"
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontFamily: LABEL_FONT_FAMILY,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
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
