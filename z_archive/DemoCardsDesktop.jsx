import React, { useState, useEffect, useMemo } from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt"; // NEW: Import the Tilt component!
import { FaYoutube, FaShoppingCart, FaUniversity, FaGithub } from "react-icons/fa";
import { BsRocketTakeoffFill } from "react-icons/bs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import demo1 from "../assets/demo1.png";
import demo2 from "../assets/demo2.png";
import demo3 from "../assets/demo3.png";
import DemoLogoAnim2Harvest from "./DemoLogoAnim2Harvest";
import CapstoneBadge from "./CapstoneBadge";
import "./DemoCardsDesktop.css"; // Local CSS for card-specific 3D effects
import { useAppReady } from "../contexts/AppReadyContext";

// Define DEBUG_MODE so it's available throughout the file.
const DEBUG_MODE = true;
// NEW: DEBUG_BORDER will add a border around all containers if set to true.
const DEBUG_BORDER = true;
const debugClass = DEBUG_BORDER ? " debug-border" : "";

/* ---------- Container & Overall Layout Constants ---------- */
const CARD_COUNT = 3;
const STATIC_CARD_GAP = 40;        // Fixed gap between cards (px)
const TOP_MARGIN = 110;             // Space above container

// Pull max-content width and mobile breakpoint from CSS (with fallbacks)
const MAX_CONTENT_WIDTH = parseFloat(
  getComputedStyle(document.documentElement).getPropertyValue('--desktop-max-width')
) || 1280;
const MAX_VIEWPORT_WIDTH = MAX_CONTENT_WIDTH;
const MIN_VIEWPORT_WIDTH = parseFloat(
  getComputedStyle(document.documentElement).getPropertyValue('--mobile-breakpoint')
) || 768;

// Pull the container padding from CSS
const CONTAINER_PADDING = parseFloat(
  getComputedStyle(document.documentElement).getPropertyValue('--container-padding-x')
) || 16;

/* ---------- Overall Card Height Constants ---------- */
const MAX_CARD_HEIGHT = 615;       // At 1280px (or wider)
const MIN_CARD_HEIGHT = 420;       // At 768px (or narrower)
const HEADER_HEIGHT = 30;          // Fixed header height (px)
const BOTTOM_AREA = 250;           // Fixed bottom area (subtitle and buttons)
const IMAGE_HEIGHT_MAX = MAX_CARD_HEIGHT - (HEADER_HEIGHT + BOTTOM_AREA);

/* ---------- Capstone Badge Offset Constants ---------- */
const CAPSTONE_BADGE_OFFSET_X = 3; // x-offset in pixels (negative moves left)
const CAPSTONE_BADGE_OFFSET_Y = -3; // y-offset in pixels (negative moves upward)

function calcOverallCardHeight(viewWidth) {
  let height;
  if (viewWidth >= MAX_VIEWPORT_WIDTH) {
    height = MAX_CARD_HEIGHT;
  } else if (viewWidth <= MIN_VIEWPORT_WIDTH) {
    height = MIN_CARD_HEIGHT;
  } else {
    height = Math.floor(
      MIN_CARD_HEIGHT +
        ((viewWidth - MIN_VIEWPORT_WIDTH) * (MAX_CARD_HEIGHT - MIN_CARD_HEIGHT)) /
          (MAX_VIEWPORT_WIDTH - MIN_VIEWPORT_WIDTH)
    );
  }
  if (DEBUG_MODE) console.log("[IO][DemoCardsDesktop] calcOverallCardHeight: viewWidth =", viewWidth, "=> height =", height);
  return height;
}

function calcImageScale(viewWidth) {
  let scale;
  if (viewWidth >= MAX_VIEWPORT_WIDTH) {
    scale = 1;
  } else if (viewWidth <= MIN_VIEWPORT_WIDTH) {
    scale = (IMAGE_HEIGHT_MAX - 180) / IMAGE_HEIGHT_MAX;
  } else {
    scale =
      ((viewWidth - MIN_VIEWPORT_WIDTH) *
        (1 - (IMAGE_HEIGHT_MAX - 180) / IMAGE_HEIGHT_MAX)) /
        (MAX_VIEWPORT_WIDTH - MIN_VIEWPORT_WIDTH) +
      (IMAGE_HEIGHT_MAX - 180) / IMAGE_HEIGHT_MAX;
  }
  if (DEBUG_MODE) console.log("[IO][DemoCardsDesktop] calcImageScale: viewWidth =", viewWidth, "=> scale =", scale);
  return scale;
}

/* ---------- Desktop Bottom Area Constants ---------- */
const DESKTOP_SUBTITLE_TOP_OFFSET = 10;   // Extra top margin to push the subtitle down.
const DESKTOP_SUBTITLE_GAP = 10;          // Gap below the subtitle (if needed)
const DESKTOP_BUTTON_GAP = 8;             // Gap between individual buttons.

/* ---------- Responsive Text & Label ---------- */
const SHORT_THRESHOLD = 300;
const getHeaderContent = (cardId, useShort) => {
  switch (cardId) {
    case 1:
      return {
        icon: <FaUniversity style={{ marginRight: "8px", verticalAlign: "middle" }} className={DEBUG_BORDER ? "debug-border" : ""} />,
        text: useShort ? "Banking" : "Banking Demo",
      };
    case 2:
      return {
        icon: <FaShoppingCart style={{ marginRight: "8px", verticalAlign: "middle" }} className={DEBUG_BORDER ? "debug-border" : ""} />,
        text: useShort ? "Shopping Cart" : "Shopping Cart Demo",
      };
    case 3:
      return {
        icon: (
          <FontAwesomeIcon
            icon={faMoneyBillTransfer}
            style={{ marginRight: "8px", verticalAlign: "middle" }}
            className={DEBUG_BORDER ? "debug-border" : ""}
          />
        ),
        text: useShort ? "Ecommerce" : "Ecommerce Demo",
      };
    default:
      return { icon: null, text: "" };
  }
};

const subtitleVariants = {
  1: { full: "MERN stack mock banking app", short: "MERN stack" },
  2: { full: "Apollo DB based Shopping Cart", short: "Apollo DB based" },
  3: { full: "Strapi DB & Stripe Ecommerce", short: "Strapi & Stripe" },
};

const buttonLabels = {
  launch: { full: "Launch Demo", short: "Launch" },
  youtube: { full: "YouTube Walkthrough", short: "YouTube" },
  github: { full: "GitHub Repo", short: "GitHub" },
};

/* ---------- Shadows & Animation (handled via Framer Motion) ---------- */
const DARK_SHADOW = "2px 2px 3px 0px rgba(0,0,0,0.35)";
const BRIGHT_SHADOW = "2px 4px 15px 2px rgba(147,112,219,0.4)";
const SLIDE_OFFSET = 120;
const CASCADE_DELAY = 0.15;
const CARD_ANIMATION_DURATION = 0.35;
const CARD_ANIMATION_EASING = [0.3, 0.15, 0.3, 1];

const CARD_VARIANTS = {
  hidden: { opacity: 0, x: -SLIDE_OFFSET },
  visible: { opacity: 1, x: 0 },
};

if (DEBUG_MODE) console.log("[IO][DemoCardsDesktop] DemoCardsDesktop file loaded.");

const DemoCardsDesktop = () => {
  const { appReady } = useAppReady();
  if (DEBUG_MODE) console.log("[IO][DemoCardsDesktop] DemoCardsDesktop component mounted. appReady =", appReady);

  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      if (DEBUG_MODE) console.log("[IO][DemoCardsDesktop] Window resized. New viewportWidth =", newWidth);
      setViewportWidth(newWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      if (DEBUG_MODE) console.log("[IO][DemoCardsDesktop] Cleaning up resize event listener.");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const availableWidth = Math.min(viewportWidth, MAX_CONTENT_WIDTH);
  const totalHorizontalGutter = (CONTAINER_PADDING * 2) + ((CARD_COUNT - 1) * STATIC_CARD_GAP);
  const contentWidth = availableWidth - totalHorizontalGutter;
  const CARD_WIDTH = Math.floor(contentWidth / CARD_COUNT);
  const useShort = CARD_WIDTH < SHORT_THRESHOLD;
  const overallCardHeight = calcOverallCardHeight(viewportWidth);
  const imageScale = calcImageScale(viewportWidth);
  const scaledImageHeight = Math.floor(IMAGE_HEIGHT_MAX * imageScale);
  const CARD_HEIGHT = HEADER_HEIGHT + scaledImageHeight + BOTTOM_AREA;

  if (DEBUG_MODE)
    console.log("[IO][DemoCardsDesktop] Computed values:", {
      viewportWidth,
      availableWidth,
      CARD_WIDTH,
      overallCardHeight,
      imageScale,
      scaledImageHeight,
      CARD_HEIGHT,
      useShort,
    });

  const cards = [
    {
      id: 1,
      img: demo1,
      demoLink: "https://mit-xpro-badbank.aaronberkson.io/",
      walkthroughLink:
        "https://www.youtube.com/watch?v=zu0ZuGPph1o&list=PLbja35MJw1IRXh4uw8WBAfWLk44KOiFAa",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-bad-bank",
      className: "card-thin-3d-primary",
      subtitleFull: subtitleVariants[1].full,
      subtitleShort: subtitleVariants[1].short,
    },
    {
      id: 2,
      img: demo2,
      demoLink: "https://mit-xpro-cart.aaronberkson.io/",
      className: "card-thin-3d-secondary",
      subtitleFull: subtitleVariants[2].full,
      subtitleShort: subtitleVariants[2].short,
    },
    {
      id: 3,
      img: demo3,
      demoLink: "https://mit-xpro-restaurant.aaronberkson.io/",
      className: "card-thin-3d-tertiary",
      subtitleFull: subtitleVariants[3].full,
      subtitleShort: subtitleVariants[3].short,
    },
  ];
  if (DEBUG_MODE) console.log("[IO][DemoCardsDesktop] Card definitions:", cards);

  const isTouchDevice = useMemo(() => {
    const hasTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    console.log("[IO][DemoCardsDesktop] isTouchDevice:", hasTouch);
    return hasTouch;
  }, []);

  const containerStyle = {
    marginTop: `${TOP_MARGIN}px`,
    width: `${availableWidth}px`,
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "var(--container-padding-x)",
    paddingRight: "var(--container-padding-x)",
    display: "flex",
    gap: `${STATIC_CARD_GAP}px`,
    justifyContent: "center",
    flexWrap: "nowrap",
  };

  return (
    <div className={"cards-container" + debugClass} style={containerStyle}>
      {cards.map((card, index) => {
        const headerContent = getHeaderContent(card.id, useShort);
        const subtitleText = useShort ? card.subtitleShort : card.subtitleFull;
        if (DEBUG_MODE)
          console.log("[IO][DemoCardsDesktop] Rendering card:", card.id, "Header:", headerContent.text, "Subtitle:", subtitleText);
        // Build card content element.
        const cardContent = (
          <motion.div
            className={"demo-card" + debugClass + " " + card.className}
            initial="hidden"
            animate={appReady ? "visible" : "hidden"}
            variants={CARD_VARIANTS}
            transition={{
              delay: appReady ? index * CASCADE_DELAY : 0,
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
            }}
          >
            <div
              className={debugClass}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                overflow: "visible",
              }}
            >
              {card.id === 1 && (
                <div
                  className={"capstone-badge-wrapper" + debugClass}
                  style={{
                    transform: `translate(${CAPSTONE_BADGE_OFFSET_X}px, ${CAPSTONE_BADGE_OFFSET_Y}px)`,
                  }}
                >
                  <CapstoneBadge />
                </div>
              )}
              <Card
                className={"card" + debugClass + " " + card.className}
                style={{
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  boxShadow: `${DARK_SHADOW}, ${BRIGHT_SHADOW}`,
                  borderRadius: "8px",
                  overflow: "visible",
                }}
              >
                {/* Fixed Header */}
                <div
                  className={debugClass}
                  style={{
                    height: `${HEADER_HEIGHT}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    fontFamily: "var(--font-focal-medium)",
                    fontVariant: "small-caps",
                    fontSize: "1em",
                    padding: "4px 10px",
                  }}
                >
                  {headerContent.icon}
                  <span>{headerContent.text}</span>
                </div>

                {/* Variable Image Container */}
                <div
                  className={"card-media" + debugClass}
                  style={{
                    height: `${scaledImageHeight}px`,
                    padding: "0 10px",
                    boxSizing: "border-box",
                  }}
                >
                  {card.id === 2 ? (
                    <DemoLogoAnim2Harvest />
                  ) : (
                    <Card.Img
                      variant="top"
                      src={card.img}
                      alt={card.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>

                {/* Fixed Bottom Area */}
                <Card.Body
                  className={"desktop-bottom" + debugClass}
                  style={{
                    padding: "0 10px 10px",
                    textAlign: "center",
                    marginTop: `${DESKTOP_SUBTITLE_TOP_OFFSET}px`,
                  }}
                >
                  <Card.Subtitle
                    className={"desktop-subtitle" + debugClass}
                    style={{
                      textAlign: "center",
                      margin: "0 auto",
                      marginBottom: `${DESKTOP_SUBTITLE_GAP}px`,
                    }}
                  >
                    {subtitleText}
                  </Card.Subtitle>
                  <div
                    className={"card-buttons" + debugClass}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: `${DESKTOP_BUTTON_GAP}px`,
                      margin: "0 auto",
                    }}
                  >
                    {/* Launch Button */}
                    <Button
                      href={card.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={"demo-btn btn-launch" + debugClass}
                      style={{
                        height: "40px",
                        maxWidth: "280px",
                        width: "100%",
                        borderRadius: "8px",
                        fontFamily: "var(--font-focal-medium)",
                        fontSize: "1em",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 0,
                      }}
                      onClick={() =>
                        console.log("[IO][DemoCardsDesktop] Launch Demo clicked for card:", card.id)
                      }
                    >
                      <BsRocketTakeoffFill style={{ marginRight: "8px", verticalAlign: "middle" }} />
                      {useShort ? buttonLabels.launch.short : buttonLabels.launch.full}
                    </Button>
                    {card.walkthroughLink && (
                      <Button
                        href={card.walkthroughLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={"demo-btn btn-youtube" + debugClass}
                        style={{
                          height: "40px",
                          maxWidth: "280px",
                          width: "100%",
                          borderRadius: "8px",
                          fontFamily: "var(--font-focal-medium)",
                          fontSize: "1em",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: 0,
                        }}
                        onClick={() =>
                          console.log("[IO][DemoCardsDesktop] YouTube Walkthrough clicked for card:", card.id)
                        }
                      >
                        <FaYoutube style={{ marginRight: "8px", fontSize: "1.5em", verticalAlign: "middle" }} />
                        {useShort ? buttonLabels.youtube.short : buttonLabels.youtube.full}
                      </Button>
                    )}
                    {card.id === 1 && (
                      <Button
                        href={card.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={"demo-btn btn-github" + debugClass}
                        style={{
                          height: "40px",
                          maxWidth: "280px",
                          width: "100%",
                          borderRadius: "8px",
                          fontFamily: "var(--font-focal-medium)",
                          fontSize: "1em",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: 0,
                        }}
                        onClick={() =>
                          console.log("[IO][DemoCardsDesktop] GitHub Repo clicked for card:", card.id)
                        }
                      >
                        <FaGithub style={{ marginRight: "8px", verticalAlign: "middle" }} />
                        {useShort ? buttonLabels.github.short : buttonLabels.github.full}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </motion.div>
        );

        return isTouchDevice ? (
          <div key={card.id} style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }} className={debugClass}>
            {cardContent}
          </div>
        ) : (
          <Tilt
            key={card.id}
            tiltMaxAngleX={9}
            tiltMaxAngleY={9}
            perspective={1000}
            scale={1.02}
            transitionSpeed={600}
            transitionEasing="cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}
            className={debugClass}
          >
            {cardContent}
          </Tilt>
        );
      })}
    </div>
  );
};

export default DemoCardsDesktop;
