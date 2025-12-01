import type { GenerateThemeRequest } from '../types';
import { ValidationError } from '../errors';
import { isValidHex } from './colorConversion';

/**
 * Valida parâmetros de geração de tema
 */
export function validateGenerateThemeRequest(params: GenerateThemeRequest): void {
  const errors: Record<string, string[]> = {};

  // Validar theme (obrigatório)
  if (!params.theme) {
    errors.theme = ['Theme color is required'];
  } else if (!isValidHex(params.theme)) {
    errors.theme = ['Theme must be a valid HEX color'];
  }

  // Validar secondaryColor (opcional)
  if (params.secondaryColor && !isValidHex(params.secondaryColor)) {
    errors.secondaryColor = ['Secondary color must be a valid HEX color'];
  }

  // Validar radius
  if (params.radius !== undefined) {
    if (typeof params.radius !== 'number' || params.radius < 0 || params.radius > 2) {
      errors.radius = ['Radius must be a number between 0 and 2'];
    }
  }

  // Validar ajustes (-100 a 100)
  const adjustments = ['saturationAdjust', 'lightnessAdjust', 'contrastAdjust'] as const;

  for (const key of adjustments) {
    const value = params[key];
    if (value !== undefined) {
      if (typeof value !== 'number' || value < -100 || value > 100) {
        errors[key] = [`${key} must be a number between -100 and 100`];
      }
    }
  }

  // Validar booleans
  const booleans = ['cardIsColored', 'backgroundIsColored'] as const;

  for (const key of booleans) {
    const value = params[key];
    if (value !== undefined && typeof value !== 'boolean') {
      errors[key] = [`${key} must be a boolean`];
    }
  }

  // Se houver erros, lançar ValidationError
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid request parameters', errors);
  }
}

/**
 * Valida formato da API key
 */
export function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new ValidationError('API key is required');
  }

  // Formato: dheme_[8 chars]_[...]
  const format = /^dheme_[a-zA-Z0-9]{8}_[a-zA-Z0-9_-]+$/;

  if (!format.test(apiKey)) {
    throw new ValidationError(
      'Invalid API key format. Expected: dheme_xxxxxxxx_...'
    );
  }
}

