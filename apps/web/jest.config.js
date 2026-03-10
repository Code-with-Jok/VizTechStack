/** @type {import('jest').Config} */
module.exports = {
    displayName: 'web',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: '.',
    testMatch: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.spec.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
    ],
    coverageDirectory: 'coverage',
    testTimeout: 10000,
    setupFiles: ['<rootDir>/jest.setup.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.js'],
};
