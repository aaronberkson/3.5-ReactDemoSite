// NavbarWithAnimation.jsx
import React, { useState, useEffect } from "react";
import WaveAnimation from "../three/WaveAnimation"; // Corrected path to WaveAnimation
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const MOBILE_BREAKPOINT = 768;

const NavbarWithAnimation = ({ zoom = 100, xOffset = 0, yOffset = 0, height = "150px" }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        overflow: "hidden" // Ensures the background stays within the navbar area.
      }}
    >
      {/* Background layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}
      >
        <WaveAnimation zoom={zoom} xOffset={xOffset} yOffset={yOffset} />
      </div>
      {/* Foreground navbar content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {isMobile ? <NavbarMobile /> : <NavbarDesktop />}
      </div>
    </div>
  );
};

export default NavbarWithAnimation;
