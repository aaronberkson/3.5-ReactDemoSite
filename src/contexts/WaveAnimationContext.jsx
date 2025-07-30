// src/contexts/WaveAnimationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const WaveAnimationContext = createContext({
  isPaused: false,
  setIsPaused: () => {},
});

export const WaveAnimationProvider = ({ children }) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <WaveAnimationContext.Provider value={{ isPaused, setIsPaused }}>
      {children}
    </WaveAnimationContext.Provider>
  );
};

export const useWaveAnimation = () => useContext(WaveAnimationContext);

export default WaveAnimationContext;
