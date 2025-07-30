// src/components/DemoCardsRow.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { FaYoutube, FaShoppingCart, FaUniversity, FaGithub } from "react-icons/fa";
import { BsRocketTakeoffFill } from "react-icons/bs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import demo1 from "../assets/demo1.png";
import demo2 from "../assets/demo2.png";
import demo3 from "../assets/demo3-nosmoke-square.svg";
import DemoLogoAnim2Harvest from "./DemoLogoAnim2Harvest";
import DemoLogoAnim1BB from "./DemoLogoAnim1BB";
import CapstoneBadge from "./CapstoneBadge";
import TechPill from "./TechPill";
import TheaterMode from "./TheaterMode";
import TrainSmoke from "../pixi/TrainSmoke"; // Ensure this component accepts a "paused" prop
import "./DemoCards.css";
import { useAppReady } from "../contexts/AppReadyContext";
import GitHubLogo from "../assets/github-invertocat-light.svg?component";

/* ------------------ CONSTANTS & HELPERS ------------------ */
const DEBUG_CONSOLE = false;
const DEBUG_BORDER = false;

const debugOuterStyle = DEBUG_BORDER ? { outline: "3px dashed red" } : {};
const debugContainerStyle = DEBUG_BORDER ? { outline: "3px dashed blue" } : {};
const debugHeaderStyle = DEBUG_BORDER ? { outline: "3px dashed green" } : {};
const debugTechPillStyle = DEBUG_BORDER ? { outline: "3px dashed orange" } : {};
const debugImageContainerStyle = DEBUG_BORDER ? { outline: "3px dashed purple" } : {};
const debugBottomStyle = DEBUG_BORDER ? { outline: "3px dashed magenta" } : {};
const debugButtonContainerStyle = DEBUG_BORDER ? { outline: "3px dashed cyan" } : {};

const MAX_CONTENT_WIDTH =
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--desktop-max-width")) ||
  1280;
const MIN_VIEWPORT_WIDTH =
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mobile-breakpoint")) ||
  768;
const CONTAINER_PADDING =
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--container-padding-x")) ||
  16;

const CARD_COUNT = 3;
const STATIC_CARD_GAP = 41;
const TOP_MARGIN = 79;

const MAX_CARD_HEIGHT = 570;
const MIN_CARD_HEIGHT = 420;
const HEADER_HEIGHT = 30;
const BOTTOM_AREA = 290;
const IMAGE_PADDING_Y = 10;
// const IMAGE_HEIGHT_MAX = MAX_CARD_HEIGHT - (HEADER_HEIGHT + BOTTOM_AREA) + IMAGE_PADDING_Y;
const IMAGE_HEIGHT_MAX = 260 ;
const BTN_MAX_WIDTH = 260;
const BTN_HEIGHT = 40;

const CAPSTONE_BADGE_OFFSET_X = 3;
const CAPSTONE_BADGE_OFFSET_Y = -3;

const SHORT_THRESHOLD = 300;
const subtitleVariants = {
  1: { full: "MERN stack mock banking app", short: "MERN stack" },
  2: { full: "Apollo GraphQL Shopping Cart", short: "Apollo GraphQL" },
  3: { full: "Stripe Payments Ecommerce", short: "Stripe Payments" }
};
const buttonLabels = {
  launch: { full: "Launch Demo", short: "Launch" },
  youtube: { full: "YouTube Tour", short: "YouTube" },
  github: { full: "GitHub Repo", short: "GitHub" }
};

const DESKTOP_SUBTITLE_TOP_OFFSET = 10;
const DESKTOP_SUBTITLE_GAP = 10;
const DESKTOP_BUTTON_GAP = 8;

const DARK_SHADOW = "2px 2px 3px 0px rgba(0,0,0,0.35)";
const BRIGHT_SHADOW = "2px 4px 15px 2px rgba(147,112,219,0.4)";
const SLIDE_OFFSET = 120;
const CASCADE_DELAY = 0.15;
const CARD_ANIMATION_DURATION = 0.35;
const CARD_ANIMATION_EASING = [0.3, 0.15, 0.3, 1];
const CARD_VARIANTS = {
  hidden: { opacity: 0, x: -SLIDE_OFFSET },
  visible: { opacity: 1, x: 0 }
};

const OUTER_BORDER_THICKNESS = 1;
const EDGE_THICKNESS = 2;
const reversedBoxShadow =
  `2px 2px 3px 0px rgba(0,0,0,0.35), ` +
  `inset ${EDGE_THICKNESS}px ${EDGE_THICKNESS}px ${EDGE_THICKNESS * 2.5}px rgba(255,255,255,0.45), ` +
  `inset -${EDGE_THICKNESS}px -${EDGE_THICKNESS}px ${EDGE_THICKNESS * 2}px rgba(0,0,0,0.50)`;

const TECH_PILL_GAP = 2;
const TECH_PILL_TOTAL_BREAKPOINTS = [
  { viewport: 768, totalWidth: 135 },
  { viewport: 1024, totalWidth: 213 },
  { viewport: 1280, totalWidth: 298 }
];
function getDesiredTechPillTotalWidth(vw, multiplier = 102) {
  // Convert the percentage multiplier to a scaling factor.
  const factor = multiplier / 100;

  if (vw <= TECH_PILL_TOTAL_BREAKPOINTS[0].viewport) {
    return TECH_PILL_TOTAL_BREAKPOINTS[0].totalWidth * factor;
  }
  if (vw >= TECH_PILL_TOTAL_BREAKPOINTS[TECH_PILL_TOTAL_BREAKPOINTS.length - 1].viewport) {
    return TECH_PILL_TOTAL_BREAKPOINTS[TECH_PILL_TOTAL_BREAKPOINTS.length - 1].totalWidth * factor;
  }
  for (let i = 0; i < TECH_PILL_TOTAL_BREAKPOINTS.length - 1; i++) {
    const bp1 = TECH_PILL_TOTAL_BREAKPOINTS[i];
    const bp2 = TECH_PILL_TOTAL_BREAKPOINTS[i + 1];
    if (vw >= bp1.viewport && vw <= bp2.viewport) {
      const ratio = (vw - bp1.viewport) / (bp2.viewport - bp1.viewport);
      const interpolatedWidth = bp1.totalWidth + ratio * (bp2.totalWidth - bp1.totalWidth);
      return interpolatedWidth * factor;
    }
  }
  return TECH_PILL_TOTAL_BREAKPOINTS[TECH_PILL_TOTAL_BREAKPOINTS.length - 1].totalWidth * factor;
}


function calcOverallCardHeight(viewWidth) {
  if (viewWidth >= MAX_CONTENT_WIDTH) return MAX_CARD_HEIGHT;
  if (viewWidth <= MIN_VIEWPORT_WIDTH) return MIN_CARD_HEIGHT;
  return Math.floor(
    MIN_CARD_HEIGHT +
      ((viewWidth - MIN_VIEWPORT_WIDTH) * (MAX_CARD_HEIGHT - MIN_CARD_HEIGHT)) /
        (MAX_CONTENT_WIDTH - MIN_VIEWPORT_WIDTH)
  );
}

function calcImageScale(viewWidth) {
  if (viewWidth >= MAX_CONTENT_WIDTH) return 1;
  if (viewWidth <= MIN_VIEWPORT_WIDTH) return (IMAGE_HEIGHT_MAX - 180) / IMAGE_HEIGHT_MAX;
  return (
    ((viewWidth - MIN_VIEWPORT_WIDTH) *
      (1 - (IMAGE_HEIGHT_MAX - 180) / IMAGE_HEIGHT_MAX)) /
      (MAX_CONTENT_WIDTH - MIN_VIEWPORT_WIDTH) +
    (IMAGE_HEIGHT_MAX - 180) / IMAGE_HEIGHT_MAX
  );
}

const TRAIN_SMOKE_SETTINGS = [
  { viewport: 769, size: 80, x: -33, y: -15 },
  { viewport: 810, size: 85, x: -21, y: -10 },
  { viewport: 900, size: 90, x: 1, y: -2 },
  { viewport: 1024, size: 120, x: 3, y: 0 },
  { viewport: 1280, size: 163, x: 11, y: 3 }
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
        size: Math.round(curr.size + ratio * (next.size - curr.size)),
        x: Math.round(curr.x + ratio * (next.x - curr.x)),
        y: Math.round(curr.y + ratio * (next.y - curr.y))
      };
    }
  }
  return TRAIN_SMOKE_SETTINGS[TRAIN_SMOKE_SETTINGS.length - 1];
}

/* ------------------- END Chunk 1 ------------------- */

/* ------------------- Chunk 2: Component State & Computed Dimensions ------------------- */
const DemoCardsRow = () => {
  const { appReady } = useAppReady();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      if (DEBUG_CONSOLE) {
        console.log(`[IO][DemoCardsRow] New viewport width: ${window.innerWidth}px`);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isTouchDevice = useMemo(() => {
    const hasTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (DEBUG_CONSOLE) {
      console.log(`[IO][DemoCardsRow] isTouchDevice: ${hasTouch}`);
    }
    return hasTouch;
  }, []);

  const availableWidth = Math.min(viewportWidth, MAX_CONTENT_WIDTH);
  const totalHorizontalGutter = CONTAINER_PADDING * 2 + (CARD_COUNT - 1) * STATIC_CARD_GAP;
  const contentWidth = availableWidth - totalHorizontalGutter;
  const CARD_WIDTH = Math.floor(contentWidth / CARD_COUNT);
  const useShort = CARD_WIDTH < SHORT_THRESHOLD;
  const overallCardHeight = calcOverallCardHeight(viewportWidth);
  const imageScale = calcImageScale(viewportWidth);
  const scaledImageHeight = Math.floor(IMAGE_HEIGHT_MAX * imageScale);
  const availableImageWidth = CARD_WIDTH - 20;
  const squareSide = Math.min(scaledImageHeight, availableImageWidth);
  const CARD_HEIGHT = HEADER_HEIGHT + scaledImageHeight + BOTTOM_AREA;

  if (DEBUG_CONSOLE) {
    console.log("[IO][DemoCardsRow] Calculated Values:", {
      viewportWidth,
      availableWidth,
      CARD_WIDTH,
      overallCardHeight,
      imageScale,
      scaledImageHeight,
      squareSide,
      CARD_HEIGHT,
      useShort
    });
  }

  const cards = [
    {
      id: 1,
      title: "Bad Bank",
      subtitleFull: subtitleVariants[1].full,
      subtitleShort: subtitleVariants[1].short,
      img: demo1,
      className: "card-thin-3d-primary",
      walkthroughLink: "https://www.youtube.com/watch?v=zu0ZuGPph1o&list=PLbja35MJw1IRXh4uw8WBAfWLk44KOiFAa",
      demoLink: "https://mit-xpro-badbank.aaronberkson.io/",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-bad-bank",
      techStack: ["mongo", "express", "react", "node"]
    },
    {
      id: 2,
      title: "High-End Harvest",
      subtitleFull: subtitleVariants[2].full,
      subtitleShort: subtitleVariants[2].short,
      img: demo2,
      className: "card-thin-3d-secondary",
      walkthroughLink: "https://www.youtube.com/watch?v=highendharvest",
      demoLink: "https://mit-xpro-cart.aaronberkson.io/",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-cart",
      techStack: ["apollo", "express", "react", "node"]
    },
    {
      id: 3,
      title: "GravyTrain",
      subtitleFull: subtitleVariants[3].full,
      subtitleShort: subtitleVariants[3].short,
      img: demo3,
      className: "card-thin-3d-tertiary",
      walkthroughLink: "https://www.youtube.com/watch?v=gravytrain",
      demoLink: "https://mit-xpro-restaurant.aaronberkson.io/",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-restaurant",
      techStack: ["stripe", "express", "react", "node"]
    }
  ];

  if (DEBUG_CONSOLE) {
    console.log("[IO][DemoCardsRow] Card Definitions:", cards);
  }

  const desiredTechPillTotalWidth = getDesiredTechPillTotalWidth(viewportWidth);
  const totalPillGap = (4 - 1) * TECH_PILL_GAP;
  const allocatedPillWidth = Math.round((desiredTechPillTotalWidth - totalPillGap) / 4);
  if (DEBUG_CONSOLE) {
    console.log(`[IO][DemoCardsRow] CARD_WIDTH: ${CARD_WIDTH}px`);
    console.log(`[IO][DemoCardsRow] Desired total tech-pill width: ${desiredTechPillTotalWidth}px`);
    console.log(`[IO][DemoCardsRow] Total gap for pills: ${totalPillGap}px`);
    console.log(`[IO][DemoCardsRow] Allocated width per pill: ${allocatedPillWidth}px`);
  }

  const containerStyle = {
    marginTop: TOP_MARGIN,
    width: availableWidth,
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "var(--container-padding-x)",
    paddingRight: "var(--container-padding-x)",
    display: "flex",
    gap: STATIC_CARD_GAP,
    justifyContent: "center",
    flexWrap: "nowrap",
    ...debugOuterStyle
  };

/* ------------------- END Chunk 2 ------------------- */

/* ------------------- Chunk 3: Render JSX ------------------- */

// New unified spacing constants for inner card content
const CARD_TOP_MARGIN    = "8px";     // Vertical gap above each inner section
const CARD_SIDE_MARGIN   = "10px";    // Horizontal padding for inner sections
const CARD_BOTTOM_MARGIN = "8px";     // Vertical gap below each inner section
const CARD_CONTENT_WIDTH = "280px";   // Unified width for header, tech-pill row, image, buttons, etc.



const renderCard1 = () => {
  const card = cards[0];
  const [cardHovered, setCardHovered] = useState(false);
  const [theaterModeOpen, setTheaterModeOpen] = useState(false);

  const handleYouTubeClick = (e) => {
    e.preventDefault();
    if (DEBUG_CONSOLE) console.log(`[IO][DemoCardsRow] YouTube clicked for card: ${card.id}`);
    setCardHovered(false); 
    setTheaterModeOpen(true);
  };

  return (
    <div
      onMouseEnter={() => {
        if (DEBUG_CONSOLE) console.log("[IO][Card1] Mouse entered.");
        setCardHovered(true);
      }}
      onMouseLeave={() => {
        if (DEBUG_CONSOLE) console.log("[IO][Card1] Mouse left.");
        setCardHovered(false);
      }}
    >
      <Tilt
        key={card.id}
        tiltMaxAngleX={9}
        tiltMaxAngleY={9}
        perspective={1000}
        scale={1.02}
        transitionSpeed={600}
        transitionEasing="cubic-bezier(0.25,0.46,0.45,0.94)"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, ...debugContainerStyle }}
      >
        <motion.div
          className={`demo-card ${card.className} inverted`}
          initial="hidden"
          animate="visible"
          variants={CARD_VARIANTS}
          transition={{
            delay: 0 * CASCADE_DELAY,
            duration: CARD_ANIMATION_DURATION,
            ease: CARD_ANIMATION_EASING,
          }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            overflow: "visible",
            transformStyle: "preserve-3d",
            perspective: "1000px",
            ...debugContainerStyle,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              overflow: "visible",
              ...debugContainerStyle,
            }}
          >
            {card.id === 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  transform: `translate(${CAPSTONE_BADGE_OFFSET_X}px, ${CAPSTONE_BADGE_OFFSET_Y}px)`,
                  zIndex: 9999,
                  pointerEvents: "none",
                  ...debugContainerStyle,
                }}
              >
                <CapstoneBadge />
              </div>
            )}
            <Card
              className={`card ${card.className} inverted`}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                margin: 0,
                border: `${OUTER_BORDER_THICKNESS}px solid rgba(0,0,0,0.15)`,
                boxShadow: reversedBoxShadow,
                borderRadius: "8px",
                overflow: "visible",
                ...debugContainerStyle,
              }}
            >
              <div
                style={{
                  height: HEADER_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  fontFamily: "Focal Medium, sans-serif",
                  fontVariant: "small-caps",
                  fontSize: "1em",
                  padding: "0px 7px",
                  ...debugHeaderStyle,
                }}
              >
                <FaUniversity
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                <span>{useShort ? "Banking" : "Banking Demo"}</span>
              </div>
              <div
                className="tech-pill-row"
                style={{ padding: "3px 7px 10px 7px", ...debugContainerStyle }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    gap: `${TECH_PILL_GAP}px`,
                    ...debugTechPillStyle,
                  }}
                >
                  {card.techStack.map((tech) => (
                    <TechPill key={tech} tech={tech} allocatedWidth={allocatedPillWidth} />
                  ))}
                </div>
              </div>
              <div
                style={{
                  width: squareSide,
                  height: squareSide,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto 10px auto",
                  boxSizing: "border-box",
                  position: "relative",
                  ...debugImageContainerStyle,
                }}
              >
                <DemoLogoAnim1BB size={squareSide} hovered={!theaterModeOpen && cardHovered} />
              </div>
              <Card.Body
                className="desktop-bottom"
                style={{
                  padding: "0 10px 10px",
                  textAlign: "center",
                  marginTop: DESKTOP_SUBTITLE_TOP_OFFSET,
                  ...debugBottomStyle,
                }}
              >
                <Card.Subtitle
                  className="desktop-subtitle"
                  style={{
                    textAlign: "center",
                    margin: "0 auto",
                    marginBottom: DESKTOP_SUBTITLE_GAP,
                    ...debugBottomStyle,
                  }}
                >
                  {useShort ? card.subtitleShort : card.subtitleFull}
                </Card.Subtitle>
                <div
                  className="card-buttons"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: DESKTOP_BUTTON_GAP,
                    margin: "0 auto",
                    ...debugButtonContainerStyle,
                  }}
                >
                  <Button
                    href={card.demoLink || cards[0].demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-launch"
                    style={{
                      maxWidth: BTN_MAX_WIDTH,
                      height: BTN_HEIGHT,
                      width: "100%",
                    }}
                    onClick={() =>
                      console.log(`[IO][DemoCardsRow] Launch Demo clicked for card: ${card.id}`)
                    }
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <BsRocketTakeoffFill
                          style={{ width: "20px", height: "20px" }}
                          className={`icon-launch-size ${
                            useShort ? "shiftX-launch-icon-short" : "shiftX-launch-icon-long"
                          }`}
                        />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-launch-text-short" : "shiftX-launch-text-long"}>
                          {useShort ? buttonLabels.launch.short : buttonLabels.launch.full}
                        </span>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={handleYouTubeClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-youtube"
                    style={{
                      maxWidth: BTN_MAX_WIDTH,
                      height: BTN_HEIGHT,
                      width: "100%",
                      ...debugButtonContainerStyle,
                    }}
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <FaYoutube className={`icon-youtube-size ${useShort ? "shiftX-youtube-icon-short" : "shiftX-youtube-icon-long"}`} />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-youtube-text-short" : "shiftX-youtube-text-long"}>
                          {useShort ? buttonLabels.youtube.short : buttonLabels.youtube.full}
                        </span>
                      </div>
                    </div>
                  </Button>

                  <Button
                    href={card.githubLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-github"
                    style={{
                      maxWidth: BTN_MAX_WIDTH,
                      height: BTN_HEIGHT,
                      width: "100%",
                    }}
                    onClick={() =>
                      console.log(`[IO][DemoCardsRow] GitHub clicked for card: ${card.id}`)
                    }
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <FaGithub
                          style={{ width: "20px", height: "20px" }}
                          className={`icon-github-size ${
                            useShort ? "shiftX-github-icon-short" : "shiftX-github-icon-long"
                          }`}
                        />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-github-text-short" : "shiftX-github-text-long"}>
                          {useShort ? buttonLabels.github.short : buttonLabels.github.full}
                        </span>
                      </div>
                    </div>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      </Tilt>
      <TheaterMode
        isOpen={theaterModeOpen}
        playlistKey="card1"
        onClose={() => setTheaterModeOpen(false)}
        customContainerStyle={{
          // Optional additional style overrides
        }}
      />
    </div>
  );
};

const renderCard2 = () => {
  const card = cards[1];
  const [harvestKey, setHarvestKey] = useState(Date.now());
  const [harvestPaused, setHarvestPaused] = useState(true);

  // Local state to control TheaterMode
  const [theaterModeOpen, setTheaterModeOpen] = useState(false);
  const [cardType, setCardType] = useState(""); // this will be "card2" for card2

  // Local click handler for YouTube button for card2
  const handleYouTubeClickCard2 = (e) => {
    e.preventDefault();
    if (DEBUG_CONSOLE) {
      console.log("[IO][DemoCardsRow] YouTube clicked for card: card2");
    }
    setCardType("card2");
    setTheaterModeOpen(true);
  };

  return (
    <div
      onMouseEnter={() => {
        if (DEBUG_CONSOLE) {
          console.log("[IO][Card2] Mouse entered");
        }
        setHarvestKey(Date.now());
        setHarvestPaused(false);
      }}
      onMouseLeave={() => {
        if (DEBUG_CONSOLE) {
          console.log("[IO][Card2] Mouse left");
        }
        setHarvestPaused(true);
      }}
    >
      <Tilt
        key={card.id}
        tiltMaxAngleX={9}
        tiltMaxAngleY={9}
        perspective={1000}
        scale={1.02}
        transitionSpeed={600}
        transitionEasing="cubic-bezier(0.25,0.46,0.45,0.94)"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, ...debugContainerStyle }}
      >
        <motion.div
          className={`demo-card ${card.className} inverted`}
          initial="hidden"
          animate="visible"
          variants={CARD_VARIANTS}
          transition={{
            delay: appReady ? 1 * CASCADE_DELAY : 0,
            duration: CARD_ANIMATION_DURATION,
            ease: CARD_ANIMATION_EASING,
          }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            overflow: "visible",
            transformStyle: "preserve-3d",
            perspective: "1000px",
            ...debugContainerStyle,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              overflow: "visible",
              ...debugContainerStyle,
            }}
          >
            <Card
              className={`card ${card.className} inverted`}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                margin: 0,
                border: `${OUTER_BORDER_THICKNESS}px solid rgba(0,0,0,0.15)`,
                boxShadow: reversedBoxShadow,
                borderRadius: "8px",
                overflow: "visible",
                ...debugContainerStyle,
              }}
            >
              <div
                style={{
                  height: HEADER_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  fontFamily: "var(--font-focal-medium)",
                  fontVariant: "small-caps",
                  fontSize: "1em",
                  padding: "4px 7px",
                  ...debugHeaderStyle,
                }}
              >
                <BsRocketTakeoffFill
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                <span>{useShort ? "Shopping Cart" : "Shopping Cart Demo"}</span>
              </div>
              <div
                className="tech-pill-row"
                style={{ padding: "3px 7px 10px 7px", ...debugContainerStyle }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    gap: `${TECH_PILL_GAP}px`,
                    ...debugTechPillStyle,
                  }}
                >
                  {card.techStack.map((tech) => (
                    <TechPill
                      key={tech}
                      tech={tech}
                      allocatedWidth={allocatedPillWidth}
                    />
                  ))}
                </div>
              </div>
              <div
                style={{
                  width: squareSide,
                  height: squareSide,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto 10px auto",
                  boxSizing: "border-box",
                  position: "relative",
                  ...debugImageContainerStyle,
                }}
              >
                <DemoLogoAnim2Harvest key={harvestKey} size={squareSide} paused={harvestPaused} />
              </div>
              <Card.Body
                className="desktop-bottom"
                style={{
                  width: "100%",
                  padding: "0 10px 10px",
                  textAlign: "center",
                  marginTop: DESKTOP_SUBTITLE_TOP_OFFSET,
                  ...debugBottomStyle,
                }}
              >
                <Card.Subtitle
                  className="desktop-subtitle"
                  style={{
                    textAlign: "center",
                    margin: "0 auto",
                    marginBottom: DESKTOP_SUBTITLE_GAP,
                    ...debugBottomStyle,
                  }}
                >
                  {useShort ? card.subtitleShort : card.subtitleFull}
                </Card.Subtitle>
                <div
                  className="card-buttons"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: DESKTOP_BUTTON_GAP,
                    margin: "0 auto",
                    textAlign: "center",
                    ...debugButtonContainerStyle,
                  }}
                >
                  <Button
                    href={card.demoLink || cards[1].demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-launch"
                    style={{
                      maxWidth: BTN_MAX_WIDTH,
                      height: BTN_HEIGHT,
                      width: "100%",
                      ...debugButtonContainerStyle,
                    }}
                    onClick={() =>
                      console.log(`[IO][DemoCardsRow] Launch Demo clicked for card: ${card.id}`)
                    }
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <BsRocketTakeoffFill className={`icon-launch-size ${useShort ? "shiftX-launch-icon-short" : "shiftX-launch-icon-long"}`} />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-launch-text-short" : "shiftX-launch-text-long"}>
                          {useShort ? buttonLabels.launch.short : buttonLabels.launch.full}
                        </span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    href={card.walkthroughLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-youtube"
                    style={{
                      maxWidth: BTN_MAX_WIDTH,
                      height: BTN_HEIGHT,
                      width: "100%",
                      ...debugButtonContainerStyle,
                    }}
                    onClick={handleYouTubeClickCard2}
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <FaYoutube className={`icon-youtube-size ${useShort ? "shiftX-youtube-icon-short" : "shiftX-youtube-icon-long"}`} />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-youtube-text-short" : "shiftX-youtube-text-long"}>
                          {useShort ? buttonLabels.youtube.short : buttonLabels.youtube.full}
                        </span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    href={card.githubLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-github"
                    style={{
                      maxWidth: BTN_MAX_WIDTH,
                      height: BTN_HEIGHT,
                      width: "100%",
                      ...debugButtonContainerStyle,
                    }}
                    onClick={() =>
                      console.log(`[IO][DemoCardsRow] GitHub clicked for card: ${card.id}`)
                    }
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <FaGithub className={`icon-github-size ${useShort ? "shiftX-github-icon-short" : "shiftX-github-icon-long"}`} />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-github-text-short" : "shiftX-github-text-long"}>
                          {useShort ? buttonLabels.github.short : buttonLabels.github.full}
                        </span>
                      </div>
                    </div>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      </Tilt>
      {/* Invoke TheaterMode for card2 */}
      {theaterModeOpen && (
        <TheaterMode
          isOpen={theaterModeOpen}
          cardType={cardType}
          onClose={() => setTheaterModeOpen(false)}
        />
      )}
    </div>
  );
};

const renderCard3 = () => {
  const card3 = cards[2];

  // Local state for TheaterMode and the card type.
  const [theaterModeOpen, setTheaterModeOpen] = useState(false);
  const [cardType, setCardType] = useState("");

  // Local state for controlling the TrainSmoke animation (false = animating, true = paused)
  const [trainSmokePaused, setTrainSmokePaused] = useState(false); // begins animating as intro

  // A stable state variable for TheaterMode’s reset key. (Not recalculated on viewport changes.)
  const [resetKey, setResetKey] = useState(null);

  // When the card first renders and the app is ready, pause the smoke after the intro animation.
  // Using Card3’s exact timing: total = ((CARD_COUNT - 1) * CASCADE_DELAY + CARD_ANIMATION_DURATION) * 1000.
  useEffect(() => {
    if (!isTouchDevice && appReady) {
      const totalAnimationTimeMs = ((CARD_COUNT - 1) * CASCADE_DELAY + CARD_ANIMATION_DURATION) * 1000;
      // Slight adjustment if needed—tweak the offset value until it matches Card2 exactly.
      const adjustedTime = totalAnimationTimeMs - 20; // adjust here if necessary
      const timer = setTimeout(() => {
        setTrainSmokePaused(true);
      }, adjustedTime);
      return () => clearTimeout(timer);
    }
  }, [appReady, isTouchDevice]);

  // YouTube click handler. Note: Only trigger if TheaterMode isn’t already open.
  const handleYouTubeClickCard3 = (e) => {
    e.preventDefault();
    if (DEBUG_CONSOLE) console.log("[DemoCardsRow] YouTube clicked for card: card3");

    if (theaterModeOpen) return; // Prevent re-invocation on resize or duplicate clicks

    // On non-touch devices, ensure the smoke is paused.
    if (!isTouchDevice) {
      setTrainSmokePaused(true);
    }
    setCardType("card3");

    // Set a stable resetKey if it hasn't been set yet. This is similar to what Card2 does.
    if (!resetKey) {
      setResetKey(Date.now());
    }
    setTheaterModeOpen(true);
  };

  return (
    <div
      key={card3.id}
      onMouseEnter={() => {
        // Mouse events affect the smoke only on non-touch devices and if TheaterMode isn’t open.
        if (!isTouchDevice && !theaterModeOpen) setTrainSmokePaused(false);
      }}
      onMouseLeave={() => {
        if (!isTouchDevice) setTrainSmokePaused(true);
      }}
      style={{ display: "inline-block" }}
    >
      <Tilt
        tiltMaxAngleX={9}
        tiltMaxAngleY={9}
        perspective={1000}
        scale={1.02}
        transitionSpeed={600}
        transitionEasing="cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, ...debugContainerStyle }}
      >
        <motion.div
          className={`demo-card ${card3.className} inverted`}
          initial="hidden"
          animate={appReady ? "visible" : "hidden"}
          variants={CARD_VARIANTS}
          transition={{
            delay: appReady ? 2 * CASCADE_DELAY : 0, // Card3 (third card): delay = 2 * CASCADE_DELAY
            duration: CARD_ANIMATION_DURATION,
            ease: CARD_ANIMATION_EASING,
          }}
          // Optionally, you can attach onAnimationComplete here if you want to pause exactly then:
          // onAnimationComplete={() => { if (!isTouchDevice) setTrainSmokePaused(true); }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            overflow: "visible",
            transformStyle: "preserve-3d",
            perspective: "1000px",
            ...debugContainerStyle,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              overflow: "visible",
              ...debugContainerStyle,
            }}
          >
            <Card
              className={`card ${card3.className} inverted`}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                margin: 0,
                border: `${OUTER_BORDER_THICKNESS}px solid rgba(0,0,0,0.15)`,
                boxShadow: reversedBoxShadow,
                borderRadius: "8px",
                overflow: "visible",
                ...debugContainerStyle,
              }}
            >
              <div
                style={{
                  height: HEADER_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  fontFamily: "var(--font-focal-medium)",
                  fontVariant: "small-caps",
                  fontSize: "1em",
                  padding: "0px 7px",
                  ...debugHeaderStyle,
                }}
              >
                <FontAwesomeIcon
                  icon={faMoneyBillTransfer}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                <span>{useShort ? "Ecommerce" : "Ecommerce Demo"}</span>
              </div>
              <div
                className="tech-pill-row"
                style={{ padding: "3px 7px 6px 7px", ...debugContainerStyle }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    gap: `${TECH_PILL_GAP}px`,
                    zIndex: 1000,
                    ...debugTechPillStyle,
                  }}
                >
                  {card3.techStack.map((tech) => (
                    <TechPill key={tech} tech={tech} allocatedWidth={allocatedPillWidth} />
                  ))}
                </div>
              </div>
              <div
                style={{
                  width: squareSide,
                  height: squareSide,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto 10px auto",
                  boxSizing: "border-box",
                  position: "relative",
                  ...debugImageContainerStyle,
                }}
              >
                <Card.Img
                  variant="top"
                  src={demo3}
                  alt="GravyTrain"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    ...debugImageContainerStyle,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                >
                  {(() => {
                    const trainSmokeSettings = getInterpolatedTrainSmokeSettings(viewportWidth);
                    return (
                      <div
                        style={{
                          position: "absolute",
                          left: `${trainSmokeSettings.x}%`,
                          top: `${trainSmokeSettings.y}%`,
                          transform: `scale(${trainSmokeSettings.size / 100})`,
                          transformOrigin: "0 0",
                          zIndex: 1,
                        }}
                      >
                        <TrainSmoke paused={theaterModeOpen || trainSmokePaused} />
                      </div>
                    );
                  })()}
                </div>
              </div>
              <Card.Body
                className="desktop-bottom"
                style={{
                  padding: "0 10px 10px",
                  textAlign: "center",
                  marginTop: DESKTOP_SUBTITLE_TOP_OFFSET,
                  ...debugBottomStyle,
                }}
              >
                <Card.Subtitle
                  className="desktop-subtitle"
                  style={{
                    textAlign: "center",
                    margin: "0 auto",
                    marginBottom: DESKTOP_SUBTITLE_GAP,
                    ...debugBottomStyle,
                  }}
                >
                  {useShort ? card3.subtitleShort : card3.subtitleFull}
                </Card.Subtitle>
                <div
                  className="card-buttons"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: DESKTOP_BUTTON_GAP,
                    margin: "0 auto",
                    ...debugButtonContainerStyle,
                  }}
                >
                  <Button
                    href={card3.demoLink || cards[0].demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-launch"
                    style={{
                      maxWidth: BTN_MAX_WIDTH,
                      height: BTN_HEIGHT,
                      width: "100%",
                    }}
                    onClick={() =>
                      console.log(`[renderCard3] Launch Demo clicked for card: ${card3.id}`)
                    }
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <BsRocketTakeoffFill
                          className={`icon-launch-size ${
                            useShort ? "shiftX-launch-icon-short" : "shiftX-launch-icon-long"
                          }`}
                        />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-launch-text-short" : "shiftX-launch-text-long"}>
                          {useShort ? buttonLabels.launch.short : buttonLabels.launch.full}
                        </span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-youtube"
                    style={{ maxWidth: BTN_MAX_WIDTH, height: BTN_HEIGHT, width: "100%" }}
                    onClick={handleYouTubeClickCard3}
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <FaYoutube
                          className={`icon-youtube-size ${
                            useShort ? "shiftX-youtube-icon-short" : "shiftX-youtube-icon-long"
                          }`}
                        />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-youtube-text-short" : "shiftX-youtube-text-long"}>
                          {useShort ? buttonLabels.youtube.short : buttonLabels.youtube.full}
                        </span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    href={card3.githubLink || cards[0].githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn btn-github"
                    style={{ maxWidth: BTN_MAX_WIDTH, height: BTN_HEIGHT, width: "100%" }}
                    onClick={() =>
                      console.log(`[renderCard3] GitHub Repo clicked for card: ${card3.id}`)
                    }
                  >
                    <div className="button-content">
                      <div className="icon-cell">
                        <FaGithub
                          className={`icon-github-size ${
                            useShort ? "shiftX-github-icon-short" : "shiftX-github-icon-long"
                          }`}
                        />
                      </div>
                      <div className="text-cell">
                        <span className={useShort ? "shiftX-github-text-short" : "shiftX-github-text-long"}>
                          {useShort ? buttonLabels.github.short : buttonLabels.github.full}
                        </span>
                      </div>
                    </div>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      </Tilt>
      {theaterModeOpen && (
        <TheaterMode
          isOpen={theaterModeOpen}
          resetKey={resetKey}
          cardType={cardType}
          onClose={() => {
            setTheaterModeOpen(false);
            // When TheaterMode closes, on non-touch devices force the smoke to remain paused.
            if (!isTouchDevice) setTrainSmokePaused(true);
          }}
          // Constrain the TheaterMode container so the video doesn't exceed the viewport height.
          customContainerStyle={{ maxHeight: "100vh", overflowY: "auto" }}
        />
      )}
    </div>
  );
};


return (
  <div className="cards-container" style={containerStyle}>
    {cards.map((card) => {
      if (card.id === 1) return <div key={card.id}>{renderCard1()}</div>;
      if (card.id === 2) return <div key={card.id}>{renderCard2()}</div>;
      return <div key={card.id}>{renderCard3()}</div>;
    })}
  </div>
);
/* --- End DemoCardsRow helper functions and return --- */

};

export default DemoCardsRow;
