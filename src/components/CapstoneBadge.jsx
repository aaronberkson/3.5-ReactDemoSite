import React, { useState, useEffect } from 'react';
import './CapstoneBadge.css';
import gradCap from '../assets/grad-cap.svg';
import goldRibbon from '../assets/gold-ribbon.png';

const CapstoneBadge = () => {
  // Local state to hold the blue background size and corner radius,
  // read from CSS custom properties.
  const [blueBgSize, setBlueBgSize] = useState(60);
  const [blueBgCornerRadius, setBlueBgCornerRadius] = useState(8);

  useEffect(() => {
    // Read CSS custom properties from the root element.
    const rootStyles = getComputedStyle(document.documentElement);

    const sizeStr = rootStyles.getPropertyValue('--blue-bg-size').trim();
    const radiusStr = rootStyles.getPropertyValue('--blue-bg-corner-radius').trim();

    // Parse out the numeric values (assumes "px" units).
    if (sizeStr.endsWith('px')) {
      setBlueBgSize(parseFloat(sizeStr));
    }
    if (radiusStr.endsWith('px')) {
      setBlueBgCornerRadius(parseFloat(radiusStr));
    }
  }, []);

  // Build the SVG path data for the blue triangle background.
  // It does the following:
  // 1. Move to (0,0)
  // 2. Draw a line to (blueBgSize, blueBgSize)
  // 3. Draw a vertical line upward to (blueBgSize, blueBgCornerRadius)
  // 4. Draw a rounded arc from right edge to the top such that the arc has a fixed radius.
  // 5. Draw a line back to (0,0) and close the path.
  const pathData = `M0,0 L${blueBgSize},${blueBgSize} L${blueBgSize},${blueBgCornerRadius} A${blueBgCornerRadius} ${blueBgCornerRadius} 0 0 0 ${blueBgSize - blueBgCornerRadius},0 L0,0 Z`;

  return (
    <div className="capstone-badge">
      {/* Blue Triangle Background & Grad Cap */}
      <div className="cap-container">
        <svg
          className="cap-svg"
          width={blueBgSize}
          height={blueBgSize}
          viewBox={`0 0 ${blueBgSize} ${blueBgSize}`}
        >
          <defs>
            <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e90ff" />
              <stop offset="100%" stopColor="#00bfff" />
            </linearGradient>
          </defs>
          <path d={pathData} fill="url(#capGrad)" />
        </svg>
        <img
          src={gradCap}
          alt="Graduate Cap"
          className="graduate-cap"
        />
      </div>

      {/* Ribbon with Text */}
      <div className="ribbon-container">
        <img
          src={goldRibbon}
          alt="Gold Ribbon"
          className="ribbon-img"
        />
        <div className="ribbon-text-overlay">
          <span className="ribbon-text">
            <span className="mit-text">MIT</span>{" "}
            <span className="capstone-text">Capstone</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CapstoneBadge;
