// @ts-check
import { createNestjsConfig } from '@viztechstack/eslint-config/nestjs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  ...createNestjsConfig({
    tsconfigRootDir: import.meta.dirname ?? __dirname,
  }),
  {
    files: ['**/__tests__/**/*.ts', '**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
];

