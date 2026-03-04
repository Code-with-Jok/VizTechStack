// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Dependency boundary rules for the monorepo.
 * Defines which layers can import which other layers.
 */
const dependencyBoundaryRules = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["../../apps/*", "../../../apps/*"],
          message:
            "Packages must not import from apps/. This violates the dependency boundary.",
        },
        {
          group: ["@viztechstack/*/src/*", "@viztechstack/*/dist/*"],
          message:
            "Do not import from internal paths. Use the package's public API (index.ts) instead.",
        },
      ],
    },
  ],
};

/**
 * Base ESLint config shared across all packages in the monorepo.
 * @param {object} options
 * @param {string} options.tsconfigRootDir - Root dir for tsconfig resolution
 * @param {"commonjs" | "module"} [options.sourceType="module"] - Source type
 * @returns {import("typescript-eslint").ConfigArray}
 */
export function createBaseConfig({ tsconfigRootDir, sourceType = "module" }) {
  return tseslint.config(
    {
      ignores: ["eslint.config.mjs", "dist/**", "node_modules/**"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
        sourceType,
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    {
      rules: {
        // TypeScript rules
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",

        // Prettier
        "prettier/prettier": ["error", { endOfLine: "auto" }],

        // Dependency boundaries
        ...dependencyBoundaryRules,
      },
    }
  );
}
