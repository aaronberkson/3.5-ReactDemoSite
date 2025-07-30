// src/components/DemoCards.jsx
import React, { useState, useEffect } from "react";
import DemoCardsRow from "./DemoCardsRow";
import DemoCardsCol from "./DemoCardsCol";
import { useAppReady } from "../contexts/AppReadyContext";
import "./DemoCards.css";

// Define a breakpoint for mobile vs. desktop:
const MOBILE_BREAKPOINT = 768;

// Define your card data here (or import from a separate file)
const desktopCards = [
  {
    id: 1,
    title: "Bad Bank",
    subtitleFull: "MERN stack mock banking app",
    subtitleShort: "MERN stack",
    img: "/assets/demo1.png",
    className: "card-thin-3d-primary",
    walkthroughLink: "https://www.youtube.com/watch?v=zu0ZuGPph1o&list=PLbja35MJw1IRXh4uw8WBAfWLk44KOiFAa",
    demoLink: "https://mit-xpro-badbank.aaronberkson.io/",
    githubLink: "https://github.com/aaronberkson/mit-x-pro-bad-bank"
  },
  {
    id: 2,
    title: "High-End Harvest",
    subtitleFull: "Apollo DB based Shopping Cart",
    subtitleShort: "Apollo DB based",
    img: "/assets/demo2.png",
    className: "card-thin-3d-secondary",
    walkthroughLink: null,
    demoLink: "https://mit-xpro-cart.aaronberkson.io/"
  },
  {
    id: 3,
    title: "GravyTrain",
    subtitleFull: "Strapi DB & Stripe Ecommerce",
    subtitleShort: "Strapi & Stripe",
    img: "/assets/demo3.png",
    className: "card-thin-3d-tertiary",
    walkthroughLink: null,
    demoLink: "https://mit-xpro-restaurant.aaronberkson.io/"
  }
];

const mobileCards = [
  {
    id: 1,
    title: "Bad Bank",
    subtitle: "MERN stack mock banking app",
    img: "/assets/demo1.png",
    className: "card-primary",
    walkthroughLink: "https://www.youtube.com/watch?v=zu0ZuGPph1o&list=PLbja35MJw1IRXh4uw8WBAfWLk44KOiFAa",
    demoLink: "https://mit-xpro-badbank.aaronberkson.io/",
    githubLink: "https://github.com/aaronberkson/mit-x-pro-bad-bank"
  },
  {
    id: 2,
    title: "High-End Harvest",
    subtitle: "Apollo DB based Shopping Cart",
    img: "/assets/demo2.png",
    className: "card-secondary",
    walkthroughLink: null,
    demoLink: "https://mit-xpro-cart.aaronberkson.io/"
  },
  {
    id: 3,
    title: "GravyTrain",
    subtitle: "Strapi DB & Stripe Ecommerce",
    img: "/assets/demo3.png",
    className: "card-tertiary",
    walkthroughLink: null,
    demoLink: "https://mit-xpro-restaurant.aaronberkson.io/"
  }
];

const DemoCards = () => {
  const { appReady } = useAppReady();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;

  return (
    <>
      {isMobile ? (
        <DemoCardsCol
          cards={mobileCards}
          viewportWidth={viewportWidth}
          appReady={appReady}
        />
      ) : (
        <DemoCardsRow
          cards={desktopCards}
          viewportWidth={viewportWidth}
          appReady={appReady}
        />
      )}
    </>
  );
};

export default DemoCards;
