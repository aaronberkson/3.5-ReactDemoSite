// App.jsx
import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import DemoCardsDesktop from "./components/DemoCardsDesktop";
import DemoCardsMobile from "./components/DemoCardsMobile";
import Preloader from "./components/Preloader";
import NavbarBackground from "./components/NavbarBackground";
import AmbientFog from "./three/AmbientFog"; // Correct path: App.jsx is in src and AmbientFog.jsx is in src/three/

const MOBILE_BREAKPOINT = 768;

const App = () => {
  const staticImages = [
    "/assets/demo1.png",
    "/assets/demo2.png",
    "/assets/demo3.png",
    "/assets/mit-xpro-light-blue.svg",
    "/assets/carnegie-mellon-carnegie-red.svg",
    "/assets/linkedin-white.png",
    "/assets/gold-ribbon.png",
    "/assets/produce-bg-medium.webp"
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine the navbar height.
  const navbarHeight = isMobile ? "100px" : "150px";

  return (
    <Preloader staticImages={staticImages}>
      <Layout>
        {/* Render the fixed navbar with background */}
        <NavbarBackground 
          zoom={110}  // Adjust zoom, xOffset, yOffset as needed
          xOffset={0}
          yOffset={0}
          height={navbarHeight}
        />

        {/* Main content container */}
        <div style={{ position: "relative", minHeight: "100vh" }}>
          {/* Ambient Fog is positioned absolutely behind the main content */}
          <AmbientFog />

          {/* Main content overlay */}
          <div style={{ position: "relative", zIndex: 1, paddingTop: navbarHeight }}>
            {isMobile ? <DemoCardsMobile /> : <DemoCardsDesktop />}
            {/* Other page content can go here */}
          </div>
        </div>
      </Layout>
    </Preloader>
  );
};

export default App;
