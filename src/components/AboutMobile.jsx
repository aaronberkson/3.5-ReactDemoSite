// src/components/AboutMobile.jsx
import React, { useState, useEffect } from "react";
import { BsPlayBtnFill } from "react-icons/bs";

const DEBUG_BORDER      = false;
const VIDEO_ID          = "Q9EecMEbqq0";
const THUMBNAIL_URL     = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;
const NAVBAR_HEIGHT     = 150;
const PREVIEW_TOP       = 38;

// fluid overlay sizing ratios
const FONT_RATIO        = 0.055;   // text = 5.5% of preview width
const ICON_RATIO        = 1.1;     // icon = 110% of text height
const MIN_FONT_SIZE     = 12;
const MAX_FONT_SIZE     = 32;
const MIN_ICON_SIZE     = 16;
const MAX_ICON_SIZE     = 64;

export default function AboutMobile() {
  const [dims, setDims] = useState({
    width:   0,
    height:  0,
    padding: 0
  });

  // 1) measure viewport & CSS padding, 2) compute 9∶16 box
  useEffect(() => {
    const update = () => {
      const vw   = window.innerWidth;
      const vh   = window.innerHeight;
      const root = getComputedStyle(document.documentElement);
      const pad  = parseInt(root.getPropertyValue("--container-padding-x")) || 24;

      // content area under navbar minus top+bottom padding
      const contentH = vh - NAVBAR_HEIGHT - pad * 2;
      const maxW     = vw - pad * 2;

      // 9∶16 portrait
      let width  = maxW;
      let height = (width * 16) / 9;
      if (height > contentH) {
        height = contentH;
        width  = (height * 9) / 16;
      }

      setDims({ width, height, padding: pad });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // fluidly scale text & icon in lock-step
  const rawFont   = dims.width * FONT_RATIO;
  const fontSize  = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, rawFont));
  const rawIcon   = fontSize * ICON_RATIO;
  const iconSize  = Math.min(MAX_ICON_SIZE, Math.max(MIN_ICON_SIZE, rawIcon));

  // desktop-style commonStyle for video container
  const commonStyle = {
    // outer red border
    border:        "1px solid #FF0000",
    // inner black padding area
    padding:       "2px",
    background:    "#282828",
    // rounded corners & clipped
    borderRadius:  "12px",
    clipPath:      "inset(0 round 12px)",
    boxSizing:     "border-box",
    overflow:      "hidden",
    position:      "relative",
    width:         `${dims.width}px`,
    height:        `${dims.height}px`,
    ...(DEBUG_BORDER && { border: "2px dashed orange" }),
  };

return (
  <section
    style={{
      position:       "absolute",
      top:            `${PREVIEW_TOP}px`,
      left:           0,
      width:          "100vw",
      height:         `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      paddingTop:     `${dims.padding}px`,
      paddingBottom:  `${dims.padding}px`,
      boxSizing:      "border-box",
      display:        "flex",
      justifyContent: "center",
      alignItems:     "center",
      ...(DEBUG_BORDER && { border: "2px dashed magenta" }),
    }}
  >
    <a
      href={`https://youtube.com/shorts/${VIDEO_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...commonStyle,
        cursor: "pointer",
      }}
    >
      <img
        src={THUMBNAIL_URL}
        alt="Mobile Preview"
        style={{
          display:   "block",
          width:     "100%",
          height:    "100%",
          objectFit: "cover",
        }}
      />

      {/* overlay: icon + text */}
      <div
        style={{
          position:        "absolute",
          inset:           0,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          gap:             "0.5rem",
          padding:         `0 ${dims.padding}px`,
          boxSizing:       "border-box",
          backgroundColor: "rgba(0,0,0,0.25)",
          ...(DEBUG_BORDER && { border: "2px dashed yellow" }),
        }}
      >
        <BsPlayBtnFill
          size={Math.round(iconSize)}
          color="#FFFFFF"
          style={{
            filter: "drop-shadow(2px 2px 6px rgba(0,0,0,0.7))",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-focal-medium)",
            fontSize:   `${fontSize}px`,
            color:      "#FFFFFF",
            whiteSpace: "nowrap",
          }}
        >
          About Me in 100 Seconds
        </span>
      </div>
    </a>
  </section>
);



}
