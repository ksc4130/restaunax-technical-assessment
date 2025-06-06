import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import vitest from "eslint-plugin-vitest";
import globals from "globals";

export default [
  {
    ignores: ["coverage", "dist", "processes.config.js", "**/templates"]
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      "@typescript-eslint": typescriptEslint
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/camelcase": 0,
      "@typescript-eslint/no-inferrable-types": 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "@typescript-eslint/no-unused-vars": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-non-null-assertion": 0
    }
  },
  {
    files: ["**/*.spec.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"], // or any other pattern
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      "vitest/consistent-test-it": ["error", { fn: "it", withinDescribe: "it" }],
      "vitest/no-alias-methods": "error"
    }
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      parserOptions: {}
    },
    plugins: {
      "simple-import-sort": pluginSimpleImportSort
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error"
    }
  },
  pluginPrettierRecommended
];
