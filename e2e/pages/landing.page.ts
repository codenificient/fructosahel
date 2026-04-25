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
    // The language switcher is a single Link in the header that toggles between
    // /en and /fr. It renders the target locale label ("FR" when on EN, "EN"
    // when on FR) alongside a flag emoji, so the accessible name is something
    // like "🇫🇷 FR" or "🇬🇧 EN". Match the accessible name ending in just
    // the locale code; this avoids the brand logo link (whose accessible name
    // is "FructoSahel") even though both share the href "/en" or "/fr".
    this.languageSwitcher = page
      .locator("header")
      .getByRole("link", { name: /\b(EN|FR)$/ });
    this.navigationLinks = page.locator("nav a");
    this.featuresSection = page
      .locator("section")
      .filter({ hasText: /features|fonctionnalites/i })
      .first();
    this.cropsSection = page
      .locator("section")
      .filter({ hasText: /crops|cultures/i })
      .first();
    // The stats section no longer uses "bg-primary"; it uses an overlaid
    // gradient ("gradient-sahel") and is anchored by the headline numbers
    // "50+" and "1,200" rendered inside it. Locate the section by its
    // first headline value to make the selector resilient to styling churn.
    this.statsSection = page
      .locator("section")
      .filter({ hasText: /50\+/ })
      .first();
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
   * Click the locale toggle in the header. Unlike older builds this is no
   * longer a dropdown — it is a direct link to the other locale.
   */
  async openLanguageSwitcher() {
    await this.languageSwitcher.click();
  }

  /**
   * Switch to a specific language. The header now exposes a direct link to
   * the *other* locale (labelled "FR" when on EN and "EN" when on FR), so a
   * single click is enough — no dropdown menuitem to follow. The caller is
   * responsible for asserting the resulting URL (it differs depending on
   * whether the target locale is the default; see `localePrefix: "as-needed"`
   * in i18n/routing.ts).
   */
  async switchLanguage(_language: "English" | "Francais") {
    await this.openLanguageSwitcher();
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
