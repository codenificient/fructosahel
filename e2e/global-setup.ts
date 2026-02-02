import { FullConfig } from "@playwright/test";

/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log("Global setup running...");

  // Any global setup logic can go here
  // For example:
  // - Set up test database
  // - Clear test data
  // - Initialize external services

  console.log("Global setup complete");
}

export default globalSetup;
