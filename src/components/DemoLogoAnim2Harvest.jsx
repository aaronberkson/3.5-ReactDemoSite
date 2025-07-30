// DemoLogoAnim2Harvest.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import goldenCartExtended from "../assets/golden-cart-extended-shadow.webp";
import "./DemoLogoAnim2Harvest.css";

// Design constants
const TEXT_BORDER_COLOR = "#DAA520"; // Gold color for stroke
const TEXT_BORDER_THICKNESS = ".5px";
const baseDesignWidth = 308;           // Base design width from your layout
const DEBUG_BORDER = false;            // Toggle debug outlines

/*
  Calibration constants – these represent the "zero" (final) position for the cart.
  Adjust these to control the final position of the cart image within the container.
*/
const CART_SCALE = 0.86;       // Multiplier applied after responsive scale; tweak as needed.
const CART_X_OFFSET = -148;    // Final horizontal offset (the "zero" position).
const CART_Y_OFFSET = -16;     // Final vertical offset.
const CART_HIDDEN_OFFSET = 150; // How far off-screen (to the left) the cart starts.

// Animation timing and easing – use constant duration for both elements.
const ANIMATION_DURATION = 0.83;
const CART_EASING = "easeInOut";
const TEXT_EASING = "easeInOut";

// For the text, adjust how small it is initially relative to its fully expanded state.
const TEXT_SCALE_INITIAL = 0.77;

// Motion variants for the cart image.
const cartVariants = {
  hidden: { 
    x: CART_X_OFFSET - CART_HIDDEN_OFFSET, 
    y: CART_Y_OFFSET, 
    opacity: 0 
  },
  visible: { 
    x: CART_X_OFFSET, 
    y: CART_Y_OFFSET, 
    opacity: 1, 
    transition: { duration: ANIMATION_DURATION, ease: CART_EASING } 
  }
};

// Motion variants for the title text.
const textVariants = {
  hidden: { 
    scale: TEXT_SCALE_INITIAL, 
    opacity: 0 
  },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { duration: ANIMATION_DURATION, ease: TEXT_EASING } 
  }
};

const DemoLogoAnim2Harvest = ({ size, paused }) => {
  // "size" is the overall container size in pixels (square). Default to 300 if not provided.
  const squareSize = size || 300;
  // Compute responsive scaling relative to the base design width.
  const mobileScale = squareSize / baseDesignWidth;
  // When paused is true, the element immediately renders in its final state.
  const initialState = paused ? "visible" : "hidden";

  // Track the cart image load state.
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="harvest-logo-container"
      style={{
        width: `${squareSize}px`,
        height: `${squareSize}px`,
        position: "relative",
        display: "block",
        verticalAlign: "top",
        margin: 0,
        // The white square with curved corners; the white background is explicitly set.
        overflow: "hidden",
        backgroundColor: "white",
        ...(DEBUG_BORDER && { border: "2px dashed blue" }),
      }}
    >
      {/* Inner container that centers the cart image */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
          overflow: "visible",
          ...(DEBUG_BORDER && { outline: "2px dashed red" }),
        }}
      >
        <div
          style={{
            width: `${baseDesignWidth}px`,
            position: "relative",
            // Combine responsive scaling with the fine-tuning CART_SCALE.
            transform: `scale(${mobileScale * CART_SCALE})`,
            transformOrigin: "top center",
            overflow: "visible",
            ...(DEBUG_BORDER && { outline: "2px dashed green" }),
          }}
        >
          <div
            className="harvest-cart-wrapper"
            style={{
              overflow: "visible",
              ...(DEBUG_BORDER && { outline: "2px dashed purple" }),
            }}
          >
            <motion.img
              src={goldenCartExtended}  // Correct asset name.
              alt="Golden Cart with Extended Shadow"
              className="harvest-cart-image"
              style={DEBUG_BORDER ? { outline: "2px dashed orange" } : {}}
              initial={initialState}
              // Only trigger the animate to "visible" after the image has loaded.
              animate={imgLoaded ? "visible" : initialState}
              variants={cartVariants}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        </div>
      </div>

      {/* Text container at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          padding: "0 8px",
          ...(DEBUG_BORDER && { outline: "2px dashed pink" }),
        }}
      >
        <motion.div
          className="harvest-logo-text"
          style={{
            fontSize: `${36 * mobileScale}px`,
            lineHeight: 1,
            color: "transparent",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextStroke: `${TEXT_BORDER_THICKNESS} ${TEXT_BORDER_COLOR}`,
            userSelect: "none",
            transformOrigin: "50% 50%",
            willChange: "transform, opacity",
            ...(DEBUG_BORDER && { outline: "2px dashed cyan" }),
          }}
          initial={initialState}
          animate="visible"
          variants={textVariants}
        >
          HIGH‑END HARVEST
        </motion.div>
      </div>
    </div>
  );
};

export default DemoLogoAnim2Harvest;
