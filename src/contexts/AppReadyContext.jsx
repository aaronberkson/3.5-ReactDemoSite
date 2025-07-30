// src/contexts/AppReadyContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AppReadyContext = createContext({
  expAssetsLoaded:     false,
  skillsAssetsLoaded:  false,
  backgroundReady:     false,
  pagesReady:          false,
  appReady:            false,
  setExpAssetsLoaded:  () => {},
  setSkillsAssetsLoaded: () => {},
  setBackgroundReady:  () => {},
  setPagesReady:       () => {}
});

export const AppReadyProvider = ({ children }) => {
  const [expAssetsLoaded,    setExpAssetsLoaded]    = useState(false);
  const [skillsAssetsLoaded, setSkillsAssetsLoaded] = useState(false);
  const [backgroundReady,    setBackgroundReady]    = useState(false);
  const [pagesReady,         setPagesReady]         = useState(false);

  // optional: logging
  useEffect(() => console.log('[AppReady] expAssetsLoaded →', expAssetsLoaded), [expAssetsLoaded]);
  useEffect(() => console.log('[AppReady] skillsAssetsLoaded →', skillsAssetsLoaded), [skillsAssetsLoaded]);
  useEffect(() => console.log('[AppReady] backgroundReady →', backgroundReady), [backgroundReady]);
  useEffect(() => console.log('[AppReady] pagesReady →', pagesReady), [pagesReady]);

  const assetsLoaded = expAssetsLoaded && skillsAssetsLoaded;
  const appReady     = assetsLoaded && backgroundReady && pagesReady;

  useEffect(() => console.log('[AppReady] appReady →', appReady), [appReady]);

  return (
    <AppReadyContext.Provider
      value={{
        expAssetsLoaded,
        skillsAssetsLoaded,
        backgroundReady,
        pagesReady,
        appReady,
        setExpAssetsLoaded,
        setSkillsAssetsLoaded,
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
