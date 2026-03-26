import { createContext, useContext, useState, ReactNode } from 'react';
import type { AppData } from '../types';

interface CustomizeContextValue {
  customData: AppData | null;
  setCustomData: (data: AppData | null) => void;
}

const CustomizeContext = createContext<CustomizeContextValue>({
  customData: null,
  setCustomData: () => {},
});

export function CustomizeProvider({ children }: { children: ReactNode }) {
  const [customData, setCustomData] = useState<AppData | null>(null);
  return (
    <CustomizeContext.Provider value={{ customData, setCustomData }}>
      {children}
    </CustomizeContext.Provider>
  );
}

export function useCustomize() {
  return useContext(CustomizeContext);
}
