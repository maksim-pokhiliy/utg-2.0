import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

const BASE_URL = `http://127.0.0.1:${PORT}`;

const WEB_SERVER_TIMEOUT = 120_000;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `yarn start --port ${PORT}`,
    url: `${BASE_URL}/uk`,
    reuseExistingServer: !process.env.CI,
    timeout: WEB_SERVER_TIMEOUT,
    env: {
      PLACE_ORDER_URL: "",
      EXCHANGE_RATE_API_URL: "",
      EXCHANGE_RATE_API_KEY: "",
    },
  },
});
