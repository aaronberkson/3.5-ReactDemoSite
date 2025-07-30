// src/components/NavLogoText.jsx
import React, { useState, useEffect } from "react";
import NavLogoTextDesktop from "./NavLogoTextDesktop";
import NavLogoTextMobile  from "./NavLogoTextMobile";
import "./NavLogoText.css";

// Shadow text offset constants
const LINE1_SHADOW_OFFSET_X = -2.5;
const LINE1_SHADOW_OFFSET_Y = 2.5;
const LINE2_SHADOW_OFFSET_X = -2.5;
const LINE2_SHADOW_OFFSET_Y = 2.5;

export default function NavLogoText({ section, setSection }) {
  // Determine if we’re in mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Forward the section state and shadow constants to desktop/mobile variants
  return isMobile ? (
    <NavLogoTextMobile
      section={section}
      setSection={setSection}
      line1ShadowOffsetX={LINE1_SHADOW_OFFSET_X}
      line1ShadowOffsetY={LINE1_SHADOW_OFFSET_Y}
      line2ShadowOffsetX={LINE2_SHADOW_OFFSET_X}
      line2ShadowOffsetY={LINE2_SHADOW_OFFSET_Y}
    />
  ) : (
    <NavLogoTextDesktop
      section={section}
      setSection={setSection}
      line1ShadowOffsetX={LINE1_SHADOW_OFFSET_X}
      line1ShadowOffsetY={LINE1_SHADOW_OFFSET_Y}
      line2ShadowOffsetX={LINE2_SHADOW_OFFSET_X}
      line2ShadowOffsetY={LINE2_SHADOW_OFFSET_Y}
    />
  );
}