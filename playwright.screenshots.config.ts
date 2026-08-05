import { defineConfig, devices } from "@playwright/test";

const PORT = 3101;

const BASE_URL = `http://127.0.0.1:${PORT}`;

const WEB_SERVER_TIMEOUT = 120_000;

const VIEWPORT = { width: 1280, height: 800 };

export default defineConfig({
  testDir: "./screenshots",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: VIEWPORT },
    },
  ],
  webServer: {
    command: `yarn start --port ${PORT}`,
    url: `${BASE_URL}/uk`,
    reuseExistingServer: false,
    timeout: WEB_SERVER_TIMEOUT,
    env: {
      PLACE_ORDER_URL: "",
      EXCHANGE_RATE_API_URL: "",
      EXCHANGE_RATE_API_KEY: "",
      NOVA_POSHTA_API_KEY: "",
    },
  },
});
