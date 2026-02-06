import { createContext } from 'react';
import type { ThemeDataState } from '../types';

export const ThemeDataContext = createContext<ThemeDataState | null>(null);
