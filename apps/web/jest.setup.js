// Set environment variables for all tests
process.env.NODE_ENV = "development";

// Add fetch polyfill for Apollo Client tests
import 'whatwg-fetch';

// Ensure React is available globally for tests that use JSX without explicit import
// or for mocks that run in a limited scope
import React from 'react';
global.React = React;
