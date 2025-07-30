// src/contexts/NavbarHoverContext.jsx
import React, { createContext, useState, useEffect } from "react";

// Debug flag for this file
const DEBUG_MODE = false;

// Define the default identifier for Line 2 content.
// Using a simple string (e.g. "default") instead of full JSX.
const DEFAULT_LINE2_ID = "default";

// Create the context with a default value.
export const NavbarHoverContext = createContext({
  line2Id: DEFAULT_LINE2_ID,
  setLine2Id: () => {},
});

// Create the provider component.
export const NavbarHoverProvider = ({ children }) => {
  // This state holds the current identifier for Line 2.
  const [line2Id, setLine2Id] = useState(DEFAULT_LINE2_ID);

  if (DEBUG_MODE) {
    console.log(
      "[IO][NavbarHoverContext] NavbarHoverProvider mounted. Initial line2Id:",
      DEFAULT_LINE2_ID
    );
  }

  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("[IO][NavbarHoverContext] line2Id changed:", line2Id);
    }
  }, [line2Id]);

  return (
    <NavbarHoverContext.Provider value={{ line2Id, setLine2Id }}>
      {children}
    </NavbarHoverContext.Provider>
  );
};
