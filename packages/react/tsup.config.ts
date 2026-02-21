import { defineConfig } from 'tsup';

export default defineConfig([
  // Client bundle — Provider, hooks, ThemeGenerator
  // 'use client' marks this as a client boundary for Next.js RSC bundler
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: ['react', 'react-dom', '@dheme/sdk'],
    tsconfig: 'tsconfig.build.json',
    banner: {
      js: "'use client';",
    },
  },
  // Utils bundle — pure functions (no React, no hooks)
  // Safe to import from Next.js Server Components and Route Handlers
  {
    entry: { utils: 'src/utils.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['@dheme/sdk'],
    tsconfig: 'tsconfig.build.json',
  },
]);
