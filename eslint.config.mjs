import tseslint from "typescript-eslint";

/*
 * ESLint 9 flat config for cppFan.
 *
 * The official eslint-config-next shareable config currently throws a circular
 * structure error when loaded through @eslint/eslintrc FlatCompat with these
 * package versions, so we use a minimal, reliable typescript-eslint config that
 * actually parses and lints .ts/.tsx app source. Only generated/output folders
 * are ignored.
 */
export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "out/**",
      "dist/**"
    ]
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      // Allow intentionally-unused identifiers when prefixed with `_`.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
      ]
    }
  }
);
