// src/components/DemoLogoAnim1BB.jsx
import React, { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence }                from "framer-motion";
import catImage                                   from "../assets/demo1.png";

// ─── CONFIGURABLE CONSTANTS ─────────────────────────────────
const CARD_DEFAULT_SIZE         = 300;   // px
const MASK_DIAMETER_PERCENT     = 92;    // mask diameter as % of card
const STRIPE_Y_PERCENT          = 0.636; // 63.6% down
const STRIPE_HEIGHT_PX          = 32;    // stripe thickness in px
const STRIPE_INSET_PX           = 8;     // horizontal inset in px

// TICKER TEXT & SPACING
const PREFIX_FONT_SIZE_PX       = 23;    // “HOT NEWS:” size
const HEADLINE_FONT_SIZE_PX     = 23;    // headline size
const GAP_BEFORE_TEXT_PX        = 135;    // space before prefix
const GAP_BETWEEN_TEXT_PX       = 12;    // space between prefix & headline
const GAP_AFTER_LOOP_PX         = 80;    // space after headline before loop

// SCROLL & FADE
const SCROLL_SPEED_PX_PER_SEC   = 55;    // px per second (right→left)
const FADE_DURATION_SEC         = 0.2;   // fade in/out in seconds

// COLORS & CONTENT
const BG_OPACITY                = 0.6;
const PREFIX_COLOR              = "#FF9900";
const HEADLINE_COLOR            = "#00FFFF";
const PREFIX_TEXT               = "HOT NEWS:";
const HEADLINE_TEXT             =
  " MIT Capstone 'BAD BANK' is a full stack MERN app w/MongoDB, Express, React & Node.js";
const FONT_FAMILY               = "var(--font-doto)";

// ─── Component ───────────────────────────────────────────────
export default function DemoLogoAnim1BB({ size = CARD_DEFAULT_SIZE, hovered }) {
  const trackRef    = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);

  // Measure the width of one pattern + loop gap after fonts load
  useLayoutEffect(() => {
    if (!hovered) {
      setTrackWidth(0);
      return;
    }

    document.fonts.ready
      .then(() => document.fonts.load(`700 ${PREFIX_FONT_SIZE_PX}px Doto`))
      .then(() => {
        if (trackRef.current) {
          const measured = trackRef.current.getBoundingClientRect().width;
          setTrackWidth(measured + GAP_AFTER_LOOP_PX);
        }
      })
      .catch(() => {
        if (trackRef.current) {
          const measured = trackRef.current.getBoundingClientRect().width;
          setTrackWidth(measured + GAP_AFTER_LOOP_PX);
        }
      });
  }, [hovered]);

  // Geometry & timing
  const sliceTopPx    = size * STRIPE_Y_PERCENT - STRIPE_HEIGHT_PX / 2;
  const cycleDuration = trackWidth / SCROLL_SPEED_PX_PER_SEC;
  const maskRadiusPct = MASK_DIAMETER_PERCENT / 2;

  return (
    <div
      style={{
        position:    "relative",
        width:       size,
        height:      size,
        overflow:    "hidden",
        borderRadius:"50%",
        background:  "transparent",
      }}
    >
      {/* Static background image */}
      <img
        src={catImage}
        alt="Demo Logo"
        style={{
          position:      "absolute",
          top:           0,
          left:          0,
          width:         "100%",
          height:        "100%",
          objectFit:     "cover",
          pointerEvents: "none",
          zIndex:        1,
        }}
      />

      {/* Overlay + stripe + ticker */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: FADE_DURATION_SEC } }}
            exit={{ opacity: 0, transition: { duration: FADE_DURATION_SEC } }}
            style={{
              position:       "absolute",
              top:            0,
              left:           0,
              width:          "100%",
              height:         "100%",
              pointerEvents:  "none",
              zIndex:         2,
              clipPath:       `circle(${maskRadiusPct}% at 50% 50%)`,
              WebkitClipPath: `circle(${maskRadiusPct}% at 50% 50%)`,
            }}
          >
            {/* Thin stripe */}
            <div
              style={{
                position:        "absolute",
                top:             sliceTopPx,
                left:            STRIPE_INSET_PX,
                width:           size - STRIPE_INSET_PX * 2,
                height:          STRIPE_HEIGHT_PX,
                backgroundColor: `rgba(0,0,0,${BG_OPACITY})`,
                overflow:        "hidden",
              }}
            />

            {/* Scrolling ticker track */}
            <motion.div
              style={{
                position:   "absolute",
                top:        sliceTopPx,
                left:       STRIPE_INSET_PX,
                display:    "flex",
                whiteSpace: "nowrap",
                alignItems: "center",
                height:     STRIPE_HEIGHT_PX,
              }}
              animate={trackWidth > 0 ? { x: [0, -trackWidth] } : {}}
              transition={{
                ease:     "linear",
                duration: cycleDuration || 0,
                repeat:   Infinity,
              }}
            >
              {/* First pattern (measured) */}
              <div
                ref={trackRef}
                style={{ display: "flex", alignItems: "center" }}
              >
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize:   PREFIX_FONT_SIZE_PX,
                    fontWeight: 700,
                    color:      PREFIX_COLOR,
                    marginLeft: GAP_BEFORE_TEXT_PX,
                    marginRight:GAP_BETWEEN_TEXT_PX,
                  }}
                >
                  {PREFIX_TEXT}
                </span>
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize:   HEADLINE_FONT_SIZE_PX,
                    fontWeight: 700,
                    color:      HEADLINE_COLOR,
                    marginRight:GAP_AFTER_LOOP_PX,
                  }}
                >
                  {HEADLINE_TEXT}
                </span>
              </div>

              {/* Second pattern (loop) */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize:   PREFIX_FONT_SIZE_PX,
                    fontWeight: 700,
                    color:      PREFIX_COLOR,
                    marginRight:GAP_BETWEEN_TEXT_PX,
                  }}
                >
                  {PREFIX_TEXT}
                </span>
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize:   HEADLINE_FONT_SIZE_PX,
                    fontWeight: 400,
                    color:      HEADLINE_COLOR,
                    marginRight:GAP_AFTER_LOOP_PX,
                  }}
                >
                  {HEADLINE_TEXT}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
