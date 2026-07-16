import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
  {
    ignores: ["coverage/**", "lib/**", "node_modules/**", "playwright-report/**", "test-results/**", "types/**"],
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.nodeBuiltin,
      },
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-constant-binary-expression": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["test/**/*.js"],
    rules: {
      "no-sparse-arrays": "off",
    },
  },
]);
