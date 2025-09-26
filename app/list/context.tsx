import React, { createContext, useContext } from 'react';
import { ScreenContextType } from '@/types';

const ScreenContext = createContext<ScreenContextType | null>(null);

export const useScreenContext = () => {
  const context = useContext(ScreenContext);
  if (!context) {
    throw new Error('useScreenContext must be used within ScreensLayout');
  }
  return context;
};

export const ScreenProvider: React.FC<{
  children: React.ReactNode;
  value: ScreenContextType;
}> = ({ children, value }) => {
  return <ScreenContext.Provider value={value}>{children}</ScreenContext.Provider>;
};
