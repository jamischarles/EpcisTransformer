import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use ESM mode for TypeScript files
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: true,
    // Increase timeout for potentially slow API calls
    testTimeout: 20000,
  },
});