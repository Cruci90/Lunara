// @ts-check
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4190",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx http-server . -p 4190 -c-1 --silent",
    url: "http://127.0.0.1:4190",
    reuseExistingServer: true,
    timeout: 20000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
