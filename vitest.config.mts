import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // lib/ holds the pure logic where a mistake is silent. A couple of
    // component tests cover structural behaviour that can't be eyeballed.
    include: ["lib/**/*.test.ts", "components/**/*.test.tsx"],
    setupFiles: ["test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
