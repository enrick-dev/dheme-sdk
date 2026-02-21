import { defineConfig } from 'tsup';

export default defineConfig([
  // Client bundle — DhemeProvider, ThemeGenerator, hooks
  // 'use client' tells Next.js RSC bundler this is a client boundary
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: ['react', 'react-dom', 'next', '@dheme/sdk', '@dheme/react'],
    tsconfig: 'tsconfig.build.json',
    banner: {
      js: "'use client';",
    },
  },
  // Server bundle — DhemeScript (async Server Component), generateThemeStyles, cache, cookies
  // No 'use client' — runs in RSC context
  {
    entry: { server: 'src/server.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['react', 'react-dom', 'next', '@dheme/sdk', '@dheme/react', '@dheme/react/utils'],
    tsconfig: 'tsconfig.build.json',
  },
]);
