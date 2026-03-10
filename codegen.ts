import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'packages/shared/graphql-schema/src/**/*.graphql',
    documents: ['apps/web/src/**/*.{ts,tsx}'],
    generates: {
        'packages/shared/graphql-generated/src/types.ts': {
            plugins: ['typescript'],
            config: {
                skipTypename: false,
                withHooks: false,
                withHOC: false,
                withComponent: false,
            },
        },
        'packages/shared/graphql-generated/src/operations.ts': {
            plugins: ['typescript', 'typescript-operations'],
            config: {
                skipTypename: false,
                withHooks: false,
                withHOC: false,
                withComponent: false,
            },
        },
        'packages/shared/graphql-generated/src/hooks.ts': {
            preset: 'import-types-preset',
            presetConfig: {
                typesPath: './types',
            },
            plugins: ['typescript-react-apollo'],
            config: {
                withHooks: true,
                withHOC: false,
                withComponent: false,
            },
        },
        'packages/shared/graphql-generated/src/schemas.ts': {
            plugins: ['graphql-codegen-typescript-validation-schema'],
            config: {
                schema: 'zod',
                importFrom: './types',
                withObjectType: true,
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
