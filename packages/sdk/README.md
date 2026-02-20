# @dheme/sdk

TypeScript SDK for the [Dheme](https://dheme.com) Theme Generator API. Generate production-ready UI themes from a single color — compatible with shadcn/ui, Tailwind CSS, and any CSS variable-based design system.

**Zero dependencies.** Works in Browser, Node.js 18+, Edge Runtime, and React Native.

## Installation

```bash
npm install @dheme/sdk
```

```bash
yarn add @dheme/sdk
```

```bash
pnpm add @dheme/sdk
```

## Quick Start

```typescript
import { DhemeClient } from '@dheme/sdk';

const client = new DhemeClient({
  apiKey: 'dheme_abc12345_...',
});

// Generate a full theme from a single color
const { data: theme, rateLimit } = await client.generateTheme({
  theme: '#3b82f6',
});

console.log(theme.colors.light.primary);
// { h: 221.2, s: 83.2, l: 53.3 }

console.log(rateLimit);
// { limit: 300, remaining: 299, reset: '2026-02-01T00:00:00Z' }
```

## Client Configuration

```typescript
const client = new DhemeClient({
  // Required
  apiKey: 'dheme_abc12345_...',

  // Optional — defaults shown
  baseUrl: 'https://www.dheme.com',
  timeout: 30000,
  debug: false,

  // Retry configuration (optional)
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },

  // Interceptors (optional)
  interceptors: {
    request: [],
    response: [],
  },
});
```

| Option         | Type           | Default                 | Description                        |
| -------------- | -------------- | ----------------------- | ---------------------------------- |
| `apiKey`       | `string`       | -                       | **Required.** Your Dheme API key.  |
| `baseUrl`      | `string`       | `https://www.dheme.com` | API base URL.                      |
| `timeout`      | `number`       | `30000`                 | Request timeout in milliseconds.   |
| `debug`        | `boolean`      | `false`                 | Log requests/responses to console. |
| `retryConfig`  | `RetryConfig`  | See above               | Exponential backoff configuration. |
| `interceptors` | `Interceptors` | `undefined`             | Request/response hooks.            |

## Environment Variables

| Variable         | Description                          | Default                 |
| ---------------- | ------------------------------------ | ----------------------- |
| `DHEME_BASE_URL` | Override the API base URL            | `https://www.dheme.com` |
| `DHEME_API_KEY`  | API key (use in code, not auto-read) | -                       |

For local development, set `DHEME_BASE_URL` in your `.env.local` (Next.js) or `.env`:

```bash
DHEME_BASE_URL=http://localhost:3005
```

The SDK reads this automatically — no code changes needed. When the variable is absent, it defaults to production.

> **Priority:** `baseUrl` in constructor > `DHEME_BASE_URL` env var > default (`https://www.dheme.com`)

## API Endpoints

All methods hit the base URL `https://www.dheme.com`:

| Method             | HTTP                       | Description                                 |
| ------------------ | -------------------------- | ------------------------------------------- |
| `generateTheme()`  | `POST /api/generate-theme` | Full theme (HSL color tokens + backgrounds) |
| `generateCSS()`    | `POST /api/generate-theme` | CSS text (`:root` + `.dark`)                |
| `generateTokens()` | `POST /api/generate-theme` | Multi-format tokens (HSL, RGB, HEX)         |
| `getUsage()`       | `GET /api/usage`           | Usage statistics and rate limits            |

> **Note:** All three theme generation methods hit the same endpoint. The SDK sets the `format` parameter automatically based on the method called.

## Methods

### `generateTheme(params)`

Generates a complete theme with light and dark mode color tokens in HSL format.

```typescript
const { data, rateLimit } = await client.generateTheme({
  theme: '#3b82f6',
  secondaryColor: '#10b981',
  radius: 0.75,
});

// data.colors.light — 19 color tokens (HSL)
// data.colors.dark  — 19 color tokens (HSL)
// data.backgrounds  — gradient backgrounds
```

**Returns:** `Promise<ResponseWithRateLimit<GenerateThemeResponse>>`

---

### `generateCSS(params)`

Generates CSS text ready to inject into your app (`:root` + `.dark` selectors).

```typescript
const css = await client.generateCSS({
  theme: '#3b82f6',
});

console.log(css);
// :root {
//   --background: 0 0% 100%;
//   --foreground: 222.2 84% 4.9%;
//   --primary: 221.2 83.2% 53.3%;
//   ...
// }
// .dark {
//   --background: 222.2 84% 4.9%;
//   ...
// }
```

**Returns:** `Promise<string>`

---

### `generateTokens(params)`

Generates design tokens in multiple formats (HSL, RGB, HEX) for each color token.

```typescript
const { data: tokens } = await client.generateTokens({
  theme: '#3b82f6',
});

// Each token has three formats:
console.log(tokens.light.primary);
// {
//   hsl: { h: 221.2, s: 83.2, l: 53.3 },
//   rgb: [59, 130, 246],
//   hex: '#3b82f6'
// }
```

**Returns:** `Promise<ResponseWithRateLimit<TokensResponse>>`

---

### `getUsage()`

Returns current API usage statistics and rate limit info.

```typescript
const { data: usage } = await client.getUsage();

console.log(usage);
// {
//   usage: 13,
//   limit: 300,
//   remaining: 287,
//   percentage: 4.33,
//   resetAt: '2026-02-01T00:00:00Z',
//   plan: 'basic'
// }
```

**Returns:** `Promise<ResponseWithRateLimit<UsageResponse>>`

## Request Parameters

All theme generation methods (`generateTheme`, `generateCSS`, `generateTokens`) accept the same parameters:

```typescript
interface GenerateThemeRequest {
  theme: string; // Required. Primary color in HEX (e.g. '#3b82f6')
  secondaryColor?: string; // Optional. Secondary color in HEX
  radius?: number; // 0–2, default 0.5. Border radius in rem
  saturationAdjust?: number; // -100–100, default 0
  lightnessAdjust?: number; // -100–100, default 0
  contrastAdjust?: number; // -100–100, default 0
  cardIsColored?: boolean; // default false
  backgroundIsColored?: boolean; // default true
  borderIsColored?: boolean; // default false
  format?: 'object' | 'css' | 'tokens'; // default 'object'
  template?: string; // Custom template slug
}
```

| Parameter             | Type      | Required | Range                           | Description                                        |
| --------------------- | --------- | -------- | ------------------------------- | -------------------------------------------------- |
| `theme`               | `string`  | Yes      | Valid HEX                       | Primary color that drives the entire palette.      |
| `secondaryColor`      | `string`  | No       | Valid HEX                       | Secondary/accent color. Auto-generated if omitted. |
| `radius`              | `number`  | No       | `0`–`2`                         | Border radius for UI components (rem).             |
| `saturationAdjust`    | `number`  | No       | `-100`–`100`                    | Increase or decrease overall saturation.           |
| `lightnessAdjust`     | `number`  | No       | `-100`–`100`                    | Increase or decrease overall lightness.            |
| `contrastAdjust`      | `number`  | No       | `-100`–`100`                    | Increase or decrease contrast between surfaces.    |
| `cardIsColored`       | `boolean` | No       | -                               | If `true`, card backgrounds get a subtle tint.     |
| `backgroundIsColored` | `boolean` | No       | -                               | If `false`, backgrounds are pure white/black.      |
| `borderIsColored`     | `boolean` | No       | -                               | If `true`, borders get a primary color tint.       |
| `format`              | `string`  | No       | `"object"`, `"css"`, `"tokens"` | Response format (default: `"object"`).             |
| `template`            | `string`  | No       | -                               | Template slug for custom key remapping.            |

### The `format` Parameter

The `format` parameter controls the response format. The SDK convenience methods set it automatically:

| Value      | Description                                 | SDK method         |
| ---------- | ------------------------------------------- | ------------------ |
| `"object"` | JSON with HSL color tokens (default)        | `generateTheme()`  |
| `"css"`    | CSS text with `:root` and `.dark` selectors | `generateCSS()`    |
| `"tokens"` | Multi-format tokens (HSL, RGB, HEX)         | `generateTokens()` |

```typescript
// These two are equivalent:
const { data } = await client.generateTheme({ theme: '#3b82f6', format: 'object' });
const { data } = await client.generateTheme({ theme: '#3b82f6' });
```

### The `template` Parameter

Templates allow you to remap default color key names to custom ones. Templates are configured on the Dheme platform and referenced by name.

```typescript
// With a template that maps: primary → mainColor, secondary → accentColor
const { data } = await client.generateTheme({
  theme: '#3b82f6',
  template: 'my-custom-template',
});

// data.colors.light.mainColor instead of data.colors.light.primary
```

### The `secondaryColor` Parameter

When `secondaryColor` is omitted, the API auto-generates a complementary accent color. Note that `backgrounds.secondary` will be `null` when no secondary color is provided:

```typescript
// Without secondaryColor
const { data } = await client.generateTheme({ theme: '#3b82f6' });
console.log(data.backgrounds.secondary); // null

// With secondaryColor
const { data } = await client.generateTheme({
  theme: '#3b82f6',
  secondaryColor: '#10b981',
});
console.log(data.backgrounds.secondary); // { light: '...', dark: '...' }
```

## Response Types

### `GenerateThemeResponse`

```typescript
interface GenerateThemeResponse {
  theme: string;
  secondaryColor: string;
  radius: number;
  saturationAdjust: number;
  lightnessAdjust: number;
  contrastAdjust: number;
  cardIsColored: boolean;
  backgroundIsColored: boolean;
  colors: {
    light: ColorTokens; // 19 HSL color tokens
    dark: ColorTokens; // 19 HSL color tokens
  };
  backgrounds: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string } | null; // null when no secondaryColor
  };
}
```

### `ColorTokens` (19 tokens)

```typescript
interface ColorTokens {
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

interface HSLColor {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}
```

### `TokensResponse`

```typescript
interface TokensResponse {
  light: Record<string, ColorFormats>;
  dark: Record<string, ColorFormats>;
  radius: number;
  backgrounds: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string } | null;
  } | null;
}

interface ColorFormats {
  hsl: HSLColor;
  rgb: [number, number, number];
  hex: string;
}
```

### `UsageResponse`

```typescript
interface UsageResponse {
  usage: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetAt: string; // ISO 8601
  plan: string; // 'basic' | 'professional' | 'business' | 'enterprise'
}
```

### `RateLimitHeaders`

Every API response includes rate limit information:

```typescript
interface RateLimitHeaders {
  limit: number; // Total requests allowed per month
  remaining: number; // Requests remaining
  reset: string; // ISO 8601 timestamp when limit resets
}
```

## Error Handling

All errors extend `DhemeError` and can be caught by type:

```typescript
import {
  DhemeError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ServerError,
} from '@dheme/sdk';

try {
  const { data } = await client.generateTheme({ theme: '#3b82f6' });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Resets at: ${error.resetAt}`);
    console.log(`Plan: ${error.plan}, Limit: ${error.limit}`);
  }

  if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  }

  if (error instanceof ValidationError) {
    console.log('Bad input:', error.errors);
    // error.errors = { theme: ['Theme must be a valid HEX color'] }
  }

  if (error instanceof NetworkError) {
    console.log('Network issue:', error.message);
    // Timeout or connection failure
  }

  if (error instanceof ServerError) {
    console.log('Server error:', error.statusCode);
  }

  // Catch-all
  if (error instanceof DhemeError) {
    console.log(error.message, error.statusCode);
  }
}
```

| Error Class           | HTTP Status | Properties                                                      |
| --------------------- | ----------- | --------------------------------------------------------------- |
| `AuthenticationError` | `401`       | `message`, `statusCode`, `response`                             |
| `ValidationError`     | `400`       | `message`, `errors` (field-level), `statusCode`, `response`     |
| `RateLimitError`      | `429`       | `message`, `limit`, `resetAt`, `plan`, `statusCode`, `response` |
| `NetworkError`        | -           | `message`, `cause` (original error)                             |
| `ServerError`         | `500`       | `message`, `statusCode`, `response`                             |
| `DhemeError`          | any         | Base class. `message`, `statusCode`, `response`                 |

## Retry Configuration

Automatic exponential backoff is built in. Retries are only triggered for retryable status codes (timeout, rate limit, server errors).

```typescript
const client = new DhemeClient({
  apiKey: '...',
  retryConfig: {
    maxRetries: 3, // Number of retries (0 = no retries)
    initialDelay: 1000, // First retry after 1s
    maxDelay: 10000, // Cap at 10s between retries
    backoffMultiplier: 2, // 1s → 2s → 4s → 8s (capped at 10s)
    retryableStatusCodes: [
      // Only retry these
      408, 429, 500, 502, 503, 504,
    ],
  },
});
```

To disable retries:

```typescript
const client = new DhemeClient({
  apiKey: '...',
  retryConfig: { maxRetries: 0 },
});
```

## Interceptors

Add custom logic before every request or after every response.

### Request Interceptors

```typescript
import { DhemeClient, type RequestInterceptor } from '@dheme/sdk';

const addCorrelationId: RequestInterceptor = (config) => ({
  ...config,
  headers: {
    ...config.headers,
    'x-correlation-id': crypto.randomUUID(),
  },
});

const client = new DhemeClient({
  apiKey: '...',
  interceptors: {
    request: [addCorrelationId],
  },
});
```

### Response Interceptors

```typescript
import { type ResponseInterceptor } from '@dheme/sdk';

const trackLatency: ResponseInterceptor = (response) => {
  console.log(`Status: ${response.status}`);
  return response;
};

const client = new DhemeClient({
  apiKey: '...',
  interceptors: {
    response: [trackLatency],
  },
});
```

### Built-in Interceptors

```typescript
import {
  loggingInterceptor, // Logs method + URL
  customHeadersInterceptor, // Factory: adds custom headers
  responseLoggingInterceptor, // Logs status + statusText
} from '@dheme/sdk';

const client = new DhemeClient({
  apiKey: '...',
  interceptors: {
    request: [loggingInterceptor, customHeadersInterceptor({ 'x-tenant-id': 'acme' })],
    response: [responseLoggingInterceptor],
  },
});
```

## Color Utilities

Standalone functions exported for use without the client.

```typescript
import {
  hexToHSL,
  hslToRGB,
  rgbToHex,
  hslToHex,
  hexToRGB,
  rgbToHSL,
  formatHSLString,
  isValidHex,
} from '@dheme/sdk';
```

### Conversions

```typescript
hexToHSL('#3b82f6'); // { h: 221.2, s: 83.2, l: 53.3 }
hslToRGB({ h: 221.2, s: 83.2, l: 53.3 }); // { r: 59, g: 130, b: 246 }
rgbToHex({ r: 59, g: 130, b: 246 }); // '#3b82f6'
hslToHex({ h: 221.2, s: 83.2, l: 53.3 }); // '#3b82f6'
hexToRGB('#3b82f6'); // { r: 59, g: 130, b: 246 }
rgbToHSL({ r: 59, g: 130, b: 246 }); // { h: 221.2, s: 83.2, l: 53.3 }
```

### Formatting

```typescript
// HSL object → CSS string (shadcn format)
formatHSLString({ h: 221.2, s: 83.2, l: 53.3 });
// '221.2 83.2% 53.3%'
```

### Validation

```typescript
isValidHex('#3b82f6'); // true
isValidHex('3b82f6'); // true (# is optional)
isValidHex('#fff'); // false (shorthand not supported)
isValidHex('invalid'); // false
```

## Examples

### Node.js Server

```typescript
import { DhemeClient } from '@dheme/sdk';

const dheme = new DhemeClient({
  apiKey: process.env.DHEME_API_KEY!,
});

async function getThemeForTenant(primaryColor: string) {
  const { data } = await dheme.generateTheme({
    theme: primaryColor,
    radius: 0.5,
  });

  return data;
}
```

### Next.js API Route

```typescript
import { DhemeClient, RateLimitError } from '@dheme/sdk';

const dheme = new DhemeClient({
  apiKey: process.env.DHEME_API_KEY!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const color = searchParams.get('color') || '#3b82f6';

  try {
    const css = await dheme.generateCSS({ theme: color });
    return new Response(css, {
      headers: { 'Content-Type': 'text/css' },
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json(
        { error: 'Rate limit exceeded', resetAt: error.resetAt },
        { status: 429 }
      );
    }
    throw error;
  }
}
```

### Edge Runtime (Vercel/Cloudflare)

```typescript
import { DhemeClient } from '@dheme/sdk';

export const runtime = 'edge';

const dheme = new DhemeClient({
  apiKey: process.env.DHEME_API_KEY!,
  timeout: 5000,
  retryConfig: { maxRetries: 1 },
});

export default async function handler(request: Request) {
  const { data } = await dheme.generateTheme({ theme: '#8b5cf6' });
  return Response.json(data);
}
```

### Using Format Parameter

```typescript
// Get CSS directly from the main endpoint
const { data: css } = await client.generateTheme({
  theme: '#3b82f6',
  format: 'css',
});

// Get multi-format tokens from the main endpoint
const { data: tokens } = await client.generateTheme({
  theme: '#3b82f6',
  format: 'tokens',
});
```

### Using Templates

```typescript
// Use a custom template for key remapping
const { data } = await client.generateTheme({
  theme: '#3b82f6',
  template: 'my-design-system',
});
// Color keys are remapped according to the template configuration
```

### Multi-Format Tokens

```typescript
const { data: tokens } = await client.generateTokens({
  theme: '#3b82f6',
});

// Use HSL for CSS
const cssVar = `${tokens.light.primary.hsl.h} ${tokens.light.primary.hsl.s}% ${tokens.light.primary.hsl.l}%`;

// Use HEX for Figma/design tools
const figmaColor = tokens.light.primary.hex;

// Use RGB for canvas/WebGL
const [r, g, b] = tokens.light.primary.rgb;
```

## TypeScript

Full type definitions are included. All types are exported:

```typescript
import type {
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
} from '@dheme/sdk';
```

## Plans

| Plan         | Requests/month | Price       |
| ------------ | -------------- | ----------- |
| Basic        | 300            | Free        |
| Professional | 50,000         | Coming soon |
| Business     | 250,000        | Coming soon |
| Enterprise   | 1,000,000      | Coming soon |

## Compatibility

| Environment      | Supported |
| ---------------- | --------- |
| Node.js 18+      | Yes       |
| Browser (modern) | Yes       |
| Edge Runtime     | Yes       |
| React Native     | Yes       |
| Deno             | Yes       |
| Bun              | Yes       |

**Requirements:** Global `fetch` API (native in Node.js 18+, all modern browsers, and edge runtimes).

## License

MIT
