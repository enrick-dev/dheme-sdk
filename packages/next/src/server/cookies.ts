import type { ThemeMode } from '@dheme/react';

const COOKIE_MODE_KEY = 'dheme-mode';
const COOKIE_PARAMS_KEY = 'dheme-params';

export async function getModeFromCookie(): Promise<ThemeMode | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_MODE_KEY)?.value;
    if (value === 'light' || value === 'dark') return value;
    return null;
  } catch {
    return null;
  }
}

export async function getParamsFromCookie(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_PARAMS_KEY)?.value;
    if (!value) return null;
    return atob(value);
  } catch {
    return null;
  }
}
