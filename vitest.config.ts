import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['test-modern/setup.ts'],
    include: ['test-modern/**/*.test.ts', 'test-modern/**/*.test.tsx'],
  },
});
