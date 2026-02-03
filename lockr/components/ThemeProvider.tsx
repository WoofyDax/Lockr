import React, { useState, useEffect } from 'react';
import { ThemeContext, ThemeMode, themes } from '../lib/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('lockr_theme');
    return (stored === 'warm' || stored === 'cool') ? stored : 'cool';
  });

  useEffect(() => {
    localStorage.setItem('lockr_theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prev => prev === 'cool' ? 'warm' : 'cool');
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[mode], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
