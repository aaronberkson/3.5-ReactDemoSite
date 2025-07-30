// src/components/DemoCardsColumn.jsx
import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { FaYoutube, FaShoppingCart, FaUniversity, FaGithub } from "react-icons/fa";
import { BsRocketTakeoffFill } from "react-icons/bs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import demo1 from "../assets/demo1.png";
import demo2 from "../assets/demo2.png";
import demo3 from "../assets/demo3.png";
import DemoLogoAnim2Harvest from "./DemoLogoAnim2Harvest";
import CapstoneBadge from "./CapstoneBadge";
import "./DemoCardsMobile.css"; // Use your mobile CSS file
     
// -------------------- Debug & Layout Constants --------------------
const DEBUG = false;
const FIXED_TOP_OFFSET = 0;
const BUTTON_HEIGHT = 40;
const BUTTON_MAX_WIDTH = 280;
const GUTTER_PADDING = "clamp(20px, 5vw, 40px)";
const CONTAINER_MAX_WIDTH = "1280px";

// Spacing and Badge Constants
const HEADER_IMAGE_GAP = 0;
const SUBTITLE_BUTTON_GAP = 5;
const BADGE_OFFSET_TOP = 10;
const BADGE_OFFSET_RIGHT = 0;

// Animation Parameters
const CARD_ANIMATION_START_PERCENT = 100;
const CARD_ANIMATION_SPRING_STIFFNESS = 100;
const CARD_ANIMATION_SPRING_DAMPING = 20;
const CARD_ANIMATION_DELAY_MULTIPLIER = 0.2;

// For card heights:
const CARD_HEIGHT_BREAKPOINTS = [
  { width: 320, height: 400 },
  { width: 768, height: 600 }
];

// For image container heights:
const IMAGE_HEIGHT_BREAKPOINTS = [
  { width: 320, height: 230 },
  { width: 360, height: 270 },
  { width: 375, height: 280 },
  { width: 390, height: 290 },
  { width: 411, height: 290 },
  { width: 414, height: 290 },
  { width: 428, height: 290 },
  { width: 462, height: 290 },
  { width: 471, height: 290 },
  { width: 490, height: 290 },
  { width: 768, height: 300 }
];

// Text truncation breakpoint.
const TEXT_TRUNCATE_BREAKPOINT = 393;
// Define full and abridged labels for each card.
const CARD_LABELS = {
  1: {
    title: { full: "Banking Demo", abridged: "Banking" },
    subtitle: { full: "MERN stack mock banking app", abridged: "MERN stack" },
    buttons: {
      launch: { full: "Launch Demo", abridged: "Launch" },
      youtube: { full: "YouTube Walkthrough", abridged: "YouTube" },
      github: { full: "GitHub Repo", abridged: "GitHub" },
    },
  },
  2: {
    title: { full: "Shopping Cart Demo", abridged: "Shopping Cart" },
    subtitle: { full: "Apollo DB based Shopping Cart", abridged: "Apollo DB based" },
    buttons: { launch: { full: "Launch Demo", abridged: "Launch" } },
  },
  3: {
    title: { full: "Ecommerce Demo", abridged: "Ecommerce" },
    subtitle: { full: "Strapi DB & Stripe Ecommerce", abridged: "Strapi & Stripe" },
    buttons: { launch: { full: "Launch Demo", abridged: "Launch" } },
  },
};
// Fixed parts that don't scale:
const HEADER_HEIGHT = 40; 
const BOTTOM_AREA = 239;

// -------------------- Helper Functions --------------------
function interpolateValue(breakpoints, viewWidth, key) {
  if (viewWidth <= breakpoints[0].width) return breakpoints[0][key];
  if (viewWidth >= breakpoints[breakpoints.length - 1].width) return breakpoints[breakpoints.length - 1][key];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const bp1 = breakpoints[i];
    const bp2 = breakpoints[i + 1];
    if (viewWidth >= bp1.width && viewWidth <= bp2.width) {
      const ratio = (viewWidth - bp1.width) / (bp2.width - bp1.width);
      return bp1[key] + ratio * (bp2[key] - bp1[key]);
    }
  }
  return breakpoints[breakpoints.length - 1][key];
}

function getDynamicCardHeight(viewWidth) {
  return Math.floor(interpolateValue(CARD_HEIGHT_BREAKPOINTS, viewWidth, "height"));
}

function getDynamicImageHeight(viewWidth) {
  return Math.floor(interpolateValue(IMAGE_HEIGHT_BREAKPOINTS, viewWidth, "height"));
}

function getCardLabels(cardId, viewWidth) {
  const labels = CARD_LABELS[cardId];
  if (viewWidth <= TEXT_TRUNCATE_BREAKPOINT) {
    return {
      title: labels.title.abridged,
      subtitle: labels.subtitle.abridged,
      buttons: Object.fromEntries(
        Object.entries(labels.buttons).map(([key, val]) => [key, val.abridged])
      ),
    };
  } else {
    return {
      title: labels.title.full,
      subtitle: labels.subtitle.full,
      buttons: Object.fromEntries(
        Object.entries(labels.buttons).map(([key, val]) => [key, val.full])
      ),
    };
  }
}

function getHeaderContent(cardId, viewWidth) {
  let icon;
  switch (cardId) {
    case 1:
      icon = <FaUniversity style={{ marginRight: "8px", verticalAlign: "middle" }} />;
      break;
    case 2:
      icon = <FaShoppingCart style={{ marginRight: "8px", verticalAlign: "middle" }} />;
      break;
    case 3:
      icon = (
        <FontAwesomeIcon
          icon={faMoneyBillTransfer}
          style={{ marginRight: "8px", verticalAlign: "middle" }}
        />
      );
      break;
    default:
      icon = null;
  }
  const labels = getCardLabels(cardId, viewWidth);
  return { icon, text: labels.title };
}

// -------------------- DemoCardsColumn Component --------------------
const DemoCardsColumn = () => {
  const [viewWidth, setViewWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setViewWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const dynamicCardHeight = getDynamicCardHeight(viewWidth);
  const dynamicImageHeight = getDynamicImageHeight(viewWidth);
  const CARD_HEIGHT = HEADER_HEIGHT + dynamicImageHeight + BOTTOM_AREA;
  
  // Animation variants for mobile (vertical slide-in).
  const CARD_VARIANTS = {
    hidden: { opacity: 0, y: CARD_ANIMATION_START_PERCENT },
    visible: { opacity: 1, y: 0 },
  };
  
  // For mobile, the card takes full width minus a default 20px padding on either side.
  const CARD_WIDTH = viewWidth - 40;
  
  // Card data
  const cards = [
    {
      id: 1,
      title: "Bad Bank",
      subtitle: "MERN stack mock banking app",
      img: demo1,
      className: "card-primary",
      walkthroughLink:
        "https://www.youtube.com/watch?v=zu0ZuGPph1o&list=PLbja35MJw1IRXh4uw8WBAfWLk44KOiFAa",
      demoLink: "https://mit-xpro-badbank.aaronberkson.io/",
      githubLink: "https://github.com/aaronberkson/mit-x-pro-bad-bank",
    },
    {
      id: 2,
      title: "High-End Harvest",
      subtitle: "Apollo DB based Shopping Cart",
      img: demo2,
      className: "card-secondary",
      walkthroughLink: null,
      demoLink: "https://mit-xpro-cart.aaronberkson.io/",
    },
    {
      id: 3,
      title: "GravyTrain",
      subtitle: "Strapi DB & Stripe Ecommerce",
      img: demo3,
      className: "card-tertiary",
      walkthroughLink: null,
      demoLink: "https://mit-xpro-restaurant.aaronberkson.io/",
    },
  ];
  
  return (
    <div
      className="cards-mobile-container"
      style={{
        position: "relative",
        top: `${FIXED_TOP_OFFSET}px`,
        width: "100%",
        maxWidth: CONTAINER_MAX_WIDTH,
        padding: `0 clamp(10px, 3vw, 20px)`,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        overflow: "visible",
        border: DEBUG ? "2px dashed red" : "",
      }}
    >
      {cards.map((card, index) => {
        const headerContent = getHeaderContent(card.id, viewWidth);
        const labels = getCardLabels(card.id, viewWidth);
        return (
          <motion.div
            key={card.id}
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              border: DEBUG ? "2px dashed blue" : "",
            }}
            initial="hidden"
            animate="visible"
            variants={CARD_VARIANTS}
            transition={{
              delay: index * CARD_ANIMATION_DELAY_MULTIPLIER,
              type: "spring",
              stiffness: CARD_ANIMATION_SPRING_STIFFNESS,
              damping: CARD_ANIMATION_SPRING_DAMPING,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                border: DEBUG ? "2px dashed green" : "",
              }}
            >
              {card.id === 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: `${BADGE_OFFSET_TOP}px`,
                    right: `${BADGE_OFFSET_RIGHT}px`,
                    zIndex: 10,
                    border: DEBUG ? "2px dashed green" : "",
                  }}
                >
                  <CapstoneBadge />
                </div>
              )}
              <Card
                className={`card ${card.className}`}
                style={{
                  width: "100%",
                  height: `${CARD_HEIGHT}px`,
                  boxSizing: "border-box",
                  boxShadow: "2px 2px 3px 0px rgba(0,0,0,0.35)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  border: DEBUG ? "2px dashed purple" : "",
                }}
              >
                {/* Fixed Header */}
                <div
                  style={{
                    height: `${HEADER_HEIGHT}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    fontFamily: "var(--font-focal-medium)",
                    fontVariant: "small-caps",
                    fontSize: "1em",
                    padding: "4px 10px",
                    marginBottom: `${HEADER_IMAGE_GAP}px`,
                  }}
                >
                  {headerContent.icon}
                  <span>{headerContent.text}</span>
                </div>
                {/* Variable Image Container */}
                <div
                  style={{
                    width: `${dynamicImageHeight}px`,
                    height: `${dynamicImageHeight}px`,
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: `${HEADER_IMAGE_GAP}px`,
                    boxSizing: "border-box",
                    overflow: "hidden",
                    border: DEBUG ? "2px dashed green" : "",
                  }}
                >
                  {card.id === 2 ? (
                    <DemoLogoAnim2Harvest
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <Card.Img
                      variant="top"
                      src={card.img}
                      alt={card.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        border: DEBUG ? "2px dashed blue" : "",
                      }}
                    />
                  )}
                </div>
                {/* Fixed Bottom Area */}
                <Card.Body
                  style={{
                    padding: "0 10px 10px",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  <Card.Subtitle
                    style={{
                      textAlign: "center",
                      margin: "0 auto",
                      marginBottom: `${SUBTITLE_BUTTON_GAP}px`,
                    }}
                  >
                    {labels.subtitle}
                  </Card.Subtitle>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      alignItems: "center",
                      marginTop: "0",
                    }}
                  >
                    <Button
                      href={card.demoLink}
                      target="_blank"
                      className="btn-launch"
                      style={{
                        height: `${BUTTON_HEIGHT}px`,
                        maxWidth: `${BUTTON_MAX_WIDTH}px`,
                        width: "100%",
                        borderRadius: "8px",
                        fontFamily: "var(--font-focal-medium)",
                        fontSize: "1em",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() =>
                        console.log("[DemoCardsColumn] Launch Demo clicked for card:", card.id)
                      }
                    >
                      <BsRocketTakeoffFill style={{ marginRight: "8px", verticalAlign: "middle" }} />{" "}
                      {labels.buttons.launch}
                    </Button>
                    {card.walkthroughLink && (
                      <Button
                        href={card.walkthroughLink}
                        target="_blank"
                        className="btn-youtube"
                        style={{
                          height: `${BUTTON_HEIGHT}px`,
                          maxWidth: `${BUTTON_MAX_WIDTH}px`,
                          width: "100%",
                          borderRadius: "8px",
                          fontFamily: "var(--font-focal-medium)",
                          fontSize: "1em",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() =>
                          console.log("[DemoCardsColumn] YouTube Walkthrough clicked for card:", card.id)
                        }
                      >
                        <FaYoutube style={{ marginRight: "8px", fontSize: "1.5em" }} />{" "}
                        {labels.buttons.youtube}
                      </Button>
                    )}
                    {card.id === 1 && (
                      <Button
                        href={card.githubLink}
                        target="_blank"
                        className="btn-github"
                        style={{
                          height: `${BUTTON_HEIGHT}px`,
                          maxWidth: `${BUTTON_MAX_WIDTH}px`,
                          width: "100%",
                          borderRadius: "8px",
                          fontFamily: "var(--font-focal-medium)",
                          fontSize: "1em",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() =>
                          console.log("[DemoCardsColumn] GitHub Repo clicked for card:", card.id)
                        }
                      >
                        <FaGithub style={{ marginRight: "8px" }} /> {labels.buttons.github}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DemoCardsColumn;
