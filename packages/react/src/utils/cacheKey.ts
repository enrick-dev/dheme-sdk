import type { GenerateThemeRequest } from '@dheme/sdk';

export function buildCacheKey(params: GenerateThemeRequest): string {
  const normalized = {
    t: params.theme.toLowerCase().replace('#', ''),
    s: (params.secondaryColor || '').toLowerCase().replace('#', ''),
    r: params.radius ?? 0.5,
    sa: params.saturationAdjust ?? 0,
    la: params.lightnessAdjust ?? 0,
    ca: params.contrastAdjust ?? 0,
    ci: params.cardIsColored ?? false,
    bi: params.backgroundIsColored ?? true,
  };
  return JSON.stringify(normalized);
}
