import { createContext, useContext, useState, type ReactNode } from 'react';

export type SectionId = 'all' | 'robins' | 'bantams-ladies' | 'bantams-youth';

export interface SectionOption {
  id: SectionId;
  label: string;
  shortLabel: string;
}

export const SECTION_OPTIONS: SectionOption[] = [
  { id: 'all',           label: 'All Teams',    shortLabel: 'All' },
  { id: 'robins',        label: 'Robins',       shortLabel: 'Robins' },
  { id: 'bantams-ladies',label: 'Ladies',       shortLabel: 'Ladies' },
  { id: 'bantams-youth', label: 'Youth',        shortLabel: 'Youth' },
];

interface SectionContextValue {
  activeSection: SectionId;
  setActiveSection: (s: SectionId) => void;
}

const SectionContext = createContext<SectionContextValue>({
  activeSection: 'all',
  setActiveSection: () => {},
});

export function SectionProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSectionState] = useState<SectionId>(() => {
    const stored = localStorage.getItem('activeSection') as SectionId | null;
    const valid: SectionId[] = ['all', 'robins', 'bantams-ladies', 'bantams-youth'];
    return stored && valid.includes(stored) ? stored : 'all';
  });

  function setActiveSection(s: SectionId) {
    setActiveSectionState(s);
    localStorage.setItem('activeSection', s);
  }

  return (
    <SectionContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  return useContext(SectionContext);
}
