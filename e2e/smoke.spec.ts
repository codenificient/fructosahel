import { test, expect } from "@playwright/test";

/**
 * Smoke tests to verify basic application functionality
 * These tests are designed to run quickly and catch critical issues
 */
test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/fructosahel/i);
  });

  test("demo page loads without authentication", async ({ page }) => {
    await page.goto("/en/demo");
    await expect(page.locator("main")).toBeVisible();
  });

  test("public pages are accessible", async ({ page }) => {
    // Test About page
    await page.goto("/en/about");
    await expect(page.locator("h1")).toBeVisible();

    // Test Blog page
    await page.goto("/en/blog");
    await expect(page.locator("h1")).toBeVisible();

    // Test Contact page
    await page.goto("/en/contact");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("navigation header is present", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=FructoSahel")).toBeVisible();
  });

  test("French locale works", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("demo dashboard navigation works", async ({ page }) => {
    await page.goto("/en/demo");

    // Navigate to farms
    await page
      .getByRole("link", { name: /farms|fermes/i })
      .first()
      .click();
    await expect(page).toHaveURL(/demo\/farms/);

    // Navigate to finance
    await page.goto("/en/demo");
    await page
      .getByRole("link", { name: /finance/i })
      .first()
      .click();
    await expect(page).toHaveURL(/demo\/finance/);
  });
});
