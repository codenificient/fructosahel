import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Landing Page Object Model
 * Handles the main landing/home page interactions
 */
export class LandingPage extends BasePage {
  // Locators
  readonly logo: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly ctaButton: Locator;
  readonly tryDemoButton: Locator;
  readonly learnMoreButton: Locator;
  readonly languageSwitcher: Locator;
  readonly navigationLinks: Locator;
  readonly featuresSection: Locator;
  readonly cropsSection: Locator;
  readonly statsSection: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator("a").filter({ hasText: "FructoSahel" }).first();
    this.heroTitle = page.locator("h1").first();
    this.heroSubtitle = page.locator("section").first().locator("p").first();
    this.ctaButton = page
      .getByRole("link", { name: /dashboard|tableau de bord/i })
      .first();
    this.tryDemoButton = page.getByRole("link", { name: /demo/i }).first();
    this.learnMoreButton = page
      .getByRole("link", { name: /learn more|en savoir plus/i })
      .first();
    this.languageSwitcher = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-globe") });
    this.navigationLinks = page.locator("nav a");
    this.featuresSection = page
      .locator("section")
      .filter({ hasText: /features|fonctionnalites/i })
      .first();
    this.cropsSection = page
      .locator("section")
      .filter({ hasText: /crops|cultures/i })
      .first();
    this.statsSection = page.locator("section.bg-primary");
    this.footer = page.locator("footer");
  }

  /**
   * Navigate to landing page with specified locale
   */
  async goto(locale: string = "en") {
    await super.goto(`/${locale}`);
    await this.waitForPageLoad();
  }

  /**
   * Get hero section title text
   */
  async getHeroTitle(): Promise<string> {
    return (await this.heroTitle.textContent()) ?? "";
  }

  /**
   * Click the main CTA button
   */
  async clickCTA() {
    await this.ctaButton.click();
  }

  /**
   * Click the Try Demo button
   */
  async clickTryDemo() {
    await this.tryDemoButton.click();
  }

  /**
   * Open language dropdown
   */
  async openLanguageSwitcher() {
    await this.languageSwitcher.click();
  }

  /**
   * Switch to a specific language
   */
  async switchLanguage(language: "English" | "Francais") {
    await this.openLanguageSwitcher();
    await this.page.getByRole("menuitem", { name: language }).click();
  }

  /**
   * Navigate to a page using the navigation links
   */
  async navigateTo(linkText: string) {
    await this.page.getByRole("link", { name: linkText }).first().click();
  }

  /**
   * Verify landing page loaded correctly
   */
  async verifyPageLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
  }

  /**
   * Check if stats section displays
   */
  async hasStatsSection(): Promise<boolean> {
    return this.statsSection.isVisible();
  }

  /**
   * Get navigation link count
   */
  async getNavigationLinkCount(): Promise<number> {
    return this.navigationLinks.count();
  }

  /**
   * Verify footer is visible
   */
  async verifyFooterVisible() {
    await expect(this.footer).toBeVisible();
  }

  /**
   * Click on a crop card
   */
  async clickCropCard(cropEmoji: string) {
    await this.page.locator(`a:has-text("${cropEmoji}")`).first().click();
  }
}
