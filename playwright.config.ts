import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // website can take 10-30 s to initialize before a test even starts
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [['list', { printSteps: true }], ['html']],
  use: {
    baseURL: 'https://winwin.travel',
    testIdAttribute: 'data-wwt-id',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
