import React, { useState, useEffect } from "react";
import { Portal }                       from "react-overlays";
import { motion }                       from "framer-motion";
import ExpFilterBar                     from "./ExpFilterBar";
import "./ExpFilterPortal.css";

const FILTER_BAR_OFFSET = 186;

const variants = {
  initial: dir => ({ x:`${100*dir}%`, opacity:0 }),
  animate: { x:"0%", opacity:1, transition:{ type:"spring", stiffness:220, damping:25, mass:1.2, bounce:0.1 } },
  exit:    dir => ({ x:`${-100*dir}%`, opacity:0, transition:{ type:"spring", stiffness:220, damping:25, mass:1.2, bounce:0.1 } })
};

export default function ExpFilterPortal({ selectedTag, setSelectedTag, direction=1 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);
  if (!mounted) return null;

  return (
    <Portal container={document.body}>
      <div className="experience-header" style={{ top:`${FILTER_BAR_OFFSET}px` }}>
        <div className="header-inner">
          <motion.div custom={direction} variants={variants} initial="initial" animate="animate" exit="exit">
            <ExpFilterBar selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
          </motion.div>
        </div>
      </div>
    </Portal>
  );
}
