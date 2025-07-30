// src/contexts/AppReadyContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AppReadyContext = createContext({
  appReady: false,
  setAssetsLoaded: () => {},
  setBackgroundReady: () => {}
});

export const AppReadyProvider = ({ children }) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);

  // The application is considered ready when both assets and the backgrounds are loaded.
  const appReady = assetsLoaded && backgroundReady;

  return (
    <AppReadyContext.Provider value={{ appReady, setAssetsLoaded, setBackgroundReady }}>
      {children}
    </AppReadyContext.Provider>
  );
};

export const useAppReady = () => useContext(AppReadyContext);

export default AppReadyContext;
