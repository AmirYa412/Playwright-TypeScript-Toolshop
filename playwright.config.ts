import { defineConfig, devices } from '@playwright/test';
import { resolveBaseUrls } from '@environments/index';

const { webUrl } = resolveBaseUrls();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
  ],
  outputDir: 'reports/artifacts',
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
  },
  projects: [
    {
      // Browserless by construction: scoped to tests/api AND tagged @api, backed by fixtures/api.ts
      // whose type has no page/context/browser fixture to request in the first place.
      name: 'api',
      testDir: './tests/api',
      grep: /@api/,
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      grep: /@ui/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: webUrl,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
  ],
});
