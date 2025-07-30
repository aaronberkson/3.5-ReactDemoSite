// src/components/About.jsx
import React from "react";
import AboutDesktop from "./AboutDesktop";
import AboutMobile from "./AboutMobile";

export default function About() {
  const isMobile = window.innerWidth <= 768; // Simple check, use responsive hooks in real app
  return isMobile ? <AboutMobile /> : <AboutDesktop />;
}
