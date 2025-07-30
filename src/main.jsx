const SUPPRESS_PX_WARN = true;
if (SUPPRESS_PX_WARN) {
  const _w = console.warn, _e = console.error;
  console.warn = (...a) => {
    const t = a.join("");
    if (/Deprecation Warning|Deprecated since/i.test(t)) return;
    _w(...a);
  };
  console.error = (...a) => {
    const t = a.join("");
    if (/Unchecked runtime\.lastError/i.test(t)) return;
    _e(...a);
  };
}

// src/main.jsx
import { StrictMode } from "react";
import { createRoot }  from "react-dom/client";
import "./index.css";
import App             from "./App.jsx";

const DEBUG_MODE = false;

// ─── Suppress warnings/errors when not debugging ─────────
if (!DEBUG_MODE) {
  const origWarn  = console.warn;
  const origError = console.error;

  console.warn = (...args) => {
    // combine args into one string for broader matching
    const text = args.map(a => (typeof a === "string" ? a : "")).join(" ");
    // drop any warning with 'deprecate' or 'deprecation' (case-insensitive)
    if (/deprecate|deprecation/i.test(text)) {
      return;
    }
    origWarn(...args);
  };

  console.error = (...args) => {
    const text = args.map(a => (typeof a === "string" ? a : "")).join(" ");
    if (text.includes("Unchecked runtime.lastError")) {
      return;
    }
    origError(...args);
  };
} else {
  console.log("[IO][main] DEBUG_MODE enabled – warnings/errors are NOT suppressed.");
}

if (DEBUG_MODE) {
  console.log("[IO][main] Found root element:", document.getElementById("root"));
}

const rootElement = document.getElementById("root");
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (DEBUG_MODE) {
  console.log("[IO][main] <App /> rendered within StrictMode.");
}
