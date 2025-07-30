// src/components/GradientFunnelIcon.jsx
import React from "react"

export default function GradientFunnelIcon({
  width = 50,
  height = 50,
  glowColor = "#FFB347" // soft orange by default
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="linear-gradient"
          x1="0"
          y1="0"
          x2="16"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#494949" />
          <stop offset=".101" stopColor="#858585" />
          <stop offset=".148" stopColor="#a3a3a3" />
          <stop offset=".15" stopColor="#a4a4a4" />
          <stop offset=".185" stopColor="#cbcbcb" />
          <stop offset=".217" stopColor="#e7e7e7" />
          <stop offset=".246" stopColor="#f8f8f8" />
          <stop offset=".267" stopColor="#fff" />
          <stop offset=".416" stopColor="#fff" />
          <stop offset=".5" stopColor="#c9c9c9" />
          <stop offset=".584" stopColor="#a3a3a3" />
          <stop offset=".615" stopColor="#bdbdbd" />
          <stop offset=".666" stopColor="#e0e0e0" />
          <stop offset=".707" stopColor="#f6f6f6" />
          <stop offset=".733" stopColor="#fff" />
          <stop offset=".763" stopColor="#f8f8f8" />
          <stop offset=".802" stopColor="#e7e7e7" />
          <stop offset=".848" stopColor="#cbcbcb" />
          <stop offset=".852" stopColor="#c9c9c9" />
          <stop offset=".927" stopColor="#868686" />
          <stop offset="1" stopColor="#494949" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx={0}
            dy={0}
            stdDeviation={0.88}
            floodColor={glowColor}
            floodOpacity={0.8}
          />
        </filter>
      </defs>
      <path
        d="M1.5 1.5h13l-5 6.5v4.5l-3-2v-2.5l-5-6.5z"
        fill="url(#linear-gradient)"
        filter="url(#glow)"
      />
    </svg>
  )
}
