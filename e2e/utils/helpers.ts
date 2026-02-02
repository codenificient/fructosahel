import { Page, expect } from "@playwright/test";

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 30000) {
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Wait for a specific API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000,
) {
  return page.waitForResponse(urlPattern, { timeout });
}

/**
 * Check if page has no console errors
 */
export async function checkNoConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(page: Page, ms: number = 500) {
  await page.waitForTimeout(ms);
}

/**
 * Get text content of multiple elements
 */
export async function getAllTextContent(
  page: Page,
  selector: string,
): Promise<string[]> {
  const elements = page.locator(selector);
  const count = await elements.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await elements.nth(i).textContent();
    if (text) texts.push(text.trim());
  }
  return texts;
}

/**
 * Check if element is visible and enabled
 */
export async function isInteractive(
  page: Page,
  selector: string,
): Promise<boolean> {
  const element = page.locator(selector);
  const isVisible = await element.isVisible();
  const isEnabled = await element.isEnabled();
  return isVisible && isEnabled;
}

/**
 * Test locale switching
 */
export async function switchLocale(page: Page, targetLocale: "en" | "fr") {
  const currentUrl = page.url();
  const newUrl = currentUrl.replace(/\/(en|fr)\//, `/${targetLocale}/`);
  await page.goto(newUrl);
  await waitForNetworkIdle(page);
}

/**
 * Verify page has required elements
 */
export async function verifyPageStructure(
  page: Page,
  requiredSelectors: string[],
): Promise<boolean> {
  for (const selector of requiredSelectors) {
    const isVisible = await page.locator(selector).first().isVisible();
    if (!isVisible) {
      console.log(`Missing element: ${selector}`);
      return false;
    }
  }
  return true;
}

/**
 * Generate random test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    subject: `Test Subject ${timestamp}`,
    message: `This is a test message generated at ${new Date().toISOString()}`,
  };
}

/**
 * Supported locales
 */
export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Test data for different locales
 */
export const LOCALE_DATA = {
  en: {
    home: "Home",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    dashboard: "Dashboard",
    demo: "Demo",
    farms: "Farms",
    tasks: "Tasks",
    finance: "Finance",
  },
  fr: {
    home: "Accueil",
    about: "A propos",
    blog: "Blog",
    contact: "Contact",
    dashboard: "Tableau de bord",
    demo: "Demo",
    farms: "Fermes",
    tasks: "Taches",
    finance: "Finance",
  },
};
