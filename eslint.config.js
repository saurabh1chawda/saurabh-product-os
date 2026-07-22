/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig, globalIgnores } = require("eslint/config");
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

module.exports = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off"
    }
  },
  globalIgnores([
    ".next/**",
    ".pnpm-store/**",
    ".turbo/**",
    "coverage/**",
    "dist/**",
    "node_modules/**",
    "out/**",
    "tsconfig.tsbuildinfo"
  ])
]);
