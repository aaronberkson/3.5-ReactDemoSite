// src/contexts/AppReadyContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AppReadyContext = createContext({
  assetsLoaded:    false,
  backgroundReady: false,
  pagesReady:      false,
  appReady:        false,
  setAssetsLoaded: () => {},
  setBackgroundReady: () => {},
  setPagesReady:   () => {}
});

export const AppReadyProvider = ({ children }) => {
  const [assetsLoaded,    setAssetsLoaded]    = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [pagesReady,      setPagesReady]      = useState(false);

  // Only once EVERYTHING is ready do we un‐mount the preloader
  const appReady = assetsLoaded && backgroundReady && pagesReady;

  return (
    <AppReadyContext.Provider
      value={{
        assetsLoaded,
        backgroundReady,
        pagesReady,
        appReady,
        setAssetsLoaded,
        setBackgroundReady,
        setPagesReady
      }}
    >
      {children}
    </AppReadyContext.Provider>
  );
};

export const useAppReady = () => useContext(AppReadyContext);
export default AppReadyContext;
