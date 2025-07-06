import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  use: {
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: 'http://localhost:5173',
  },
});
