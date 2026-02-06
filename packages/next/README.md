# @dheme/next

Next.js App Router bindings for the [Dheme](https://dheme.com) Theme Generator API. Server-side theme generation with **zero FOUC** — even on first visit.

Built for **Next.js 14+** (App Router). For **React SPAs** (Vite, CRA), use [`@dheme/react`](https://www.npmjs.com/package/@dheme/react) instead.

## Installation

```bash
npm install @dheme/next @dheme/react @dheme/sdk
```

```bash
yarn add @dheme/next @dheme/react @dheme/sdk
```

```bash
pnpm add @dheme/next @dheme/react @dheme/sdk
```

### Requirements

| Dependency     | Version  | Why                           |
| -------------- | -------- | ----------------------------- |
| `next`         | >= 14    | App Router, Server Components |
| `react`        | >= 18    | Peer dependency               |
| `react-dom`    | >= 18    | Peer dependency               |
| `@dheme/react` | >= 2.0.0 | Shared hooks, utils, provider |
| `@dheme/sdk`   | >= 1.1.0 | Core API client               |

`@dheme/react` and `@dheme/sdk` are included as dependencies and installed automatically.

## Quick Start

```tsx
// app/layout.tsx (Server Component)
import { DhemeScript, DhemeProvider } from '@dheme/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <DhemeScript apiKey={process.env.DHEME_API_KEY!} theme="#3b82f6" />
      </head>
      <body>
        <DhemeProvider apiKey={process.env.DHEME_API_KEY!} theme="#3b82f6">
          {children}
        </DhemeProvider>
      </body>
    </html>
  );
}
```

That's it. Your app has 19 CSS variables applied server-side — zero client-side fetch, zero FOUC.

## How It Works

### Every visit (zero FOUC, zero client fetch)

1. `<DhemeScript>` is a **Server Component** — it calls the Dheme API on the server
2. It inlines a `<style>` tag with CSS variables for **both** light and dark modes
3. It inlines a tiny `<script>` (~250 bytes) that detects the user's mode preference (cookie or `prefers-color-scheme`) and applies the `.dark` class
4. The browser receives HTML with styles already applied — **before any paint**
5. React hydrates, `DhemeProvider` sets `isReady = true` — no API call needed

### Server-side caching

The server maintains an **in-memory LRU cache** (100 entries, 1h TTL). Since theme generation is deterministic (same input = same output), the cache is highly effective:

- **First request:** API call to Dheme → cached
- **All subsequent requests:** Served from memory, no API call

## Components

### `<DhemeScript>` (Server Component)

Fetches the theme on the server and renders inline `<style>` + `<script>` tags. Place it in `<head>`.

```tsx
<DhemeScript
  apiKey={process.env.DHEME_API_KEY!} // Required — server-side only
  theme="#3b82f6" // Required — primary HEX color
  themeParams={{
    // Optional generation params
    radius: 0.75,
    saturationAdjust: 10,
  }}
  defaultMode="light" // 'light' | 'dark' (default: 'light')
  baseUrl="http://localhost:3005" // Override API URL (optional)
  nonce="abc123" // CSP nonce (optional)
/>
```

| Prop          | Type                                  | Default   | Description                           |
| ------------- | ------------------------------------- | --------- | ------------------------------------- |
| `apiKey`      | `string`                              | -         | **Required.** Dheme API key.          |
| `theme`       | `string`                              | -         | **Required.** Primary HEX color.      |
| `themeParams` | `Omit<GenerateThemeRequest, 'theme'>` | -         | Additional generation parameters.     |
| `defaultMode` | `'light' \| 'dark'`                   | `'light'` | Fallback mode if no preference found. |
| `baseUrl`     | `string`                              | -         | Override API base URL.                |
| `nonce`       | `string`                              | -         | CSP nonce for style and script tags.  |

**What it renders:**

```html
<!-- CSS for both modes — parsed before paint -->
<style>
  :root { --background:0 0% 100%; --primary:221.2 83.2% 53.3%; ... }
  .dark { --background:222.2 84% 4.9%; --primary:217.2 91.2% 59.8%; ... }
</style>

<!-- Mode detection — applies .dark class if needed -->
<script>
  (function(){try{var m=document.cookie.match(/dheme-mode=(\w+)/);...})()
</script>
```

### `<DhemeProvider>` (Client Component)

Wraps `@dheme/react`'s provider with **cookie synchronization**. When the user changes theme or mode on the client, it writes to cookies so the server can read them on the next request.

```tsx
<DhemeProvider
  apiKey={process.env.DHEME_API_KEY!}
  theme="#3b82f6"
  cookieSync={true} // Sync mode/params to cookies (default: true)
>
  {children}
</DhemeProvider>
```

Accepts all props from `@dheme/react`'s `DhemeProvider` plus:

| Prop         | Type      | Default | Description                            |
| ------------ | --------- | ------- | -------------------------------------- |
| `cookieSync` | `boolean` | `true`  | Sync theme params and mode to cookies. |

### Cookie strategy

| Cookie         | Size       | Contains                         | Purpose                      |
| -------------- | ---------- | -------------------------------- | ---------------------------- |
| `dheme-mode`   | ~5 bytes   | `"light"` or `"dark"`            | Server reads mode preference |
| `dheme-params` | ~100 bytes | Base64-encoded generation params | Server rebuilds cache key    |

Only lightweight data is stored in cookies — never the full theme response.

## Hooks

All hooks are re-exported from `@dheme/react`. Import them from `@dheme/next` directly:

```tsx
import { useTheme, useThemeActions, useGenerateTheme, useDhemeClient } from '@dheme/next';
```

### `useTheme()`

```tsx
const { theme, mode, isReady } = useTheme();
```

Read theme data. Only re-renders when theme or mode changes.

### `useThemeActions()`

```tsx
const { setMode, generateTheme, clearTheme, isLoading, error } = useThemeActions();
```

Access actions. Only re-renders on action state changes.

### `useGenerateTheme()`

```tsx
const { generateTheme, isGenerating, error } = useGenerateTheme();
```

Local loading state for individual components.

### `useDhemeClient()`

```tsx
const client = useDhemeClient();
```

Raw `DhemeClient` access for `getUsage()`, etc.

## Server Utilities

Import server-only functions from `@dheme/next/server`:

```tsx
import { generateThemeStyles, themeCache } from '@dheme/next/server';
```

### `generateThemeStyles(options)`

Generate theme CSS on the server. Uses the in-memory LRU cache.

```tsx
import { generateThemeStyles } from '@dheme/next/server';

// In a Server Component or Route Handler
const css = await generateThemeStyles({
  apiKey: process.env.DHEME_API_KEY!,
  theme: '#3b82f6',
  mode: 'light',
});

// css = "--background:0 0% 100%;--foreground:222.2 84% 4.9%;..."
```

| Option        | Type                                  | Default   | Description                      |
| ------------- | ------------------------------------- | --------- | -------------------------------- |
| `apiKey`      | `string`                              | -         | **Required.** Dheme API key.     |
| `theme`       | `string`                              | -         | **Required.** Primary HEX color. |
| `themeParams` | `Omit<GenerateThemeRequest, 'theme'>` | -         | Additional generation params.    |
| `mode`        | `'light' \| 'dark'`                   | `'light'` | Which mode's CSS to generate.    |
| `baseUrl`     | `string`                              | -         | Override API base URL.           |

### `themeCache`

The in-memory LRU cache instance. Useful for cache management:

```tsx
import { themeCache } from '@dheme/next/server';

// Clear all cached themes (e.g., after a deployment)
themeCache.clear();
```

### `getModeFromCookie()` / `getParamsFromCookie()`

Read theme data from cookies in Server Components or Route Handlers:

```tsx
import { getModeFromCookie, getParamsFromCookie } from '@dheme/next/server';

const mode = await getModeFromCookie(); // 'light' | 'dark' | null
const params = await getParamsFromCookie(); // JSON string | null
```

## Environment Variables

| Variable         | Where to set | Description                           |
| ---------------- | ------------ | ------------------------------------- |
| `DHEME_API_KEY`  | `.env.local` | Your Dheme API key (server-side only) |
| `DHEME_BASE_URL` | `.env.local` | Override API URL for local dev        |

**Important:** `DHEME_API_KEY` is a server-side secret — do **not** prefix it with `NEXT_PUBLIC_`. The `<DhemeScript>` Server Component reads it on the server and never exposes it to the client.

For local development with a local Dheme API:

```bash
# .env.local
DHEME_API_KEY=dheme_abc12345_...
DHEME_BASE_URL=http://localhost:3005
```

## Full Example

### `app/layout.tsx`

```tsx
import { DhemeScript, DhemeProvider } from '@dheme/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <DhemeScript
          apiKey={process.env.DHEME_API_KEY!}
          theme="#3b82f6"
          themeParams={{ radius: 0.5 }}
        />
      </head>
      <body>
        <DhemeProvider apiKey={process.env.DHEME_API_KEY!} theme="#3b82f6">
          {children}
        </DhemeProvider>
      </body>
    </html>
  );
}
```

### `app/page.tsx` (Server Component)

```tsx
// Server Components work — CSS variables are available globally
export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <h1 className="text-primary">Welcome</h1>
      <ThemeToggle />
    </main>
  );
}
```

### `components/ThemeToggle.tsx` (Client Component)

```tsx
'use client';

import { useTheme, useThemeActions } from '@dheme/next';

export function ThemeToggle() {
  const { mode } = useTheme();
  const { setMode } = useThemeActions();

  return (
    <button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
      {mode === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}
```

### `app/api/theme/route.ts` (Route Handler)

```tsx
import { generateThemeStyles } from '@dheme/next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const color = searchParams.get('color') || '#3b82f6';

  const css = await generateThemeStyles({
    apiKey: process.env.DHEME_API_KEY!,
    theme: color,
    mode: 'light',
  });

  return new Response(`:root{${css}}`, {
    headers: { 'Content-Type': 'text/css' },
  });
}
```

## Architecture

```
                    Server                          Client
                    ──────                          ──────

Request →  DhemeScript (Server Component)    DhemeProvider (Client Component)
           │                                  │
           ├─ themeCache.get(key)              ├─ localStorage cache check
           │  ↓ miss? call SDK                │  ↓ hit? serve instantly
           ├─ themeCache.set(key, data)        ├─ background revalidation
           │                                  │
           ├─ <style> with :root + .dark      ├─ cookie sync (mode + params)
           └─ <script> mode detection         └─ context providers (split)
                                                  ├─ ThemeDataContext
                                                  └─ ThemeActionsContext
```

## Comparison: @dheme/react vs @dheme/next

| Feature                  | @dheme/react         | @dheme/next                  |
| ------------------------ | -------------------- | ---------------------------- |
| **Platform**             | Vite, CRA, SPAs      | Next.js 14+ App Router       |
| **FOUC on first visit**  | Brief (no cache yet) | None (CSS inline in HTML)    |
| **FOUC on cached visit** | None                 | None                         |
| **Theme fetch**          | Client-side          | Server-side                  |
| **API key exposure**     | In client bundle     | Server-only (secure)         |
| **Caching**              | localStorage         | LRU in-memory + localStorage |
| **Mode persistence**     | localStorage         | Cookies + localStorage       |
| **SSR support**          | No                   | Yes                          |

## TypeScript

All types are exported:

```typescript
import type {
  DhemeProviderProps,
  DhemeScriptProps,
  GenerateThemeStylesOptions,
  ThemeMode,
  ThemeDataState,
  ThemeActionsState,
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/next';
```

## Related Packages

| Package        | Description                     | When to use                |
| -------------- | ------------------------------- | -------------------------- |
| `@dheme/sdk`   | Core TypeScript SDK             | Direct API access, Node.js |
| `@dheme/react` | React bindings                  | Vite, CRA, React SPAs      |
| `@dheme/next`  | Next.js bindings (this package) | Next.js 14+ with SSR       |

## License

MIT
