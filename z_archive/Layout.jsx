import React from 'react';

const DEBUG_MODE = true;

const Layout = ({ children }) => {
  if (DEBUG_MODE) {
    console.log("[IO][Layout] Rendering Layout component");
  }
  
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {children}
    </div>
  );
};

export default Layout;
