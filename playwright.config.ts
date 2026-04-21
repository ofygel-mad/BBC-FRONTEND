import { defineConfig, devices } from '@playwright/test'

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:password@127.0.0.1:5432/salyk_ci'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter ./backend exec tsx src/index.ts',
      url: 'http://127.0.0.1:4000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        DATABASE_URL: databaseUrl,
        FRONTEND_URL: 'http://127.0.0.1:3000',
        JWT_SECRET: process.env.JWT_SECRET ?? 'test-secret-key-with-at-least-32-chars',
        PORT: '4000',
      },
    },
    {
      command: 'pnpm --filter ./frontend exec vite --host 127.0.0.1 --port 3000',
      url: 'http://127.0.0.1:3000/index.html',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        VITE_API_URL: 'http://127.0.0.1:4000',
        VITE_MOCK: 'false',
      },
    },
  ],
})
