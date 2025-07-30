import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ExpFilterIcon from "./ExpFilterIcon";
import { ALL_TAGS }  from "../data/experienceLogos";
import "./ExpFilterBarDesktop.css";

const DEBUG_CONSOLE = false;

export default function ExpFilterBarDesktop({ selectedTag, setSelectedTag }) {
  if (DEBUG_CONSOLE) {
    console.log("[IO][ExpFilterBarDesktop] ALL_TAGS:", ALL_TAGS);
    console.log("[IO][ExpFilterBarDesktop] selectedTag:", selectedTag);
  }

  useEffect(() => {
    if (!DEBUG_CONSOLE) return;
    const container = document.querySelector(".experience-inner .filter-pills");
    console.log(
      "[IO][ExpFilterBarDesktop] DOM pills:",
      container
        ? Array.from(container.children).map(el => el.outerHTML)
        : "⚠️ no .filter-pills found"
    );
  }, []);

  return (
    <div className="experience-inner">
      <div className="filter-bar">
        {/* icon + label */}
        <div className="filter-label-group">
          <ExpFilterIcon width={38} height={38} />
          <span className="filter-label">Filter By</span>
        </div>

        {/* pills */}
        <div className="filter-pills">
          {ALL_TAGS.map(tag => {
            const isActive = tag === selectedTag;
            return (
              <React.Fragment key={tag}>
                <input
                  type="radio"
                  id={`filter-${tag}`}
                  name="filter"
                  className="filter-radio"
                  checked={isActive}
                  onChange={() => setSelectedTag(tag)}
                />
                <motion.label
                  htmlFor={`filter-${tag}`}
                  className="filter-pill"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg,#ff7a00 0%,#ffb000 100%)"
                      : "linear-gradient(135deg,#e0d4ff 0%,#c5b3ff 100%)",
                    color: isActive ? "#fff" : "#333"
                  }}
                  whileHover={!isActive ? { scale: 1.02 } : {}}
                  whileTap={!isActive ? { scale: 0.9 } : {}}
                >
                  {tag}
                </motion.label>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
