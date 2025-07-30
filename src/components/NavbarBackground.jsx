import React, { useState, useEffect } from "react";
import WaveAnimation from "../three/WaveAnimation"; // Corrected path
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const DEBUG_MODE = true;
const MOBILE_BREAKPOINT = 768;

const NavbarBackground = ({
  zoom = 1000,
  xOffset = 0,
  yOffset = 0,
  height = "150px",
  onReady  // added prop to receive readiness callback
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  if (DEBUG_MODE) {
    console.log("[IO][NavbarBackground] Initial render: isMobile =", isMobile, "window.innerWidth =", window.innerWidth);
  }

  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("[IO][NavbarBackground] Mounted. Adding resize event listener.");
    }
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (DEBUG_MODE) {
        console.log("[IO][NavbarBackground] Resize event fired: window.innerWidth =", window.innerWidth, "isMobile =", mobile);
      }
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      if (DEBUG_MODE) {
        console.log("[IO][NavbarBackground] Unmounting. Removing resize event listener.");
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("[IO][NavbarBackground] isMobile state updated to:", isMobile);
    }
  }, [isMobile]);

  return (
    <>
      {/* Fixed background: This stays pinned to the top of the viewport */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: height,
          zIndex: -1, // Behind navbar and page content
          pointerEvents: "none" // so background doesn't block interactions
        }}
      >
        <WaveAnimation 
          zoom={zoom} 
          xOffset={xOffset} 
          yOffset={yOffset} 
          onReady={onReady} // pass onReady to the wave animation
        />
      </div>

      {/* Navbar content: Renders on top of the fixed background */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {isMobile ? <NavbarMobile /> : <NavbarDesktop />}
      </div>
    </>
  );
};

export default NavbarBackground;
