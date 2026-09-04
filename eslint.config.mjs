import next from "eslint-config-next";

/**
 * Flat config. eslint-config-next ships its rules as an array, so it spreads
 * straight in — Next 16 no longer wraps linting in `next lint`.
 */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...next,
];

export default config;
