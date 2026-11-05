import { defineConfig, devices } from "@playwright/test";
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 12000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: externalBaseURL || "http://localhost:3000",
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
  },
  webServer: externalBaseURL ? undefined : {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
