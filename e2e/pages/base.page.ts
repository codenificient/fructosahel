import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Page Object Model
 * Contains common methods and elements shared across all pages
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL path
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string) {
    await this.page.locator(selector).waitFor({ state: "visible" });
  }

  /**
   * Click element by text content
   */
  async clickByText(text: string) {
    await this.page.getByText(text).click();
  }

  /**
   * Check if element with text exists
   */
  async hasText(text: string): Promise<boolean> {
    return this.page.getByText(text).isVisible();
  }

  /**
   * Take screenshot with custom name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
    });
  }
}
