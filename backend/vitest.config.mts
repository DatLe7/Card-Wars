import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: [...configDefaults.exclude, 'build/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/server.ts',
        '**/index.ts',
        '**/index.d.ts',
        'build/**',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
