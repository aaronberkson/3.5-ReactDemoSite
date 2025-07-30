// src/components/GradientCircleXIcon.jsx
import React from "react";

const CLOSE_BTN_ICON_SIZE     = "32px";

const GRADIENT_START_COLOR   = "#FF7777";
const GRADIENT_END_COLOR     = "#FF0000";

const CIRCLE_STROKE_COLOR    = "#FF0000";
const CIRCLE_STROKE_WIDTH    = 3;
const CIRCLE_STROKE_OPACITY  = 0.8;

const DROP_SHADOW_OFFSET_X   = 3;
const DROP_SHADOW_OFFSET_Y   = 3;
const DROP_SHADOW_BLUR       = 5;
const DROP_SHADOW_COLOR      = "#000000";
const DROP_SHADOW_OPACITY    = 0.7;

const X_FILL_COLOR           = "#FFFFFF";

export default function GradientCircleXIcon() {
  // extra padding for stroke + blur
  const extra = CIRCLE_STROKE_WIDTH + DROP_SHADOW_BLUR;
  const size  = 512 + 2 * extra;
  const viewBox = `-${extra} -${extra} ${size} ${size}`;

  const xPath =
    "M175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 " +
    "33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 " +
    "9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={CLOSE_BTN_ICON_SIZE}
      height={CLOSE_BTN_ICON_SIZE}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={GRADIENT_START_COLOR} />
          <stop offset="100%" stopColor={GRADIENT_END_COLOR} />
        </linearGradient>

        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset in="SourceAlpha" dx={DROP_SHADOW_OFFSET_X} dy={DROP_SHADOW_OFFSET_Y} result="offset" />
          <feGaussianBlur in="offset" stdDeviation={DROP_SHADOW_BLUR} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values={`
              0 0 0 0 ${parseInt(DROP_SHADOW_COLOR.slice(1,3),16)/255}
              0 0 0 0 ${parseInt(DROP_SHADOW_COLOR.slice(3,5),16)/255}
              0 0 0 0 ${parseInt(DROP_SHADOW_COLOR.slice(5,7),16)/255}
              0 0 0 ${DROP_SHADOW_OPACITY} 0
            `}
            result="shadow"
          />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#dropShadow)">
        <circle
          cx="256"
          cy="256"
          r="256"
          fill="url(#circleGradient)"
          stroke={CIRCLE_STROKE_COLOR}
          strokeWidth={CIRCLE_STROKE_WIDTH}
          strokeOpacity={CIRCLE_STROKE_OPACITY}
          strokeLinejoin="round"
        />
        <path d={xPath} fill={X_FILL_COLOR} />
      </g>
    </svg>
  );
}
