// src/components/Skills.jsx
import React, { useEffect, Suspense } from "react";
import { useSkillsViewport }            from "../hooks/useSkillsViewport";
import PreloadSkillsAssets              from "./PreloadSkillsAssets";
import "./Skills.css";

const SkillsCanvas = React.lazy(() => import("./SkillsCanvas"));

const DEBUG_CONSOLE = true;
const log = (...args) => DEBUG_CONSOLE && console.log("[IO][Skills]", ...args);

export default function Skills() {
  const [wrapperRef, width] = useSkillsViewport();

  // ─── Lifecycle logs ───────────────────────────────────────────
  useEffect(() => {
    log("page mounted");
    return () => log("page unmounted");
  }, []);

  // ─── Width‐change logs ────────────────────────────────────────
  useEffect(() => {
    log("viewport width changed →", width);
  }, [width]);

  // ─── Render ──────────────────────────────────────────────────
  return (
    <>
      {/* run all SVG preloads up front */}
      <PreloadSkillsAssets />

      <div className="app-container">
        <div
          ref={wrapperRef}
          className="canvas-wrapper"
          style={{
            position:     "relative",
            overflow:     "hidden",
            marginTop:    78,
            marginBottom: 30,
            height:       590,
            width:        "100%",
            border:       DEBUG_CONSOLE ? "2px solid red" : "none",
          }}
        >
          <Suspense fallback={null}>
            { log("rendering <SkillsCanvas>") }
            <SkillsCanvas width={width} height={590} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
