import { createContext, useContext } from 'react';

export type ThemeMode = 'cool' | 'warm';

export interface Theme {
  mode: ThemeMode;
  gradientFrom: string;
  gradientTo: string;
  accentPrimary: string;
  accentSecondary: string;
  glowColor: string;
  lockIconColor: string;
  progressBarGradient: string;
}

export const themes: Record<ThemeMode, Theme> = {
  cool: {
    mode: 'cool',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    accentPrimary: 'blue',
    accentSecondary: 'cyan',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    lockIconColor: 'text-cyan-400',
    progressBarGradient: 'from-blue-500 to-cyan-500'
  },
  warm: {
    mode: 'warm',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-rose-500',
    accentPrimary: 'orange',
    accentSecondary: 'rose',
    glowColor: 'rgba(251, 146, 60, 0.3)',
    lockIconColor: 'text-orange-400',
    progressBarGradient: 'from-orange-500 to-rose-500'
  }
};

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: themes.cool,
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);