import { useThemeActions } from './useThemeActions';
import type { DhemeClient } from '@dheme/sdk';

export function useDhemeClient(): DhemeClient {
  const { client } = useThemeActions();
  return client;
}
