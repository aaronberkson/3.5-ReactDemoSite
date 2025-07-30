// src/components/Experience.jsx
import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useLoader }                                  from "@react-three/fiber";
import { SVGLoader }                                  from "three/examples/jsm/loaders/SVGLoader";
import ExpFilterPortal                                from "./ExpFilterPortal";
const ExpCanvas = React.lazy(() => import("./ExpCanvas"));
import { useGridDimensions }                          from "../hooks/useGridDimensions";
import { computePositions }                           from "../utilities/positionUtils";
import logos                                          from "../data/experienceLogos";
import "./Experience.css";

const ROW_FACTOR     = 0.43;
const GUTTER         = 3;
const TOP_ROW_HEIGHT = 90;

// previous‐value hook
function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function Experience({ direction = 1 }) {
  // ─── Log page mount ───────────────────────────────────────────────
  useEffect(() => {
    console.log("[IO][Experience] page mounted");
    return () => console.log("[IO][Experience] page unmounted");
  }, []);

  // ─── Preload SVGs ────────────────────────────────────────────────
  useLoader.preload(SVGLoader, logos.map(l => l.svgPath));
  console.log(
    "[IO][Experience] useLoader.preload called for",
    logos.length,
    "SVGs"
  );

  // ─── Filter logic ────────────────────────────────────────────────
  const [selectedTag, setSelectedTag] = useState("All");
  const visible = useMemo(
    () =>
      selectedTag === "All"
        ? logos
        : logos.filter(l => l.tags.includes(selectedTag)),
    [selectedTag]
  );
  const prevVisible = usePrevious(visible) || visible;
  useEffect(() => {
    console.log(
      "[IO][Experience] filter changed →",
      { selectedTag, visibleCount: visible.length }
    );
  }, [selectedTag, visible.length]);

  // ─── Grid dims & positions ───────────────────────────────────────
  const [ref, dims] = useGridDimensions(visible.length, ROW_FACTOR, GUTTER);
  const layoutFrom  = useMemo(() => computePositions(prevVisible, dims), [prevVisible, dims]);
  const layoutTo    = useMemo(() => computePositions(visible,     dims), [visible,     dims]);

  // ─── Scroll to top on filter change ─────────────────────────────
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = 0;
      console.log("[IO][Experience] scrolled to top");
    }
  }, [visible]);

  // ─── Wrapper height ──────────────────────────────────────────────
  const wrapperHeight = dims.gridH + TOP_ROW_HEIGHT;
  console.log(
    "[IO][Experience] rendering canvas-wrapper",
    { wrapperHeight, dims }
  );

return (
  <div className="experience-page">
    <ExpFilterPortal
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
      direction={direction}
    />

    <div
      ref={ref}
      className="canvas-wrapper"
      style={{
        position: "relative",
        overflow: "hidden",
        height: `${wrapperHeight}px`
      }}
    >
      <Suspense fallback={null}>
        {console.log("[IO][Experience] rendering <ExpCanvas>")}
        <ExpCanvas
          dims={dims}
          layoutFrom={layoutFrom}
          layoutTo={layoutTo}
          visible={visible}
          prevVisible={prevVisible}
          topRowHeight={TOP_ROW_HEIGHT}
        />
      </Suspense>
    </div>
  </div>
);

}
