// App.jsx
import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import NavbarDesktop from "./components/NavbarDesktop";
import NavbarMobile from "./components/NavbarMobile";
import DemoCardsDesktop from "./components/DemoCardsDesktop";
import DemoCardsMobile from "./components/DemoCardsMobile";
import Preloader from "./components/Preloader";

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
    "/assets/produce-bg-medium.webp",
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Preloader staticImages={staticImages}>
      <Layout>
        {isMobile ? <NavbarMobile /> : <NavbarDesktop />}
        {isMobile ? <DemoCardsMobile /> : <DemoCardsDesktop />}
      </Layout>
    </Preloader>
  );
};

export default App;
