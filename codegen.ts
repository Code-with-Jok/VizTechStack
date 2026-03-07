import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // ============================================
  // GraphQL Schema Source
  // ============================================
  // Option 1: Use running GraphQL server (recommended for development)
  // schema: 'http://localhost:4000/graphql',

  // Option 2: Use local schema files (recommended for CI/CD)
  // Using local files since API server is not running
  schema: 'packages/shared/graphql-schema/src/**/*.graphql',

  // ============================================
  // Client-side Operations (Queries & Mutations)
  // ============================================
  // These are the GraphQL operations used in your frontend code
  // Comment out for initial generation (no operations yet)
  // documents: [
  //   'apps/web/src/**/*.{ts,tsx}',
  //   'packages/shared/api-client/src/**/*.{ts,tsx}',
  // ],

  // ============================================
  // Code Generation Outputs
  // ============================================
  generates: {
    // 1. TypeScript Types
    // Generates TypeScript type definitions from GraphQL schema
    'packages/shared/graphql-generated/src/types.ts': {
      plugins: ['typescript'],
      config: {
        // Scalar type mappings
        scalars: {
          ID: 'string',
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },
        // Use TypeScript enums as types (not const enums)
        enumsAsTypes: true,
        // Future-proof enum handling
        futureProofEnums: true,
        // Add __typename field to all types
        addTypename: true,
        // Handle nullable values
        maybeValue: 'T | null | undefined',
      },
    },

    // 2. Zod Validation Schemas
    // Generates Zod schemas for runtime validation
    'packages/shared/graphql-generated/src/zod-schemas.ts': {
      plugins: ['typescript', 'graphql-codegen-typescript-validation-schema'],
      config: {
        // Use Zod for validation
        schema: 'zod',
        // Don't import types from types.ts to avoid conflicts
        // importFrom: './types',
        // Validation schema export type
        validationSchemaExportType: 'const',
        // Use TypeScript type imports
        useTypeImports: true,
        // Scalar validation schemas
        scalarSchemas: {
          ID: 'z.string()',
          DateTime: 'z.string().datetime()',
          JSON: 'z.record(z.unknown())',
        },
        // Enum handling
        enumsAsTypes: true,
        // Scalar type mappings
        scalars: {
          ID: 'string',
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },
      },
    },

    // 3. Operations (Queries & Mutations)
    // Uncomment when you have GraphQL operations in your code
    // 'packages/shared/graphql-generated/src/operations.ts': {
    //   plugins: ['typescript', 'typescript-operations'],
    //   config: {
    //     avoidOptionals: false,
    //     addTypename: true,
    //   },
    // },

    // 4. React Apollo Hooks
    // Uncomment when you have GraphQL operations in your code
    // 'packages/shared/graphql-generated/src/hooks.ts': {
    //   plugins: [
    //     'typescript',
    //     'typescript-operations',
    //     'typescript-react-apollo',
    //   ],
    //   config: {
    //     withHooks: true,
    //     withComponent: false,
    //     withHOC: false,
    //     reactApolloVersion: 3,
    //     addTypename: true,
    //   },
    // },
  },

  // ============================================
  // Global Configuration
  // ============================================
  config: {
    // Don't skip __typename field
    skipTypename: false,
    // Use TypeScript type imports
    useTypeImports: true,
  },

  // ============================================
  // Watch Mode (for development)
  // ============================================
  // Automatically regenerate when schema or operations change
  watch: process.env.NODE_ENV === 'development',

  // ============================================
  // Post-generation Hooks
  // ============================================
  // Run these commands after generating files
  hooks: {
    afterAllFileWrite: [
      'prettier --write',
      // 'eslint --fix',  // Uncomment if you want to auto-fix ESLint errors
    ],
  },
};

export default config;
