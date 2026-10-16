import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // The `@/` alias lives in tsconfig paths; carry it into vite explicitly
    // now that a vitest config file exists.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    coverage: {
      // The suite is Node-only on purpose (no React rendering): it pins the
      // data/logic modules and the generated routes. `all: true` over this
      // explicit scope means a new lib module without tests lowers the number
      // instead of silently not being measured at all — the pages and
      // components are exercised by the build and the browser, not here.
      all: true,
      include: ['src/lib/**/*.ts', 'src/app/robots.ts', 'src/app/sitemap.ts'],
      reporter: ['text'],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 90 },
    },
  },
});
