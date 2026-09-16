import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests import application code through the same `@/*` alias that `tsconfig.json`
// defines, so the alias has to be repeated here — Vitest does not read tsconfig paths.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Everything under test is plain Node code (filesystem, URL parsing, metadata
    // route handlers). No DOM environment is needed, and none is installed.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
