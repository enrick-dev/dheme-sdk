import { useContext } from 'react';
import { ThemeDataContext } from '../contexts/ThemeDataContext';
import type { ThemeDataState } from '../types';

export function useTheme(): ThemeDataState {
  const context = useContext(ThemeDataContext);
  if (!context) {
    throw new Error('useTheme must be used within a <DhemeProvider>');
  }
  return context;
}
