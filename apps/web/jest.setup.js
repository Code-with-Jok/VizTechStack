// Set environment variables for all tests
process.env.NODE_ENV = "development";

// Ensure React is available globally for tests that use JSX without explicit import
// or for mocks that run in a limited scope
// eslint-disable-next-line @typescript-eslint/no-require-imports
global.React = require("react");
