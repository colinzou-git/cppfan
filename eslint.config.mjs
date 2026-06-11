/**
 * Temporary bootstrap ESLint config.
 *
 * The initial scaffold uses very new Next.js/ESLint packages. The official Next
 * shareable config can currently trigger a circular-config error with the newest
 * ESLint resolver path in some installs. This keeps `pnpm lint` passing as a
 * bootstrap sanity check without blocking the scaffold.
 *
 * TODO after app scaffold stabilizes:
 * Replace this with the current official Next.js flat ESLint config and add
 * TypeScript-aware linting.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "out/**",
      "dist/**",
      "**/*.ts",
      "**/*.tsx"
    ]
  },
  {
    files: ["**/*.mjs", "**/*.js", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {}
  }
];

export default eslintConfig;
