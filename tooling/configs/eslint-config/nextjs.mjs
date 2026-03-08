// @ts-check
/**
 * ESLint config for Next.js apps.
 * Next.js uses its own eslint-config-next which handles most rules.
 * This file re-exports a helper to merge with the base config if needed.
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * @returns {import("eslint").Linter.Config[]}
 */
export function createNextjsConfig() {
  return defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
    {
      rules: {
        // Add shared Next.js rules here
      },
    },
  ]);
}
