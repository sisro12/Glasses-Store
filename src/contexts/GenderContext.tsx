import React, { createContext, useContext, useState, useEffect } from 'react';

type Gender = 'men' | 'women' | null;

interface GenderContextType {
  gender: Gender;
  setGender: (gender: Gender) => void;
}

const GenderContext = createContext<GenderContextType | undefined>(undefined);

export function GenderProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGenderState] = useState<Gender>(() => {
    const saved = localStorage.getItem('selectedGender');
    return (saved === 'men' || saved === 'women') ? saved : null;
  });

  useEffect(() => {
    if (gender) {
      localStorage.setItem('selectedGender', gender);
      document.documentElement.setAttribute('data-theme', gender);
    } else {
      localStorage.removeItem('selectedGender');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [gender]);

  const setGender = (newGender: Gender) => {
    setGenderState(newGender);
  };

  return (
    <GenderContext.Provider value={{ gender, setGender }}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  const context = useContext(GenderContext);
  if (!context) throw new Error('useGender must be used within GenderProvider');
  return context;
}
