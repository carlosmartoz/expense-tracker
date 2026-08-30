import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // Only lib/ is covered: it holds the pure logic where a mistake is silent.
    include: ["lib/**/*.test.ts"],
    setupFiles: ["test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
