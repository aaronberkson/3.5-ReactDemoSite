import React, {
  useRef,
  useLayoutEffect,
  useState,
  useEffect
} from "react";
import { motion } from "framer-motion";
import { ABOUT_SECTION_ACTIVE } from "../config/featureFlags";

import "./NavSections.css";

const NARROW_MAX_THREE = 1024;
const NARROW_MAX_FOUR = 1155;

const BASE_SECTIONS = [
  { id: "demos", full: "Demos", short: "Demos" },
  { id: "experience", full: "Experience", short: "Exp." },
  { id: "skills", full: "Skills", short: "Skills" }
];
const ABOUT_SECTION = { id: "about", full: "About", short: "About" };

const breakpoints = [
  { width: 150, fontSize: 17, gap: 2 },
  { width: 320, fontSize: 17, gap: 2 },
  { width: 436, fontSize: 26, gap: 4 },
  { width: 437, fontSize: 19, gap: 3 },
  { width: 500, fontSize: 20, gap: 4 },
  { width: 660, fontSize: 28, gap: 8 },
  { width: 768, fontSize: 34, gap: 12 },
  { width: 769, fontSize: 21, gap: 4 },
  { width: 900, fontSize: 26, gap: 6 },
  { width: 1024, fontSize: 30, gap: 10 },
  { width: 1280, fontSize: 34, gap: 12 }
];

function interpolateValue(viewport, key) {
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const curr = breakpoints[i];
    const next = breakpoints[i + 1];
    if (viewport >= curr.width && viewport <= next.width) {
      const progress = (viewport - curr.width) / (next.width - curr.width);
      return curr[key] + (next[key] - curr[key]) * progress;
    }
  }
  return breakpoints[breakpoints.length - 1][key];
}

export default function NavSections({ active, onChange, className = "", style = {} }) {
  const sections = ABOUT_SECTION_ACTIVE ? [...BASE_SECTIONS, ABOUT_SECTION] : BASE_SECTIONS;

  const [isNarrowThree, setIsNarrowThree] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(`(max-width:${NARROW_MAX_THREE}px)`).matches
  );
  const [isNarrowFour, setIsNarrowFour] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(`(max-width:${NARROW_MAX_FOUR}px)`).matches
  );
  const [viewport, setViewport] = useState(() => window.innerWidth);

  useEffect(() => {
    const mq3 = window.matchMedia(`(max-width:${NARROW_MAX_THREE}px)`);
    const h3 = e => setIsNarrowThree(e.matches);
    mq3.addListener(h3);
    return () => mq3.removeListener(h3);
  }, []);

  useEffect(() => {
    const mq4 = window.matchMedia(`(max-width:${NARROW_MAX_FOUR}px)`);
    const h4 = e => setIsNarrowFour(e.matches);
    mq4.addListener(h4);
    return () => mq4.removeListener(h4);
  }, []);

  useEffect(() => {
    const handleResize = () => setViewport(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLabelNarrow = sections.length === 4 ? isNarrowFour : isNarrowThree;
  const fontSize = interpolateValue(viewport, "fontSize");
  const gap = interpolateValue(viewport, "gap");

  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [underline, setUnderline] = useState({ left: 0, width: 0 });
  const [tabMinWidths, setTabMinWidths] = useState({});

  const measure = () => {
    const cont = containerRef.current;
    if (!cont) return;
    const { left: contLeft } = cont.getBoundingClientRect();

    const activeEl = tabRefs.current[active];
    if (activeEl) {
      const { left, width } = activeEl.querySelector(".item-main").getBoundingClientRect();
      setUnderline({ left: left - contLeft, width });
    }

    const newW = {};
    sections.forEach(({ id }) => {
      const el = tabRefs.current[id];
      const meas = el?.querySelector(".item-measure-bold");
      if (meas) newW[id] = Math.ceil(meas.getBoundingClientRect().width);
    });
    setTabMinWidths(newW);
  };

  useLayoutEffect(measure, [active, isLabelNarrow, sections.length]);
  useLayoutEffect(() => {
    if (Object.keys(tabMinWidths).length === sections.length) {
      const cont = containerRef.current;
      const activeEl = tabRefs.current[active];
      if (cont && activeEl) {
        const { left: contLeft } = cont.getBoundingClientRect();
        const { left, width } = activeEl.querySelector(".item-main").getBoundingClientRect();
        setUnderline({ left: left - contLeft, width });
      }
    }
  }, [tabMinWidths, active, sections.length]);

  useEffect(() => {
    if (!window.ResizeObserver) return;
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [sections.length]);

  const tapSpring = { type: "spring", stiffness: 400, damping: 25 };

  return (
    <div
      className={`nav-sections ${sections.length === 4 ? "four" : "three"} ${className}`}
      ref={containerRef}
      style={{ ...style, fontSize: `${fontSize}px`, gap: `${gap}px` }}
    >
      {sections.map(({ id, full, short }, i) => {
        const label = isLabelNarrow ? short : full;
        const minW = tabMinWidths[id];
        return (
          <React.Fragment key={id}>
            <motion.div
              className={`nav-item${id === active ? " active" : ""}`}
              title={full}
              aria-label={full}
              ref={el => (tabRefs.current[id] = el)}
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.95 }}
              transition={tapSpring}
              style={minW ? { minWidth: minW } : undefined}
            >
              <span className="item-shadow">{label}</span>
              <span className="item-main" data-label={label}>{label}</span>
              <span className="item-measure-bold">{label}</span>
            </motion.div>
            {i < sections.length - 1 && (
              <span className="nav-separator">
                <span className="separator-shadow">|</span>
                <span className="separator-main" data-label="|">|</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
      <motion.div
        className="nav-sections-underline-shadow"
        animate={{ left: underline.left, width: underline.width }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.div
        className="nav-sections-underline"
        animate={{ left: underline.left, width: underline.width }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
}
