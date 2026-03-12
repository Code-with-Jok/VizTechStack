/** @type {import('jest').Config} */
module.exports = {
    displayName: 'web',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: '.',
    testMatch: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.spec.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
        '^.+\\.mjs$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@clerk/.*|@apollo/.*|d3-hierarchy|d3-selection|d3-zoom|d3-drag|d3-scale|d3-array|d3-shape|d3-path|d3-interpolate|d3-color|d3-format|d3-time|d3-time-format)/)',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^d3-hierarchy$': '<rootDir>/__mocks__/d3-hierarchy.js',
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
