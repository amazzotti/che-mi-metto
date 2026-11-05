import { defineConfig, devices } from '@playwright/test';

const PORTA = 4173;

/**
 * Test end-to-end sulla build di produzione:
 * - "iphone": WebKit (il motore di Safari) con schermo e touch di un iPhone;
 * - "android": Chromium con schermo di un Pixel;
 * - "screenshot": genera le immagini del README (npm run screenshots).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
    // Il service worker intercetterebbe le chiamate meteo finte dei test.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 15'] }, testIgnore: /screenshot/ },
    { name: 'android', use: { ...devices['Pixel 7'] }, testIgnore: /screenshot/ },
    {
      name: 'screenshot',
      use: { ...devices['iPhone 15'], defaultBrowserType: 'chromium' },
      testMatch: /screenshot\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORTA} --strictPort`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
