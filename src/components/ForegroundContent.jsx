// src/components/ForegroundContent.jsx
import React, { Suspense, useState, useEffect } from "react";
import { motion }                     from "framer-motion";
import { useAppReady }                from "../contexts/AppReadyContext";
import NavLogoText                    from "./NavLogoText";
import NavIconsDesktop                from "./NavIconsDesktop";
import NavIconsMobile                 from "./NavIconsMobile";
import FeedbackBubble                 from "./FeedbackBubble";
import Experience                     from "./Experience";
import Skills                         from "./Skills";
import DemoCards                      from "./DemoCards";
import About                          from "./About";
import { ABOUT_SECTION_ACTIVE }       from "../config/featureFlags";
import "./ForegroundContent.css";

const MOBILE_BREAKPOINT = 768;

export default function ForegroundContent({ startAnimation }) {
  const { appReady } = useAppReady();
  const [section, setSection] = useState("demos");
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // wait until all preload flags are ready
  if (!appReady) return null;

  return (
    <div className="fc-root">
      <div className="fc-topnav">
        <NavLogoText section={section} setSection={setSection} />
        {isMobile ? <NavIconsMobile /> : <NavIconsDesktop />}
      </div>

      <div className="canvas-container" style={{ position: 'relative', flex: 1 }}>
        {/* DemoCards as static UI */}
        <motion.div
          className="demo-wrapper"
          style={{ position: 'absolute', inset: 0, pointerEvents: section === 'demos' ? 'auto' : 'none' }}
          initial={false}
          animate={{ opacity: section === 'demos' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <DemoCards startAnimation={startAnimation} />
        </motion.div>

        {/* Experience Canvas wrapper */}
        <motion.div
          className="experience-wrapper"
          style={{ position: 'absolute', inset: 0, pointerEvents: section === 'experience' ? 'auto' : 'none' }}
          initial={false}
          animate={{ opacity: section === 'experience' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </motion.div>

        {/* Skills Canvas wrapper */}
        <motion.div
          className="skills-wrapper"
          style={{ position: 'absolute', inset: 0, pointerEvents: section === 'skills' ? 'auto' : 'none' }}
          initial={false}
          animate={{ opacity: section === 'skills' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Suspense fallback={null}>
            <Skills />
          </Suspense>
        </motion.div>

        {/* About section if active */}
        {ABOUT_SECTION_ACTIVE && (
          <motion.div
            className="about-wrapper"
            style={{ position: 'absolute', inset: 0, pointerEvents: section === 'about' ? 'auto' : 'none' }}
            initial={false}
            animate={{ opacity: section === 'about' ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <About />
          </motion.div>
        )}
      </div>

      <FeedbackBubble />
    </div>
  );
}
