import { createContext } from 'react';
import type { ThemeActionsState } from '../types';

export const ThemeActionsContext = createContext<ThemeActionsState | null>(null);
