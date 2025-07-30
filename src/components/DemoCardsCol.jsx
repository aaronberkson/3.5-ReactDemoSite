// src/components/DemoCardsCol.jsx
import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaYoutube, FaShoppingCart, FaUniversity, FaGithub } from "react-icons/fa";
import { BsRocketTakeoffFill } from "react-icons/bs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import demo1 from "../assets/demo1.png";
import demo2 from "../assets/demo3-nosmoke-square.svg";
import DemoLogoAnim2Harvest from "./DemoLogoAnim2Harvest";
import CapstoneBadge from "./CapstoneBadge";
import TechPill from "./TechPill";
import TrainSmoke from "../pixi/TrainSmoke";
import "./DemoCards.css";

/* ===============================================================
   Group 1: Fixed Constants & Basic Layout Values (UNCHANGED)
================================================================= */
const PILL_ROW_IMAGE_SPACING = 10;
const HEADER_PADDING = "0px";
const TECH_PILL_GAP = 2;
const SUBTITLE_BUTTON_GAP = 10;
const desktopBadgeOffsetX = 0;
const desktopBadgeOffsetY = 0;
const TOP_MARGIN = 79;
const CONTAINER_MAX_WIDTH = 1280;
const DEFAULT_HORIZONTAL_PADDING = 16;
const BOTTOM_MARGIN = 40;
const TITLE_MAX_WIDTH = 280;
const PILLROW_MAX_WIDTH = 280;
const DIMS = {
  titleHeight: 30,
  imageHeight: 300, // fallback; breakpoints override this
  subtitleHeight: 30,
  buttonHeight: 40,
  bottomSpacer: 30,
  maxImageWidth: 400
};

/* ===============================================================
   Group 2: Breakpoint-Dependent Constants for Image Height (UNCHANGED)
================================================================= */
const IMAGE_HEIGHT_BREAKPOINTS = [
  { viewport: 320, imageHeight: 210 },
  { viewport: 438, imageHeight: 245 },
  { viewport: 480, imageHeight: 260 },
  { viewport: 640, imageHeight: 265 },
  { viewport: 768, imageHeight: 280 }
];

function getImageHeight(viewWidth) {
  if (viewWidth <= IMAGE_HEIGHT_BREAKPOINTS[0].viewport)
    return IMAGE_HEIGHT_BREAKPOINTS[0].imageHeight;
  if (viewWidth >= IMAGE_HEIGHT_BREAKPOINTS[IMAGE_HEIGHT_BREAKPOINTS.length - 1].viewport)
    return IMAGE_HEIGHT_BREAKPOINTS[IMAGE_HEIGHT_BREAKPOINTS.length - 1].imageHeight;
  for (let i = 0; i < IMAGE_HEIGHT_BREAKPOINTS.length - 1; i++) {
    const bp1 = IMAGE_HEIGHT_BREAKPOINTS[i];
    const bp2 = IMAGE_HEIGHT_BREAKPOINTS[i + 1];
    if (viewWidth >= bp1.viewport && viewWidth <= bp2.viewport) {
      const ratio = (viewWidth - bp1.viewport) / (bp2.viewport - bp1.viewport);
      return bp1.imageHeight + ratio * (bp2.imageHeight - bp1.imageHeight);
    }
  }
  return IMAGE_HEIGHT_BREAKPOINTS[IMAGE_HEIGHT_BREAKPOINTS.length - 1].imageHeight;
}

/* ===============================================================
   Group 2.1: Breakpoint-Dependent Constants for Overall Card Height (UNCHANGED)
================================================================= */
const CARD_HEIGHTS = [
  { viewport: 320, height: 515 },
  { viewport: 438, height: 555 },
  { viewport: 480, height: 570 },
  { viewport: 640, height: 575 },
  { viewport: 768, height: 590 }
];

function getCardHeight(viewWidth) {
  if (viewWidth <= CARD_HEIGHTS[0].viewport) return CARD_HEIGHTS[0].height;
  if (viewWidth >= CARD_HEIGHTS[CARD_HEIGHTS.length - 1].viewport)
    return CARD_HEIGHTS[CARD_HEIGHTS.length - 1].height;
  for (let i = 0; i < CARD_HEIGHTS.length - 1; i++) {
    const bp1 = CARD_HEIGHTS[i];
    const bp2 = CARD_HEIGHTS[i + 1];
    if (viewWidth >= bp1.viewport && viewWidth <= bp2.viewport) {
      const ratio = (viewWidth - bp1.viewport) / (bp2.viewport - bp1.viewport);
      return bp1.height + ratio * (bp2.height - bp1.height);
    }
  }
  return CARD_HEIGHTS[CARD_HEIGHTS.length - 1].height;
}

/* ===============================================================
   Group 3: NEW – TrainSmoke Settings per Breakpoint (Additive Only)
   These settings control the TrainSmoke overlay's size and its x/y
   position relative to the image container (in percentages).
================================================================= */
const TRAIN_SMOKE_SETTINGS = [
  { viewport: 320, size: 140, x: 6, y: 1 },
  { viewport: 438, size: 150, x: 13, y: 3 },
  { viewport: 480, size: 160, x: 12, y: 3 },
  { viewport: 640, size: 170, x: 10, y: 2 },
  { viewport: 768, size: 175, x: 12, y: 3 }
];

function getInterpolatedTrainSmokeSettings(viewWidth) {
  if (viewWidth <= TRAIN_SMOKE_SETTINGS[0].viewport) {
    return TRAIN_SMOKE_SETTINGS[0];
  }
  if (viewWidth >= TRAIN_SMOKE_SETTINGS[TRAIN_SMOKE_SETTINGS.length - 1].viewport) {
    return TRAIN_SMOKE_SETTINGS[TRAIN_SMOKE_SETTINGS.length - 1];
  }
  for (let i = 0; i < TRAIN_SMOKE_SETTINGS.length - 1; i++) {
    const curr = TRAIN_SMOKE_SETTINGS[i];
    const next = TRAIN_SMOKE_SETTINGS[i + 1];
    if (viewWidth >= curr.viewport && viewWidth <= next.viewport) {
      const ratio = (viewWidth - curr.viewport) / (next.viewport - curr.viewport);
      return {
        size: curr.size + ratio * (next.size - curr.size),
        x: curr.x + ratio * (next.x - curr.x),
        y: curr.y + ratio * (next.y - curr.y)
      };
    }
  }
  return TRAIN_SMOKE_SETTINGS[TRAIN_SMOKE_SETTINGS.length - 1];
}

/* ===============================================================
   Group 4: Other Styling Constants (Shadows, etc.) – UNCHANGED
================================================================= */
// const innerShadowTop = "inset 0px 2px 5px rgba(0,0,0,0.6)";
// const innerShadowRight = "inset -2px 0px 5px rgba(255,255,255,0.6)";
// const innerShadowBottom = "inset 0px -2px 5px rgba(255,255,255,0.6)";
// const innerShadowLeft = "inset 2px 0px 5px rgba(0,0,0,0.6)";
// const innerEdgeShadow = `${innerShadowTop}, ${innerShadowRight}, ${innerShadowBottom}, ${innerShadowLeft}`;

const innerShadowTop   = "inset 0px 4px 5px rgba(255,255,255,0.9)";  // Brighter top shadow
const innerShadowRight = "inset -4px 0px 5px rgba(0,0,0,0.9)";       // Darker right shadow
const innerShadowBottom= "inset 0px -4px 5px rgba(0,0,0,0.9)";       // Darker bottom shadow
const innerShadowLeft  = "inset 4px 0px 5px rgba(255,255,255,0.9)";  // Brighter left shadow
const innerEdgeShadow  = `${innerShadowTop}, ${innerShadowRight}, ${innerShadowBottom}, ${innerShadowLeft}`;


/* ===============================================================
   Group 5: Debug Constants – UNCHANGED
================================================================= */
const DEBUG_BORDER = false;
const DEBUG_CONSOLE = false;
const debugOuterStyle = DEBUG_BORDER ? { border: "2px dashed red" } : {};
const debugCardStyle = DEBUG_BORDER ? { outline: "2px dashed blue" } : {};
const debugHeaderStyle = DEBUG_BORDER ? { outline: "2px dashed green" } : {};
const debugPillRowStyle = DEBUG_BORDER ? { outline: "2px dashed purple" } : {};
const debugImageStyle = DEBUG_BORDER ? { outline: "2px dashed orange" } : {};
const debugBottomStyle = DEBUG_BORDER ? { outline: "2px dashed magenta" } : {};

/* ===============================================================
   Group 6: Helper Functions for Spacing, etc. – UNCHANGED
================================================================= */
function getButtonBottomSpacing(vw) {
  const BUTTON_BOTTOM_SPACING_BREAKPOINTS = [
    { viewport: 320, spacing: 10 },
    { viewport: 438, spacing: 12 },
    { viewport: 480, spacing: 14 },
    { viewport: 640, spacing: 16 },
    { viewport: 768, spacing: 18 }
  ];
  if (vw <= BUTTON_BOTTOM_SPACING_BREAKPOINTS[0].viewport) {
    return BUTTON_BOTTOM_SPACING_BREAKPOINTS[0].spacing;
  }
  if (
    vw >=
    BUTTON_BOTTOM_SPACING_BREAKPOINTS[
      BUTTON_BOTTOM_SPACING_BREAKPOINTS.length - 1
    ].viewport
  ) {
    return BUTTON_BOTTOM_SPACING_BREAKPOINTS[
      BUTTON_BOTTOM_SPACING_BREAKPOINTS.length - 1
    ].spacing;
  }
  for (let i = 0; i < BUTTON_BOTTOM_SPACING_BREAKPOINTS.length - 1; i++) {
    const bp1 = BUTTON_BOTTOM_SPACING_BREAKPOINTS[i];
    const bp2 = BUTTON_BOTTOM_SPACING_BREAKPOINTS[i + 1];
    if (vw >= bp1.viewport && vw <= bp2.viewport) {
      const ratio = (vw - bp1.viewport) / (bp2.viewport - bp1.viewport);
      return bp1.spacing + ratio * (bp2.spacing - bp1.spacing);
    }
  }
  return BUTTON_BOTTOM_SPACING_BREAKPOINTS[
    BUTTON_BOTTOM_SPACING_BREAKPOINTS.length - 1
  ].spacing;
}

const getContainerPadding = () => {
  const paddingStr = getComputedStyle(document.documentElement).getPropertyValue("--container-padding-x");
  const padding = parseFloat(paddingStr) || DEFAULT_HORIZONTAL_PADDING;
  if (DEBUG_CONSOLE) console.log("[IO][DemoCardsCol] container-padding-x:", padding);
  return padding;
};

/* ===============================================================
   Group 7: Component Definition – UNCHANGED (except TrainSmoke overlay)
================================================================= */
const cardVariants = {
  hidden: { opacity: 0, x: "-100vw" },
  visible: { opacity: 1, x: 0 }
};

const MotionDiv = motion.div;

const DemoCardsCol = () => {
  const containerPadding = getContainerPadding();
  const [viewWidth, setViewWidth] = useState(window.innerWidth);
  const [imgDimensions, setImgDimensions] = useState({});
  
  useEffect(() => {
    const handleResize = () => {
      setViewWidth(window.innerWidth);
      if (DEBUG_CONSOLE) console.log("[IO][DemoCardsCol] Updated viewWidth:", window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const CARD_WIDTH = viewWidth - 2 * containerPadding;
  const availableImageWidth = CARD_WIDTH - 20;
  const maxAllowedHeight = getImageHeight(viewWidth);
  const overallCardHeight = getCardHeight(viewWidth);
  
  const containerStyle = {
    marginTop: TOP_MARGIN,
    padding: `0 ${containerPadding}px ${BOTTOM_MARGIN}px`,
    width: "100%",
    maxWidth: CONTAINER_MAX_WIDTH,
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "30px",
    ...debugOuterStyle
  };
  
  const handleImageLoad = (e, cardId) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgDimensions(prev => ({ ...prev, [cardId]: { naturalWidth, naturalHeight } }));
  };
  
  const cards = [
    {
      id: 1,
      img: demo1,
      demoLink: "https://mit-xpro-badbank.aaronberkson.io/",
      walkthroughLink: "https://www.youtube.com/watch?v=zu0ZuGPph1o&list=PLbja35MJw1IRXh4uw8WBAfWLk44KOiFAa",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-bad-bank",
      className: "card-primary",
      techStack: ["mongo", "express", "react", "node"],
      subtitle: "MERN stack mock banking app"
    },
    {
      id: 2,
      demoLink: "https://mit-xpro-cart.aaronberkson.io/",
      walkthroughLink: "https://youtu.be/2-8KBByCbwE?si=qX0GudWrAnAfSq8j",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-cart",
      className: "card-secondary",
      techStack: ["apollo", "express", "react", "node"],
      subtitle: "Apollo DB based Shopping Cart"
    },
    {
      id: 3,
      img: demo2,
      demoLink: "https://mit-xpro-restaurant.aaronberkson.io/",
      walkthroughLink: "https://youtu.be/sN2oWELKsrA?si=ORHvMrK2yOCWN7x5",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-restaurant",
      className: "card-tertiary",
      techStack: ["stripe", "express", "react", "node"],
      subtitle: "Strapi DB & Stripe Ecommerce"
    }
  ];
  
  const getHeaderContent = card => {
    switch (card.id) {
      case 1:
        return {
          icon: <FaUniversity style={{ marginRight: "8px", verticalAlign: "middle" }} />,
          text: "Banking Demo"
        };
      case 2:
        return {
          icon: <FaShoppingCart style={{ marginRight: "8px", verticalAlign: "middle" }} />,
          text: "Shopping Cart Demo"
        };
      case 3:
        return {
          icon: (
            <FontAwesomeIcon
              icon={faMoneyBillTransfer}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
          ),
          text: "Ecommerce Demo"
        };
      default:
        return { icon: null, text: "" };
    }
  };
  
  const calculateImageDimensions = (cardId, availableImageWidth, maxAllowedHeight, imgDimensions) => {
    if (imgDimensions[cardId]) {
      const { naturalWidth, naturalHeight } = imgDimensions[cardId];
      const scale = Math.min(availableImageWidth / naturalWidth, maxAllowedHeight / naturalHeight);
      return { width: naturalWidth * scale, height: naturalHeight * scale };
    }
    const size = Math.min(maxAllowedHeight, availableImageWidth);
    return { width: size, height: size };
  };
  
  return (
    <div className="cards-container" style={containerStyle}>
      {cards.map(card => {
        const headerContent = getHeaderContent(card);
        const { width: finalImgWidth, height: finalImgHeight } = calculateImageDimensions(
          card.id,
          availableImageWidth,
          maxAllowedHeight,
          imgDimensions
        );
        if (DEBUG_CONSOLE)
          console.log(`[IO][DemoCardsCol] Card ${card.id} image dimensions: ${finalImgWidth}x${finalImgHeight}`);
  
        // For card 3, get the TrainSmoke settings (this is the only new addition)
        const trainSmokeSettings = card.id === 3 ? getInterpolatedTrainSmokeSettings(viewWidth) : null;
  
        return (
          <MotionDiv
            key={card.id}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: card.id * 0.2, duration: 0.35 }}
            style={{
              position: "relative",
              width: CARD_WIDTH,
              height: overallCardHeight,
              ...debugCardStyle
            }}
          >
            <Card className={card.className} style={{ width: "100%", height: "100%", padding: 0, margin: 0 }}>
              <div style={{ position: "relative", padding: "25px", boxSizing: "border-box" }}>
                {/* Title Section */}
                <div
                  style={{
                    height: DIMS.titleHeight,
                    padding: HEADER_PADDING,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    fontFamily: "var(--font-focal-medium)",
                    fontVariant: "small-caps",
                    fontSize: "1em",
                    ...debugHeaderStyle
                  }}
                >
                  {headerContent.icon}
                  <span>{headerContent.text}</span>
                </div>
  
                {/* Tech-Pill Row */}
                {card.techStack && card.techStack.length > 0 && (
                  <div
                    style={{
                      position: "relative",  // ← establish normal stacking
                      zIndex: 0,             // ← sits beneath the wave (10)
                      width: CARD_WIDTH - 50,
                      margin: "0 auto",
                      boxSizing: "border-box",
                      marginBottom: `${PILL_ROW_IMAGE_SPACING}px`
                    }}
                  >
                    <div style={{ display: "flex", gap: `${TECH_PILL_GAP}px`, alignItems: "center" }}>
                      {card.techStack.map(tech => (
                        <TechPill
                          key={tech}
                          tech={tech}
                          allocatedWidth={Math.floor((CARD_WIDTH - 50 - 3 * TECH_PILL_GAP) / 4)}
                        />
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Image Container */}
                <div
                  style={{
                    position: "relative",
                    width: finalImgWidth,
                    height: finalImgHeight,
                    margin: "0 auto 10px",
                    boxSizing: "border-box",
                    ...debugImageStyle
                  }}
                >
                  {card.id === 2 ? (
                    <DemoLogoAnim2Harvest size={finalImgWidth} />
                  ) : (
                    <Card.Img
                      variant="top"
                      src={card.img}
                      alt={card.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        maxWidth: DIMS.maxImageWidth,
                        ...debugImageStyle
                      }}
                      onLoad={e => handleImageLoad(e, card.id)}
                    />
                  )}
  
                  {/* For card 3, render the TrainSmoke overlay using the new settings */}
                  {card.id === 3 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: 10
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: `${trainSmokeSettings.x}%`,
                          top: `${trainSmokeSettings.y}%`,
                          // Instead of setting width/height, we apply a scale transform.
                          transform: `scale(${trainSmokeSettings.size / 100})`,
                          transformOrigin: "0 0"
                        }}
                      >
                        {React.cloneElement(<TrainSmoke />, {
                          style: {
                            position: "static",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none"
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
  
                {/* Card Body (Subtitle, Buttons, etc.) */}
                <Card.Body
                  style={{
                    padding: `0 10px ${getButtonBottomSpacing(viewWidth)}px`,
                    textAlign: "center",
                    ...debugBottomStyle
                  }}
                >
                  <Card.Subtitle
                    style={{
                      margin: "0 auto",
                      marginBottom: SUBTITLE_BUTTON_GAP,
                      fontSize: "0.9em",
                      ...debugBottomStyle
                    }}
                  >
                    {card.subtitle}
                  </Card.Subtitle>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      alignItems: "center",
                      ...debugBottomStyle
                    }}
                  >
                    <Button
                      href={card.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="demo-btn btn-launch"
                      style={{
                        height: "40px",
                        maxWidth: "280px",
                        width: "100%",
                        borderRadius: "8px",
                        fontFamily: "var(--font-focal-medium)",
                        fontSize: "1em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        ...debugBottomStyle
                      }}
                    >
                      <BsRocketTakeoffFill style={{ marginRight: "8px", verticalAlign: "middle" }} />
                      Launch Demo
                    </Button>
                    <Button
                      href={card.walkthroughLink || cards[0].walkthroughLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="demo-btn btn-youtube"
                      style={{
                        height: "40px",
                        maxWidth: "280px",
                        width: "100%",
                        borderRadius: "8px",
                        fontFamily: "var(--font-focal-medium)",
                        fontSize: "1em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        ...debugBottomStyle
                      }}
                    >
                      <FaYoutube style={{ marginRight: "8px", fontSize: "1.5em", verticalAlign: "middle", ...debugBottomStyle }} />
                      YouTube Tour
                    </Button>
                    <Button
                      href={card.githubLink || cards[0].githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="demo-btn btn-github"
                      style={{
                        height: "40px",
                        maxWidth: "280px",
                        width: "100%",
                        borderRadius: "8px",
                        fontFamily: "var(--font-focal-medium)",
                        fontSize: "1em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        ...debugBottomStyle
                      }}
                    >
                      <FaGithub style={{ marginRight: "8px", ...debugBottomStyle }} />
                      GitHub Repo
                    </Button>
                  </div>
                </Card.Body>
              </div>
            </Card>
  
            {/* Capstone Badge for Card 1 */}
            {card.id === 1 && (
              <div
                className="capstone-badge-wrapper"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  transform: `translate(${desktopBadgeOffsetX}px, ${desktopBadgeOffsetY}px)`,
                  width: "35px",
                  height: "35px",
                  zIndex: 5,
                  pointerEvents: "none"
                }}
              >
                <CapstoneBadge style={{ width: "35px", height: "35px" }} />
              </div>
            )}
  
          </MotionDiv>
        );
      })}
    </div>
  );
};
  
export default DemoCardsCol;
