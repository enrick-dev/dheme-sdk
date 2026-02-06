import { useContext } from 'react';
import { ThemeActionsContext } from '../contexts/ThemeActionsContext';
import type { ThemeActionsState } from '../types';

export function useThemeActions(): ThemeActionsState {
  const context = useContext(ThemeActionsContext);
  if (!context) {
    throw new Error('useThemeActions must be used within a <DhemeProvider>');
  }
  return context;
}
