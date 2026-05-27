import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run unit tests with `.test.` filenames (exclude Playwright `.spec.` files)
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.js'
  }
});
