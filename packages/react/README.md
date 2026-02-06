# @dheme/react

React bindings for the [Dheme](https://dheme.com) Theme Generator API. Apply production-ready themes to your React app with a single provider — zero FOUC on cached visits.

Built for **React SPAs** (Vite, CRA, Remix SPA mode). For **Next.js App Router**, use [`@dheme/next`](https://www.npmjs.com/package/@dheme/next) instead.

## Installation

```bash
npm install @dheme/react @dheme/sdk
```

```bash
yarn add @dheme/react @dheme/sdk
```

```bash
pnpm add @dheme/react @dheme/sdk
```

### Requirements

| Dependency   | Version  |
| ------------ | -------- |
| `react`      | >= 18    |
| `react-dom`  | >= 18    |
| `@dheme/sdk` | >= 1.1.0 |

`@dheme/sdk` is included as a dependency and will be installed automatically. You only need to install it explicitly if you want to use the SDK client directly.

## Quick Start

```tsx
import { DhemeProvider, DhemeScript } from '@dheme/react';

function App() {
  return (
    <>
      <DhemeScript />
      <DhemeProvider apiKey="dheme_abc12345_..." theme="#3b82f6">
        <YourApp />
      </DhemeProvider>
    </>
  );
}
```

That's it. Your app now has 19 CSS variables applied to `:root` — fully compatible with shadcn/ui and Tailwind CSS.

## How It Works

### First visit (no cache)

1. React mounts, `DhemeProvider` calls the Dheme API
2. Theme is applied as CSS variables on `:root`
3. Theme is cached in `localStorage` for next visit

### Subsequent visits (cached — zero FOUC)

1. `<DhemeScript>` runs a blocking `<script>` **before React mounts**
2. The script reads the cached theme from `localStorage` and applies CSS variables immediately
3. React mounts, `DhemeProvider` serves the cached theme and revalidates in background

The blocking script is ~800 bytes and runs synchronously, ensuring the page never flashes without styles.

## Components

### `<DhemeProvider>`

The main provider. Manages theme state, API calls, caching, and CSS variable application.

```tsx
<DhemeProvider
  apiKey="dheme_abc12345_..."    // Required — your Dheme API key
  theme="#3b82f6"                // Primary color (auto-generates on mount)
  themeParams={{                 // Optional generation params
    radius: 0.75,
    saturationAdjust: 10,
    secondaryColor: '#10b981',
  }}
  defaultMode="light"            // 'light' | 'dark' (default: 'light')
  persist={true}                 // Cache in localStorage (default: true)
  autoApply={true}               // Apply CSS vars automatically (default: true)
  onThemeChange={(theme) => {}}  // Callback when theme changes
  onModeChange={(mode) => {}}    // Callback when mode changes
  onError={(error) => {}}        // Callback on error
>
  <App />
</DhemeProvider>
```

| Prop            | Type                                     | Default   | Description                            |
| --------------- | ---------------------------------------- | --------- | -------------------------------------- |
| `apiKey`        | `string`                                 | -         | **Required.** Your Dheme API key.      |
| `theme`         | `string`                                 | -         | Primary HEX color. Auto-generates on mount. |
| `themeParams`   | `Omit<GenerateThemeRequest, 'theme'>`    | -         | Additional generation parameters.      |
| `defaultMode`   | `'light' \| 'dark'`                      | `'light'` | Initial color mode.                    |
| `baseUrl`       | `string`                                 | -         | Override API base URL.                 |
| `persist`       | `boolean`                                | `true`    | Cache theme in localStorage.           |
| `autoApply`     | `boolean`                                | `true`    | Apply CSS variables to `:root`.        |
| `onThemeChange` | `(theme: GenerateThemeResponse) => void` | -         | Called when theme data changes.        |
| `onModeChange`  | `(mode: ThemeMode) => void`              | -         | Called when mode changes.              |
| `onError`       | `(error: Error) => void`                 | -         | Called on API errors.                  |

### `<DhemeScript>`

Blocking script that prevents FOUC by applying cached theme CSS variables before React hydrates.

```tsx
<DhemeScript
  defaultMode="light"  // Fallback mode (default: 'light')
  nonce="abc123"       // CSP nonce (optional)
/>
```

Place it **before** `<DhemeProvider>` in your component tree, as high as possible.

| Prop          | Type                 | Default   | Description               |
| ------------- | -------------------- | --------- | ------------------------- |
| `defaultMode` | `'light' \| 'dark'`  | `'light'` | Fallback if no cache.     |
| `nonce`       | `string`             | -         | CSP nonce for the script. |

## Hooks

### `useTheme()`

Read theme data. Only re-renders when theme data or mode changes — **not** when loading state changes.

```tsx
import { useTheme } from '@dheme/react';

function MyComponent() {
  const { theme, mode, isReady } = useTheme();

  if (!isReady) return <Skeleton />;

  return (
    <p>Primary: {theme.colors[mode].primary.h}°</p>
  );
}
```

| Return    | Type                        | Description                           |
| --------- | --------------------------- | ------------------------------------- |
| `theme`   | `GenerateThemeResponse \| null` | The full theme data.              |
| `mode`    | `'light' \| 'dark'`        | Current color mode.                   |
| `isReady` | `boolean`                   | `true` once theme is loaded.          |

### `useThemeActions()`

Access actions and loading state. Components using this hook re-render on action state changes — components using only `useTheme()` do not.

```tsx
import { useThemeActions } from '@dheme/react';

function ThemeToggle() {
  const { setMode, isLoading } = useThemeActions();

  return (
    <button
      disabled={isLoading}
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
    >
      Toggle
    </button>
  );
}
```

| Return          | Type                                             | Description                     |
| --------------- | ------------------------------------------------ | ------------------------------- |
| `generateTheme` | `(params: GenerateThemeRequest) => Promise<void>` | Generate a new theme.          |
| `setMode`       | `(mode: ThemeMode) => void`                      | Switch light/dark mode.         |
| `clearTheme`    | `() => void`                                     | Clear theme and cache.          |
| `isLoading`     | `boolean`                                        | `true` during API call.         |
| `error`         | `Error \| null`                                  | Last error, if any.             |
| `client`        | `DhemeClient`                                    | Raw SDK client instance.        |

### `useGenerateTheme()`

Convenience hook with local loading state — useful when multiple components trigger generation independently.

```tsx
import { useGenerateTheme } from '@dheme/react';

function ColorPicker() {
  const { generateTheme, isGenerating, error } = useGenerateTheme();

  return (
    <button
      disabled={isGenerating}
      onClick={() => generateTheme({ theme: '#ef4444' })}
    >
      {isGenerating ? 'Generating...' : 'Apply Red'}
    </button>
  );
}
```

### `useDhemeClient()`

Direct access to the `DhemeClient` instance for advanced operations (e.g., `getUsage()`).

```tsx
import { useDhemeClient } from '@dheme/react';

function UsageInfo() {
  const client = useDhemeClient();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    client.getUsage().then(({ data }) => setUsage(data));
  }, [client]);

  return usage ? <p>{usage.remaining} requests left</p> : null;
}
```

## Context Splitting (Performance)

The provider uses **two separate React contexts** to minimize re-renders:

| Context               | Contains                             | Changes when                   |
| --------------------- | ------------------------------------ | ------------------------------ |
| `ThemeDataContext`     | `theme`, `mode`, `isReady`           | Theme data or mode changes     |
| `ThemeActionsContext`  | `generateTheme`, `setMode`, `isLoading`, `error` | Actions are triggered |

Components using `useTheme()` (data) **do not re-render** when `isLoading` changes.
Components using `useThemeActions()` (actions) **do not re-render** when theme data changes.

This prevents cascading re-renders in large component trees.

## Caching

Themes are cached in `localStorage` with deterministic keys based on input parameters:

```
same input params → same cache key → same theme
```

The cache key is derived from: `theme`, `secondaryColor`, `radius`, `saturationAdjust`, `lightnessAdjust`, `contrastAdjust`, `cardIsColored`, `backgroundIsColored`.

### Stale-while-revalidate

On cached visits, the provider:
1. Serves the cached theme **immediately** (zero latency)
2. Fires a background API request to check for updates
3. Only updates the UI if the response differs from the cache

This ensures instant page loads while keeping themes fresh.

## Mode Switching

Switching between light and dark mode **does not make an API call**. Both `colors.light` and `colors.dark` are included in a single API response, so mode switching is instant.

```tsx
const { setMode } = useThemeActions();

// Instant — no network request
setMode('dark');
```

The provider also syncs the `dark` class on `<html>` automatically.

## CSS Variables

The provider sets 19 CSS variables + `--radius` on `:root`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... 15 more tokens */
  --radius: 0.5rem;
}
```

Values are in shadcn/ui format (`h s% l%`), directly compatible with Tailwind CSS `hsl()` usage.

## Utilities

### `themeToCSS(theme, mode)`

Convert a `GenerateThemeResponse` to a CSS variable assignment string.

```typescript
import { themeToCSS } from '@dheme/react';

const css = themeToCSS(theme, 'light');
// "--background:0 0% 100%;--foreground:222.2 84% 4.9%;..."
```

### `applyThemeCSSVariables(theme, mode)`

Manually apply CSS variables to `:root`.

```typescript
import { applyThemeCSSVariables } from '@dheme/react';

applyThemeCSSVariables(theme, 'dark');
```

### `removeThemeCSSVariables()`

Remove all Dheme CSS variables from `:root`.

### `buildCacheKey(params)`

Generate the deterministic cache key for a set of params.

```typescript
import { buildCacheKey } from '@dheme/react';

const key = buildCacheKey({ theme: '#3b82f6', radius: 0.75 });
```

## Full Example (Vite)

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DhemeProvider, DhemeScript } from '@dheme/react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DhemeScript />
    <DhemeProvider
      apiKey={import.meta.env.VITE_DHEME_API_KEY}
      theme="#3b82f6"
      themeParams={{ radius: 0.5 }}
    >
      <App />
    </DhemeProvider>
  </React.StrictMode>,
);
```

```tsx
// App.tsx
import { useTheme, useThemeActions } from '@dheme/react';

export default function App() {
  const { theme, mode, isReady } = useTheme();
  const { setMode } = useThemeActions();

  if (!isReady) return <div>Loading theme...</div>;

  return (
    <div>
      <h1 style={{ color: `hsl(${theme.colors[mode].primary.h} ${theme.colors[mode].primary.s}% ${theme.colors[mode].primary.l}%)` }}>
        Dheme Theme
      </h1>
      <button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        {mode === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </div>
  );
}
```

## TypeScript

All types are exported:

```typescript
import type {
  ThemeMode,
  ThemeDataState,
  ThemeActionsState,
  DhemeProviderProps,
  DhemeScriptProps,
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/react';
```

## Related Packages

| Package        | Description                     | When to use                    |
| -------------- | ------------------------------- | ------------------------------ |
| `@dheme/sdk`   | Core TypeScript SDK             | Direct API access, Node.js     |
| `@dheme/react` | React bindings (this package)   | Vite, CRA, React SPAs         |
| `@dheme/next`  | Next.js App Router bindings     | Next.js 14+ with SSR           |

## License

MIT
