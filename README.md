# Dheme SDK - Documentação Completa para Implementação

> **Este documento é a fonte única de verdade para implementar a SDK Dheme**. Ele contém toda a informação necessária para que uma IA possa construir a SDK completa do zero.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [API Reference Completa](#api-reference-completa)
4. [Implementação da SDK Base (@dheme/sdk)](#implementação-da-sdk-base-dhemesdk)
5. [Implementação da React Library (@dheme/react)](#implementação-da-react-library-dhemereact)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Testes](#testes)
8. [Build e Publicação](#build-e-publicação)

---

## Visão Geral

A SDK Dheme consiste em **dois pacotes npm** organizados em um monorepo:

1. **@dheme/sdk** - SDK base TypeScript pura, agnóstica de framework
   - Compatível com: Browser, Node.js, Edge Runtime, React Native
   - Features: HTTP client, retry, interceptors, error handling, rate limiting, color conversion

2. **@dheme/react** - Bindings React que dependem da SDK base
   - Features: ThemeProvider, hooks customizados, CSS variables, localStorage, SSR-safe

### Tecnologias

- **TypeScript 5.0+** - Type safety
- **tsup** - Build tool (gera CJS + ESM + types)
- **Vitest** - Testing
- **npm workspaces** - Monorepo
- **Fetch API** - HTTP (nativo no Browser/Node 18+)

---

## Estrutura do Projeto

```
sdk/
├── README.md                          # Este arquivo
├── .gitignore
├── package.json                       # Root (workspaces)
├── tsconfig.json                      # Base config
├── .eslintrc.json
├── .prettierrc
└── packages/
    ├── sdk/                           # @dheme/sdk
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── README.md
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── client.ts
    │   │   ├── types.ts
    │   │   ├── errors.ts
    │   │   ├── constants.ts
    │   │   ├── middleware/
    │   │   │   ├── retry.ts
    │   │   │   └── interceptors.ts
    │   │   └── utils/
    │   │       ├── request.ts
    │   │       ├── validators.ts
    │   │       └── colorConversion.ts
    │   └── examples/
    │       ├── basic.ts
    │       ├── nodejs.ts
    │       └── edge.ts
    └── react/                         # @dheme/react
        ├── package.json
        ├── tsconfig.json
        ├── README.md
        ├── src/
        │   ├── index.ts
        │   ├── ThemeProvider.tsx
        │   ├── ThemeContext.tsx
        │   ├── hooks/
        │   │   ├── useGenerateTheme.ts
        │   │   └── useTheme.ts
        │   └── utils/
        │       ├── cssVariables.ts
        │       └── localStorage.ts
        └── examples/
            ├── basic.tsx
            └── nextjs.tsx
```

---

## API Reference Completa

### Base URL

```
Production: https://theme.dheme.com (substituir pela URL real)
```

### Autenticação

Todas as requisições públicas requerem API key no header:

```http
x-api-key: dheme_xxxxxxxx_[resto-da-chave]
```

**Formato da API Key:**
- Prefixo: `dheme_`
- 8 caracteres alfanuméricos (identificador)
- Underscore `_`
- Resto da chave em base64url

**Exemplo:** `dheme_abc12345_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789`

### Rate Limiting

Todos os endpoints retornam headers de rate limit:

```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
X-RateLimit-Reset: 2025-01-01T00:00:00.000Z
```

Quando o limite é excedido, retorna **429 Too Many Requests**.

### Endpoints

#### 1. POST /api/generate-theme

Gera um tema completo com todos os tokens de cor (light e dark mode).

**Request Headers:**
```http
Content-Type: application/json
x-api-key: dheme_xxxxxxxx_...
```

**Request Body:**
```typescript
{
  "theme": "#3b82f6",              // Cor primária (HEX obrigatório)
  "secondaryColor": "#10b981",     // Cor secundária (HEX opcional)
  "radius": 0.5,                   // Border radius em rem (0-2, default: 0.5)
  "saturationAdjust": 0,           // Ajuste saturação -100 a 100 (default: 0)
  "lightnessAdjust": 0,            // Ajuste luminosidade -100 a 100 (default: 0)
  "contrastAdjust": 0,             // Ajuste contraste -100 a 100 (default: 0)
  "cardIsColored": false,          // Cards com cor (default: false)
  "backgroundIsColored": true      // Background com cor (default: true)
}
```

**Response 200 OK:**
```typescript
{
  "theme": "#3b82f6",
  "secondaryColor": "#10b981",
  "radius": 0.5,
  "saturationAdjust": 0,
  "lightnessAdjust": 0,
  "contrastAdjust": 0,
  "cardIsColored": false,
  "backgroundIsColored": true,
  "colors": {
    "light": {
      "background": { "h": 0, "s": 0, "l": 100 },
      "foreground": { "h": 222.2, "s": 84, "l": 4.9 },
      "card": { "h": 0, "s": 0, "l": 100 },
      "cardForeground": { "h": 222.2, "s": 84, "l": 4.9 },
      "popover": { "h": 0, "s": 0, "l": 100 },
      "popoverForeground": { "h": 222.2, "s": 84, "l": 4.9 },
      "primary": { "h": 221.2, "s": 83.2, "l": 53.3 },
      "primaryForeground": { "h": 210, "s": 40, "l": 98 },
      "secondary": { "h": 210, "s": 40, "l": 96.1 },
      "secondaryForeground": { "h": 222.2, "s": 47.4, "l": 11.2 },
      "muted": { "h": 210, "s": 40, "l": 96.1 },
      "mutedForeground": { "h": 215.4, "s": 16.3, "l": 46.9 },
      "accent": { "h": 210, "s": 40, "l": 96.1 },
      "accentForeground": { "h": 222.2, "s": 47.4, "l": 11.2 },
      "destructive": { "h": 0, "s": 84.2, "l": 60.2 },
      "destructiveForeground": { "h": 210, "s": 40, "l": 98 },
      "border": { "h": 214.3, "s": 31.8, "l": 91.4 },
      "input": { "h": 214.3, "s": 31.8, "l": 91.4 },
      "ring": { "h": 221.2, "s": 83.2, "l": 53.3 }
    },
    "dark": {
      "background": { "h": 222.2, "s": 84, "l": 4.9 },
      "foreground": { "h": 210, "s": 40, "l": 98 },
      // ... similar structure
    }
  },
  "backgrounds": {
    "primary": {
      "light": "#ffffff",
      "dark": "#0a0a0a"
    },
    "secondary": {
      "light": "#f5f5f5",
      "dark": "#1a1a1a"
    }
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Invalid theme color"
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Missing API key. Provide it in the x-api-key header."
}
```

**Response 429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded. Upgrade your plan or wait until the next billing cycle.",
  "limit": 10000,
  "resetAt": "2025-01-01T00:00:00.000Z",
  "plan": "basic"
}
```

---

#### 2. POST /api/generate-theme/shadcn

Retorna CSS pronto para uso com variáveis CSS do Shadcn/ui.

**Request:** Idêntico ao endpoint `/api/generate-theme`

**Response 200 OK:**
```css
Content-Type: text/css

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

---

#### 3. POST /api/generate-theme/tokens

Retorna tokens com múltiplos formatos de cor (HSL, RGB, HEX).

**Request:** Idêntico ao endpoint `/api/generate-theme`

**Response 200 OK:**
```typescript
{
  "light": {
    "background": {
      "hsl": { "h": 0, "s": 0, "l": 100 },
      "rgb": [255, 255, 255],
      "hex": "#ffffff"
    },
    "foreground": {
      "hsl": { "h": 222.2, "s": 84, "l": 4.9 },
      "rgb": [2, 8, 23],
      "hex": "#020817"
    },
    "primary": {
      "hsl": { "h": 221.2, "s": 83.2, "l": 53.3 },
      "rgb": [59, 130, 246],
      "hex": "#3b82f6"
    }
    // ... todos os tokens
  },
  "dark": {
    "background": {
      "hsl": { "h": 222.2, "s": 84, "l": 4.9 },
      "rgb": [2, 8, 23],
      "hex": "#020817"
    }
    // ... todos os tokens
  },
  "radius": 0.5,
  "backgrounds": {
    "primary": { "light": "#ffffff", "dark": "#0a0a0a" },
    "secondary": { "light": "#f5f5f5", "dark": "#1a1a1a" }
  }
}
```

---

#### 4. GET /api/usage

Retorna estatísticas de uso da API key.

**Request Headers:**
```http
x-api-key: dheme_xxxxxxxx_...
```

**Response 200 OK:**
```json
{
  "usage": 847,
  "limit": 10000,
  "remaining": 9153,
  "percentage": 8.47,
  "resetAt": "2025-01-01T00:00:00.000Z",
  "plan": "basic"
}
```

---

## Implementação da SDK Base (@dheme/sdk)

### 1. Configuração Inicial

#### Root package.json (workspaces)

Criar arquivo `/package.json`:

```json
{
  "name": "dheme-sdk-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "dev": "npm run dev --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "typecheck": "npm run typecheck --workspaces"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "prettier": "^3.2.0"
  }
}
```

#### Root tsconfig.json

Criar arquivo `/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### .gitignore

Criar arquivo `/.gitignore`:

```
node_modules/
dist/
*.tsbuildinfo
.DS_Store
*.log
coverage/
.env
.env.local
```

#### .prettierrc

Criar arquivo `/.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

---

### 2. SDK Base - package.json

Criar arquivo `/packages/sdk/package.json`:

```json
{
  "name": "@dheme/sdk",
  "version": "1.0.0",
  "description": "TypeScript SDK for Dheme Theme Generator API",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "dheme",
    "theme",
    "generator",
    "shadcn",
    "tailwind",
    "sdk",
    "typescript",
    "api-client"
  ],
  "author": "Dheme Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dheme/sdk"
  },
  "homepage": "https://dheme.com",
  "bugs": {
    "url": "https://github.com/dheme/sdk/issues"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.1",
    "typescript": "^5.3.0",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### 3. SDK Base - tsconfig.json

Criar arquivo `/packages/sdk/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

### 4. SDK Base - src/types.ts

Criar arquivo `/packages/sdk/src/types.ts`:

```typescript
/**
 * Configuração do cliente Dheme SDK
 */
export interface DhemeClientConfig {
  /** API key (obrigatório) */
  apiKey: string;
  /** Base URL da API (opcional, default: production URL) */
  baseUrl?: string;
  /** Timeout em milissegundos (opcional, default: 30000) */
  timeout?: number;
  /** Configuração de retry (opcional) */
  retryConfig?: RetryConfig;
  /** Debug mode (opcional, default: false) */
  debug?: boolean;
  /** Interceptors de request/response (opcional) */
  interceptors?: Interceptors;
}

/**
 * Configuração de retry com backoff exponencial
 */
export interface RetryConfig {
  /** Máximo de tentativas (default: 3) */
  maxRetries: number;
  /** Delay inicial em ms (default: 1000) */
  initialDelay: number;
  /** Delay máximo em ms (default: 10000) */
  maxDelay: number;
  /** Multiplicador do backoff (default: 2) */
  backoffMultiplier: number;
  /** Status codes que permitem retry (default: [408, 429, 500, 502, 503, 504]) */
  retryableStatusCodes: number[];
}

/**
 * Sistema de interceptors
 */
export interface Interceptors {
  /** Interceptors de request */
  request?: RequestInterceptor[];
  /** Interceptors de response */
  response?: ResponseInterceptor[];
}

export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = (
  response: Response
) => Response | Promise<Response>;

/**
 * Configuração interna de request
 */
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Parâmetros para gerar tema
 */
export interface GenerateThemeRequest {
  /** Cor primária em HEX (obrigatório) */
  theme: string;
  /** Cor secundária em HEX (opcional) */
  secondaryColor?: string;
  /** Border radius em rem, 0-2 (opcional, default: 0.5) */
  radius?: number;
  /** Ajuste de saturação, -100 a 100 (opcional, default: 0) */
  saturationAdjust?: number;
  /** Ajuste de luminosidade, -100 a 100 (opcional, default: 0) */
  lightnessAdjust?: number;
  /** Ajuste de contraste, -100 a 100 (opcional, default: 0) */
  contrastAdjust?: number;
  /** Cards com cor (opcional, default: false) */
  cardIsColored?: boolean;
  /** Background com cor (opcional, default: true) */
  backgroundIsColored?: boolean;
}

/**
 * Cor em formato HSL
 */
export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * Cor em formato RGB
 */
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Tokens de cor do Shadcn
 */
export interface ColorTokens {
  background: HSLColor;
  foreground: HSLColor;
  card: HSLColor;
  cardForeground: HSLColor;
  popover: HSLColor;
  popoverForeground: HSLColor;
  primary: HSLColor;
  primaryForeground: HSLColor;
  secondary: HSLColor;
  secondaryForeground: HSLColor;
  muted: HSLColor;
  mutedForeground: HSLColor;
  accent: HSLColor;
  accentForeground: HSLColor;
  destructive: HSLColor;
  destructiveForeground: HSLColor;
  border: HSLColor;
  input: HSLColor;
  ring: HSLColor;
}

/**
 * Response completo do tema gerado
 */
export interface GenerateThemeResponse {
  theme: string;
  secondaryColor: string;
  radius: number;
  saturationAdjust: number;
  lightnessAdjust: number;
  contrastAdjust: number;
  cardIsColored: boolean;
  backgroundIsColored: boolean;
  colors: {
    light: ColorTokens;
    dark: ColorTokens;
  };
  backgrounds: {
    primary: {
      light: string;
      dark: string;
    };
    secondary: {
      light: string;
      dark: string;
    } | null;
  };
}

/**
 * Cor em múltiplos formatos
 */
export interface ColorFormats {
  hsl: HSLColor;
  rgb: [number, number, number];
  hex: string;
}

/**
 * Response de tokens com múltiplos formatos
 */
export interface TokensResponse {
  light: Record<string, ColorFormats>;
  dark: Record<string, ColorFormats>;
  radius: number;
  backgrounds: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string } | null;
  } | null;
}

/**
 * Response de estatísticas de uso
 */
export interface UsageResponse {
  usage: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetAt: string;
  plan: string;
}

/**
 * Headers de rate limit
 */
export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: string;
}

/**
 * Response com informação de rate limit
 */
export interface ResponseWithRateLimit<T> {
  data: T;
  rateLimit: RateLimitHeaders;
}
```

---

### 5. SDK Base - src/errors.ts

Criar arquivo `/packages/sdk/src/errors.ts`:

```typescript
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
```

---

### 6. SDK Base - src/constants.ts

Criar arquivo `/packages/sdk/src/constants.ts`:

```typescript
import type { RetryConfig } from './types';

/**
 * URL base da API (produção)
 * TODO: Substituir pela URL real quando disponível
 */
export const DEFAULT_BASE_URL = 'https://theme.dheme.com';

/**
 * Timeout padrão (30 segundos)
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Configuração de retry padrão
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Headers padrão
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'dheme-sdk/1.0.0',
};
```

---

### 7. SDK Base - src/utils/colorConversion.ts

Criar arquivo `/packages/sdk/src/utils/colorConversion.ts`:

```typescript
import type { HSLColor, RGBColor } from '../types';

/**
 * Converte HEX para HSL
 */
export function hexToHSL(hex: string): HSLColor {
  // Remove # se presente
  hex = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360 * 10) / 10,
    s: Math.round(s * 100 * 10) / 10,
    l: Math.round(l * 100 * 10) / 10,
  };
}

/**
 * Converte HSL para RGB
 */
export function hslToRGB(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converte RGB para HEX
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Converte HSL para HEX
 */
export function hslToHex(hsl: HSLColor): string {
  return rgbToHex(hslToRGB(hsl));
}

/**
 * Converte HEX para RGB
 */
export function hexToRGB(hex: string): RGBColor {
  hex = hex.replace('#', '');

  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

/**
 * Converte RGB para HSL
 */
export function rgbToHSL(rgb: RGBColor): HSLColor {
  return hexToHSL(rgbToHex(rgb));
}

/**
 * Formata HSL para string CSS (ex: "221.2 83.2% 53.3%")
 */
export function formatHSLString(hsl: HSLColor): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

/**
 * Valida se string é HEX válido
 */
export function isValidHex(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex);
}
```

---

### 8. SDK Base - src/utils/validators.ts

Criar arquivo `/packages/sdk/src/utils/validators.ts`:

```typescript
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
```

---

### 9. SDK Base - src/utils/request.ts

Criar arquivo `/packages/sdk/src/utils/request.ts`:

```typescript
import { NetworkError } from '../errors';
import type { RequestConfig, RateLimitHeaders } from '../types';

/**
 * Detecta se está rodando em Node.js
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * Faz HTTP request universal (Browser/Node.js/Edge)
 */
export async function makeRequest(config: RequestConfig): Promise<Response> {
  const { method, url, headers, body, timeout = 30000 } = config;

  // Controller para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${timeout}ms`, error);
      }
      throw new NetworkError(`Network request failed: ${error.message}`, error);
    }

    throw new NetworkError('Network request failed with unknown error');
  }
}

/**
 * Parse rate limit headers do response
 */
export function parseRateLimitHeaders(headers: Headers): RateLimitHeaders | null {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset,
  };
}
```

---

### 10. SDK Base - src/middleware/retry.ts

Criar arquivo `/packages/sdk/src/middleware/retry.ts`:

```typescript
import type { RetryConfig } from '../types';
import { DEFAULT_RETRY_CONFIG } from '../constants';

/**
 * Executa função com retry e backoff exponencial
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
    retryableStatusCodes,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Verificar se deve fazer retry
      const shouldRetry =
        attempt < maxRetries &&
        error instanceof Error &&
        'statusCode' in error &&
        typeof error.statusCode === 'number' &&
        retryableStatusCodes.includes(error.statusCode);

      if (!shouldRetry) {
        throw error;
      }

      // Aguardar antes de tentar novamente
      await sleep(delay);

      // Aumentar delay com backoff exponencial
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

### 11. SDK Base - src/middleware/interceptors.ts

Criar arquivo `/packages/sdk/src/middleware/interceptors.ts`:

```typescript
import type { RequestInterceptor, ResponseInterceptor, RequestConfig } from '../types';

/**
 * Aplica interceptors de request
 */
export async function applyRequestInterceptors(
  config: RequestConfig,
  interceptors?: RequestInterceptor[]
): Promise<RequestConfig> {
  if (!interceptors || interceptors.length === 0) {
    return config;
  }

  let currentConfig = config;

  for (const interceptor of interceptors) {
    currentConfig = await interceptor(currentConfig);
  }

  return currentConfig;
}

/**
 * Aplica interceptors de response
 */
export async function applyResponseInterceptors(
  response: Response,
  interceptors?: ResponseInterceptor[]
): Promise<Response> {
  if (!interceptors || interceptors.length === 0) {
    return response;
  }

  let currentResponse = response;

  for (const interceptor of interceptors) {
    currentResponse = await interceptor(currentResponse);
  }

  return currentResponse;
}

/**
 * Interceptor de logging (exemplo)
 */
export const loggingInterceptor: RequestInterceptor = (config) => {
  console.log('[Dheme SDK Request]', config.method, config.url);
  return config;
};

/**
 * Interceptor de custom headers (exemplo)
 */
export function customHeadersInterceptor(
  headers: Record<string, string>
): RequestInterceptor {
  return (config) => ({
    ...config,
    headers: { ...config.headers, ...headers },
  });
}

/**
 * Interceptor de response logging (exemplo)
 */
export const responseLoggingInterceptor: ResponseInterceptor = (response) => {
  console.log('[Dheme SDK Response]', response.status, response.statusText);
  return response;
};
```

---

### 12. SDK Base - src/client.ts

Criar arquivo `/packages/sdk/src/client.ts`:

```typescript
import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_HEADERS,
  DEFAULT_RETRY_CONFIG,
} from './constants';
import {
  AuthenticationError,
  ValidationError,
  RateLimitError,
  ServerError,
  DhemeError,
} from './errors';
import type {
  DhemeClientConfig,
  GenerateThemeRequest,
  GenerateThemeResponse,
  TokensResponse,
  UsageResponse,
  ResponseWithRateLimit,
  RequestConfig,
  RateLimitHeaders,
} from './types';
import { validateApiKey, validateGenerateThemeRequest } from './utils/validators';
import { makeRequest, parseRateLimitHeaders } from './utils/request';
import { withRetry } from './middleware/retry';
import {
  applyRequestInterceptors,
  applyResponseInterceptors,
} from './middleware/interceptors';

/**
 * Cliente principal da SDK Dheme
 */
export class DhemeClient {
  private readonly config: Required<Omit<DhemeClientConfig, 'interceptors'>> & {
    interceptors?: DhemeClientConfig['interceptors'];
  };

  constructor(config: DhemeClientConfig) {
    // Validar API key
    validateApiKey(config.apiKey);

    // Configuração com defaults
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      retryConfig: { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig },
      debug: config.debug || false,
      interceptors: config.interceptors,
    };

    if (this.config.debug) {
      console.log('[DhemeClient] Initialized with config:', {
        baseUrl: this.config.baseUrl,
        timeout: this.config.timeout,
        retryConfig: this.config.retryConfig,
      });
    }
  }

  /**
   * Gera tema completo (JSON)
   */
  async generateTheme(
    params: GenerateThemeRequest
  ): Promise<ResponseWithRateLimit<GenerateThemeResponse>> {
    validateGenerateThemeRequest(params);

    return this.makeApiRequest<GenerateThemeResponse>(
      'POST',
      '/api/generate-theme',
      params
    );
  }

  /**
   * Gera CSS do Shadcn
   */
  async generateShadcnCSS(params: GenerateThemeRequest): Promise<string> {
    validateGenerateThemeRequest(params);

    const response = await this.makeRawRequest(
      'POST',
      '/api/generate-theme/shadcn',
      params
    );

    return response.text();
  }

  /**
   * Gera tokens com múltiplos formatos
   */
  async generateTokens(
    params: GenerateThemeRequest
  ): Promise<ResponseWithRateLimit<TokensResponse>> {
    validateGenerateThemeRequest(params);

    return this.makeApiRequest<TokensResponse>(
      'POST',
      '/api/generate-theme/tokens',
      params
    );
  }

  /**
   * Obtém estatísticas de uso
   */
  async getUsage(): Promise<ResponseWithRateLimit<UsageResponse>> {
    return this.makeApiRequest<UsageResponse>('GET', '/api/usage');
  }

  /**
   * Faz request HTTP com retry e error handling
   */
  private async makeApiRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: unknown
  ): Promise<ResponseWithRateLimit<T>> {
    return withRetry(
      async () => {
        const response = await this.makeRawRequest(method, endpoint, body);

        // Parse JSON
        const data = await response.json();

        // Parse rate limit headers
        const rateLimit = parseRateLimitHeaders(response.headers);

        return {
          data: data as T,
          rateLimit: rateLimit || {
            limit: 0,
            remaining: 0,
            reset: new Date().toISOString(),
          },
        };
      },
      this.config.retryConfig
    );
  }

  /**
   * Faz request HTTP raw
   */
  private async makeRawRequest(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: unknown
  ): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;

    // Configuração do request
    let requestConfig: RequestConfig = {
      method,
      url,
      headers: {
        ...DEFAULT_HEADERS,
        'x-api-key': this.config.apiKey,
      },
      body,
      timeout: this.config.timeout,
    };

    // Aplicar interceptors de request
    requestConfig = await applyRequestInterceptors(
      requestConfig,
      this.config.interceptors?.request
    );

    if (this.config.debug) {
      console.log('[DhemeClient] Request:', requestConfig);
    }

    // Fazer request
    let response = await makeRequest(requestConfig);

    // Aplicar interceptors de response
    response = await applyResponseInterceptors(
      response,
      this.config.interceptors?.response
    );

    // Handle errors
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response;
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;

    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }

    const message = errorData.error || 'Unknown error';

    switch (response.status) {
      case 400:
        throw new ValidationError(message, undefined, errorData);

      case 401:
        throw new AuthenticationError(message, errorData);

      case 429:
        throw new RateLimitError(
          message,
          errorData.limit || 0,
          errorData.resetAt || new Date().toISOString(),
          errorData.plan || 'unknown',
          errorData
        );

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(message, errorData);

      default:
        throw new DhemeError(message, response.status, errorData);
    }
  }
}
```

---

### 13. SDK Base - src/index.ts

Criar arquivo `/packages/sdk/src/index.ts`:

```typescript
// Cliente
export { DhemeClient } from './client';

// Tipos
export type {
  DhemeClientConfig,
  GenerateThemeRequest,
  GenerateThemeResponse,
  TokensResponse,
  UsageResponse,
  ColorTokens,
  HSLColor,
  RGBColor,
  ColorFormats,
  ResponseWithRateLimit,
  RateLimitHeaders,
  RetryConfig,
  Interceptors,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';

// Erros
export {
  DhemeError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ServerError,
} from './errors';

// Utilitários de conversão de cor (exportados para uso público)
export {
  hexToHSL,
  hslToRGB,
  rgbToHex,
  hslToHex,
  hexToRGB,
  rgbToHSL,
  formatHSLString,
  isValidHex,
} from './utils/colorConversion';

// Interceptors úteis
export {
  loggingInterceptor,
  customHeadersInterceptor,
  responseLoggingInterceptor,
} from './middleware/interceptors';
```

---

## Implementação da React Library (@dheme/react)

### 1. React - package.json

Criar arquivo `/packages/react/package.json`:

```json
{
  "name": "@dheme/react",
  "version": "1.0.0",
  "description": "React bindings for Dheme SDK",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean --external react --external react-dom",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch --external react --external react-dom",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "dheme",
    "theme",
    "react",
    "hooks",
    "shadcn",
    "tailwind"
  ],
  "author": "Dheme Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dheme/sdk"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "@dheme/sdk": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/react-hooks": "^8.0.1",
    "tsup": "^8.0.1",
    "typescript": "^5.3.0",
    "vitest": "^1.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---

### 2. React - src/ThemeContext.tsx

Criar arquivo `/packages/react/src/ThemeContext.tsx`:

```typescript
import { createContext } from 'react';
import type {
  GenerateThemeResponse,
  DhemeClient,
  GenerateThemeRequest,
} from '@dheme/sdk';

export interface ThemeContextValue {
  client: DhemeClient;
  theme: GenerateThemeResponse | null;
  isLoading: boolean;
  error: Error | null;
  generateTheme: (params: GenerateThemeRequest) => Promise<void>;
  clearTheme: () => void;
  applyTheme: (mode: 'light' | 'dark') => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
```

---

### 3. React - src/utils/cssVariables.ts

Criar arquivo `/packages/react/src/utils/cssVariables.ts`:

```typescript
import type { GenerateThemeResponse } from '@dheme/sdk';
import { formatHSLString } from '@dheme/sdk';

/**
 * Aplica CSS variables do tema no document root
 */
export function applyThemeCSSVariables(
  theme: GenerateThemeResponse,
  mode: 'light' | 'dark'
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const colors = theme.colors[mode];

  // Aplicar variáveis CSS
  root.style.setProperty('--background', formatHSLString(colors.background));
  root.style.setProperty('--foreground', formatHSLString(colors.foreground));
  root.style.setProperty('--card', formatHSLString(colors.card));
  root.style.setProperty('--card-foreground', formatHSLString(colors.cardForeground));
  root.style.setProperty('--popover', formatHSLString(colors.popover));
  root.style.setProperty(
    '--popover-foreground',
    formatHSLString(colors.popoverForeground)
  );
  root.style.setProperty('--primary', formatHSLString(colors.primary));
  root.style.setProperty(
    '--primary-foreground',
    formatHSLString(colors.primaryForeground)
  );
  root.style.setProperty('--secondary', formatHSLString(colors.secondary));
  root.style.setProperty(
    '--secondary-foreground',
    formatHSLString(colors.secondaryForeground)
  );
  root.style.setProperty('--muted', formatHSLString(colors.muted));
  root.style.setProperty('--muted-foreground', formatHSLString(colors.mutedForeground));
  root.style.setProperty('--accent', formatHSLString(colors.accent));
  root.style.setProperty('--accent-foreground', formatHSLString(colors.accentForeground));
  root.style.setProperty('--destructive', formatHSLString(colors.destructive));
  root.style.setProperty(
    '--destructive-foreground',
    formatHSLString(colors.destructiveForeground)
  );
  root.style.setProperty('--border', formatHSLString(colors.border));
  root.style.setProperty('--input', formatHSLString(colors.input));
  root.style.setProperty('--ring', formatHSLString(colors.ring));
  root.style.setProperty('--radius', `${theme.radius}rem`);

  // Backgrounds (se disponíveis)
  if (theme.backgrounds?.primary) {
    root.style.setProperty('--background-primary', theme.backgrounds.primary[mode]);
  }
  if (theme.backgrounds?.secondary) {
    root.style.setProperty('--background-secondary', theme.backgrounds.secondary[mode]);
  }
}

/**
 * Remove CSS variables do tema
 */
export function removeThemeCSSVariables(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const variables = [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
    '--radius',
    '--background-primary',
    '--background-secondary',
  ];

  variables.forEach((v) => root.style.removeProperty(v));
}
```

---

### 4. React - src/utils/localStorage.ts

Criar arquivo `/packages/react/src/utils/localStorage.ts`:

```typescript
import type { GenerateThemeResponse } from '@dheme/sdk';

const STORAGE_KEY = 'dheme-theme';

/**
 * Salva tema no localStorage
 */
export function saveThemeToStorage(theme: GenerateThemeResponse): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.warn('[Dheme] Failed to save theme to localStorage:', error);
  }
}

/**
 * Carrega tema do localStorage
 */
export function loadThemeFromStorage(): GenerateThemeResponse | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('[Dheme] Failed to load theme from localStorage:', error);
  }

  return null;
}

/**
 * Remove tema do localStorage
 */
export function removeThemeFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[Dheme] Failed to remove theme from localStorage:', error);
  }
}
```

---

### 5. React - src/ThemeProvider.tsx

Criar arquivo `/packages/react/src/ThemeProvider.tsx`:

```typescript
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DhemeClient,
  type GenerateThemeRequest,
  type GenerateThemeResponse,
} from '@dheme/sdk';
import { ThemeContext } from './ThemeContext';
import { applyThemeCSSVariables } from './utils/cssVariables';
import { loadThemeFromStorage, saveThemeToStorage } from './utils/localStorage';

export interface ThemeProviderProps {
  /** API key (obrigatório) */
  apiKey: string;
  /** Base URL da API (opcional) */
  baseUrl?: string;
  /** Children components */
  children: React.ReactNode;
  /** Persistir tema no localStorage (default: true) */
  persistTheme?: boolean;
  /** Aplicar CSS variables automaticamente (default: true) */
  autoApply?: boolean;
  /** Modo inicial light/dark (default: 'light') */
  mode?: 'light' | 'dark';
  /** Callback quando tema mudar (opcional) */
  onThemeChange?: (theme: GenerateThemeResponse | null) => void;
}

export function ThemeProvider({
  apiKey,
  baseUrl,
  children,
  persistTheme = true,
  autoApply = true,
  mode = 'light',
  onThemeChange,
}: ThemeProviderProps) {
  // Cliente SDK
  const client = useMemo(
    () => new DhemeClient({ apiKey, baseUrl }),
    [apiKey, baseUrl]
  );

  // Estado
  const [theme, setTheme] = useState<GenerateThemeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Carregar tema do localStorage no mount (SSR-safe)
  useEffect(() => {
    if (persistTheme && typeof window !== 'undefined') {
      const stored = loadThemeFromStorage();
      if (stored) {
        setTheme(stored);
      }
    }
  }, [persistTheme]);

  // Aplicar tema quando mudar
  useEffect(() => {
    if (theme && autoApply) {
      applyThemeCSSVariables(theme, mode);
    }
  }, [theme, mode, autoApply]);

  // Notificar mudança
  useEffect(() => {
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Gerar tema
  const generateTheme = useCallback(
    async (params: GenerateThemeRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await client.generateTheme(params);
        setTheme(response.data);

        if (persistTheme) {
          saveThemeToStorage(response.data);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, persistTheme]
  );

  // Limpar tema
  const clearTheme = useCallback(() => {
    setTheme(null);
    setError(null);

    if (persistTheme && typeof window !== 'undefined') {
      localStorage.removeItem('dheme-theme');
    }
  }, [persistTheme]);

  // Aplicar tema manualmente
  const applyTheme = useCallback(
    (mode: 'light' | 'dark') => {
      if (theme) {
        applyThemeCSSVariables(theme, mode);
      }
    },
    [theme]
  );

  const value = useMemo(
    () => ({
      client,
      theme,
      isLoading,
      error,
      generateTheme,
      clearTheme,
      applyTheme,
    }),
    [client, theme, isLoading, error, generateTheme, clearTheme, applyTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

---

### 6. React - src/hooks/useTheme.ts

Criar arquivo `/packages/react/src/hooks/useTheme.ts`:

```typescript
import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

/**
 * Hook para acessar o ThemeContext
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
```

---

### 7. React - src/hooks/useGenerateTheme.ts

Criar arquivo `/packages/react/src/hooks/useGenerateTheme.ts`:

```typescript
import { useState, useCallback } from 'react';
import { useTheme } from './useTheme';
import type { GenerateThemeRequest } from '@dheme/sdk';

/**
 * Hook para gerar temas com loading state local
 */
export function useGenerateTheme() {
  const { generateTheme: generate } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateTheme = useCallback(
    async (params: GenerateThemeRequest) => {
      setIsGenerating(true);
      setError(null);

      try {
        await generate(params);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [generate]
  );

  return {
    generateTheme,
    isGenerating,
    error,
  };
}
```

---

### 8. React - src/index.ts

Criar arquivo `/packages/react/src/index.ts`:

```typescript
// Provider e Context
export { ThemeProvider } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { ThemeContext } from './ThemeContext';
export type { ThemeContextValue } from './ThemeContext';

// Hooks
export { useTheme } from './hooks/useTheme';
export { useGenerateTheme } from './hooks/useGenerateTheme';

// Utilitários
export {
  applyThemeCSSVariables,
  removeThemeCSSVariables,
} from './utils/cssVariables';
export {
  saveThemeToStorage,
  loadThemeFromStorage,
  removeThemeFromStorage,
} from './utils/localStorage';

// Re-exportar tipos da SDK base
export type {
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/sdk';
```

---

## Exemplos de Uso

### SDK Base - Exemplo Básico

Criar arquivo `/packages/sdk/examples/basic.ts`:

```typescript
import { DhemeClient } from '@dheme/sdk';

async function main() {
  // Criar cliente
  const client = new DhemeClient({
    apiKey: 'dheme_xxxxxxxx_...',
  });

  try {
    // Gerar tema
    const { data, rateLimit } = await client.generateTheme({
      theme: '#3b82f6',
      radius: 0.5,
    });

    console.log('Theme generated successfully!');
    console.log('Primary color (light):', data.colors.light.primary);
    console.log('Rate limit remaining:', rateLimit.remaining);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

---

### SDK Base - Exemplo Node.js

Criar arquivo `/packages/sdk/examples/nodejs.ts`:

```typescript
import { DhemeClient, RateLimitError } from '@dheme/sdk';

async function main() {
  const client = new DhemeClient({
    apiKey: process.env.DHEME_API_KEY!,
    retryConfig: {
      maxRetries: 5,
      initialDelay: 2000,
    },
  });

  try {
    // Gerar CSS
    const css = await client.generateShadcnCSS({
      theme: '#10b981',
      secondaryColor: '#3b82f6',
    });

    console.log('CSS generated:');
    console.log(css);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded!');
      console.error('Limit:', error.limit);
      console.error('Reset at:', error.resetAt);
    } else {
      console.error('Error:', error);
    }
  }
}

main();
```

---

### React - Exemplo Básico

Criar arquivo `/packages/react/examples/basic.tsx`:

```typescript
import React from 'react';
import { ThemeProvider, useGenerateTheme, useTheme } from '@dheme/react';

function App() {
  return (
    <ThemeProvider apiKey="dheme_xxxxxxxx_...">
      <ThemeGenerator />
    </ThemeProvider>
  );
}

function ThemeGenerator() {
  const { generateTheme, isGenerating } = useGenerateTheme();
  const { theme } = useTheme();

  const handleGenerate = async () => {
    try {
      await generateTheme({
        theme: '#3b82f6',
        radius: 0.5,
      });
    } catch (error) {
      console.error('Failed to generate theme:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Theme'}
      </button>

      {theme && (
        <div>
          <h2>Theme Generated!</h2>
          <p>Primary: {theme.colors.light.primary.h}°</p>
        </div>
      )}
    </div>
  );
}

export default App;
```

---

### React - Exemplo Next.js

Criar arquivo `/packages/react/examples/nextjs.tsx`:

```typescript
// app/layout.tsx
import { ThemeProvider } from '@dheme/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ThemeProvider
          apiKey={process.env.NEXT_PUBLIC_DHEME_API_KEY!}
          persistTheme={true}
          autoApply={true}
          mode="light"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// app/page.tsx
'use client';

import { useGenerateTheme, useTheme } from '@dheme/react';

export default function Home() {
  const { generateTheme, isGenerating } = useGenerateTheme();
  const { theme } = useTheme();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Theme Generator</h1>

      <button
        onClick={() => generateTheme({ theme: '#3b82f6' })}
        disabled={isGenerating}
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        Generate Theme
      </button>

      {theme && (
        <div className="mt-4 p-4 border rounded">
          <p>Theme applied successfully!</p>
        </div>
      )}
    </div>
  );
}
```

---

## Testes

### Exemplo de Teste para colorConversion

Criar arquivo `/packages/sdk/src/utils/colorConversion.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { hexToHSL, hslToRGB, rgbToHex, isValidHex } from './colorConversion';

describe('colorConversion', () => {
  describe('isValidHex', () => {
    it('should validate correct HEX colors', () => {
      expect(isValidHex('#3b82f6')).toBe(true);
      expect(isValidHex('3b82f6')).toBe(true);
      expect(isValidHex('#FFFFFF')).toBe(true);
    });

    it('should reject invalid HEX colors', () => {
      expect(isValidHex('#123')).toBe(false);
      expect(isValidHex('xyz123')).toBe(false);
      expect(isValidHex('')).toBe(false);
    });
  });

  describe('hexToHSL', () => {
    it('should convert HEX to HSL correctly', () => {
      const result = hexToHSL('#3b82f6');
      expect(result.h).toBeCloseTo(221.2, 1);
      expect(result.s).toBeCloseTo(83.2, 1);
      expect(result.l).toBeCloseTo(53.3, 1);
    });
  });

  describe('conversion round-trip', () => {
    it('should convert HEX -> HSL -> RGB -> HEX correctly', () => {
      const original = '#3b82f6';
      const hsl = hexToHSL(original);
      const rgb = hslToRGB(hsl);
      const final = rgbToHex(rgb);

      expect(final.toLowerCase()).toBe(original.toLowerCase());
    });
  });
});
```

---

## Build e Publicação

### Comandos de Build

```bash
# Root do monorepo
npm install

# Build todos os pacotes
npm run build

# Dev mode (watch)
npm run dev

# Testes
npm run test

# Lint
npm run lint

# Typecheck
npm run typecheck
```

### Publicar no npm

```bash
# Publish SDK base
cd packages/sdk
npm publish --access public

# Publish React library
cd packages/react
npm publish --access public
```

---

## Próximos Passos

1. **Setup Inicial**
   - Criar estrutura de diretórios
   - Configurar npm workspaces
   - Instalar dependências

2. **Implementar SDK Base**
   - Seguir ordem: types → errors → constants → utils → middleware → client → index
   - Escrever testes unitários
   - Testar em diferentes ambientes

3. **Implementar React Library**
   - Context → Provider → hooks → utils → index
   - Escrever testes de componentes
   - Testar com Next.js e Vite

4. **Documentação**
   - README para cada pacote
   - CHANGELOG
   - Exemplos práticos

5. **Publicação**
   - Configurar CI/CD
   - Publicar no npm
   - Criar releases no GitHub

---

## Notas Importantes

- **URL Base**: Substituir `https://theme.dheme.com` pela URL real da API
- **TypeScript**: Manter strict mode ativado
- **Testes**: Escrever testes para todas as funções utilitárias
- **SSR**: Garantir que código React é SSR-safe
- **Tree-shaking**: Usar named exports, evitar default exports
- **Bundle size**: Manter dependências mínimas

---

Este README contém toda a informação necessária para implementar a SDK Dheme completa. Siga a ordem sugerida de implementação e mantenha a estrutura de arquivos conforme especificado.
