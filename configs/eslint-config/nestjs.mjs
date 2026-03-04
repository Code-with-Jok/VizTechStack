// @ts-check
import globals from "globals";
import { createBaseConfig } from "./base.mjs";

/**
 * ESLint config for NestJS apps.
 * @param {object} options
 * @param {string} options.tsconfigRootDir - Root dir for tsconfig resolution
 * @returns {import("typescript-eslint").ConfigArray}
 */
export function createNestjsConfig({ tsconfigRootDir }) {
  const base = createBaseConfig({
    tsconfigRootDir,
    sourceType: "commonjs",
  });

  return [
    ...base,
    {
      languageOptions: {
        globals: {
          ...globals.jest,
        },
      },
    },
  ];
}
