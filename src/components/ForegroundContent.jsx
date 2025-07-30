// src/components/ForegroundContent.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }            from "framer-motion";
import DemoCards                              from "./DemoCards";
import Experience                             from "./Experience";
import Skills                                 from "./Skills";
import About                                  from "./About";
import NavLogoText                            from "./NavLogoText";
import NavIconsDesktop                        from "./NavIconsDesktop";
import NavIconsMobile                         from "./NavIconsMobile";
import FeedbackBubble                         from "./FeedbackBubble";
import { useAppReady }                        from "../contexts/AppReadyContext";
import { ABOUT_SECTION_ACTIVE }               from "../config/featureFlags";
import "./ForegroundContent.css";

const MOBILE_BREAKPOINT = 768;
const SECTION_ORDER = ABOUT_SECTION_ACTIVE
  ? ["demos", "experience", "skills", "about"]
  : ["demos", "experience", "skills"];

export default function ForegroundContent({ startAnimation }) {
  const { appReady } = useAppReady();
  const [section, setSection] = useState("demos");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  // appReady mount
  useEffect(() => {
    console.log("[IO][ForegroundContent] mounted/appReady →", appReady);
  }, [appReady]);

  // section change log
  useEffect(() => {
    console.log("[IO][ForegroundContent] section →", section);
  }, [section]);

  // resize listener
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    console.log("[IO][ForegroundContent] resize listener attached");
    return () => {
      window.removeEventListener("resize", onResize);
      console.log("[IO][ForegroundContent] resize listener detached");
    };
  }, []);

  if (!appReady) return null;

  // slide direction
  const prevRef = useRef(section);
  const direction = useRef(0);
  const handleNav = (id) => {
    const from = SECTION_ORDER.indexOf(prevRef.current);
    const to = SECTION_ORDER.indexOf(id);
    direction.current = to > from ? 1 : -1;
    prevRef.current = id;
    console.log("[IO][ForegroundContent] handleNav", { from, to, direction: direction.current });
    setSection(id);
  };

  const variants = {
    initial: (dir) => ({ x: `${100 * dir}%`, opacity: 0 }),
    animate: {
      x: "0%", opacity: 1,
      transition: { type: "spring", stiffness: 220, damping: 25, mass: 1.2, bounce: 0.1, restSpeedThreshold: 0.3, restDelta: 2 }
    },
    exit: (dir) => ({ x: `${-100 * dir}%`, opacity: 0,
      transition: { type: "spring", stiffness: 220, damping: 25, mass: 1.2, bounce: 0.1, restSpeedThreshold: 0.3, restDelta: 2 }
    })
  };

  return (
    <motion.div className="fc-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="fc-topnav">
        <NavLogoText section={section} setSection={handleNav} />
        {isMobile ? <NavIconsMobile /> : <NavIconsDesktop />}
      </div>

      <div className="fc-page-container">
        <div className="app-container">
          <AnimatePresence exitBeforeEnter custom={direction.current}>
            <motion.div
              key={section}
              className="fc-page-slide"
              custom={direction.current}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {section === "demos"      && <DemoCards startAnimation={startAnimation} />}
              {section === "experience" && <Experience direction={direction.current} />}
              {section === "skills"     && <Skills />}
              {section === "about"      && ABOUT_SECTION_ACTIVE && <About />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <FeedbackBubble />
    </motion.div>
  );
}
