// src/App.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "./components/Layout";
import DemoCardsDesktop from "./components/DemoCardsDesktop";
import DemoCardsMobile from "./components/DemoCardsMobile";
import NavbarDesktop from "./components/NavbarDesktop";

const HIDE_CARDS = false;
const MOBILE_BREAKPOINT = 768;

const App = ({ startAnimation }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ position: "relative" }}
    >
      {/* Render the Navbar with the startAnimation prop */}
      <NavbarDesktop startAnimation={startAnimation} />

      <Layout>
        <div style={{ position: "relative", zIndex: 1 }}>
          {!HIDE_CARDS &&
            (isMobile ? (
              <DemoCardsMobile startAnimation={startAnimation} />
            ) : (
              <DemoCardsDesktop startAnimation={startAnimation} />
            ))}
        </div>
      </Layout>
    </motion.div>
  );
};

export default App;
