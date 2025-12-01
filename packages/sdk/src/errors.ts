/**
 * Erro base da SDK Dheme
 */
export class DhemeError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = 'DhemeError';
    Object.setPrototypeOf(this, DhemeError.prototype);
  }
}

/**
 * Erro de autenticação (401)
 */
export class AuthenticationError extends DhemeError {
  constructor(message: string, response?: unknown) {
    super(message, 401, response);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Erro de validação (400)
 */
export class ValidationError extends DhemeError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string[]>,
    response?: unknown
  ) {
    super(message, 400, response);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Erro de rate limit (429)
 */
export class RateLimitError extends DhemeError {
  constructor(
    message: string,
    public readonly limit: number,
    public readonly resetAt: string,
    public readonly plan: string,
    response?: unknown
  ) {
    super(message, 429, response);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Erro de rede/timeout
 */
export class NetworkError extends DhemeError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Erro interno do servidor (500)
 */
export class ServerError extends DhemeError {
  constructor(message: string, response?: unknown) {
    super(message, 500, response);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

