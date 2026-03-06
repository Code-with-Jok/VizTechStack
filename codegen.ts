import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['packages/shared/graphql-schema/src/schema.graphql'],
  documents: ['packages/shared/graphql-schema/src/operations/**/*.graphql'],
  ignoreNoDocuments: false,
  generates: {
    'packages/shared/graphql-generated/src/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        enumsAsTypes: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: true,
          defaultValue: true,
        },
      },
    },
    'packages/shared/validation/src/generated/graphql-zod.ts': {
      plugins: ['typescript-zod'],
      config: {
        zodImportPath: 'zod',
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
