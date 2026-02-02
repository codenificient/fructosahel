import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Blog/Knowledge Base Page Object Model
 */
export class BlogPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly header: Locator;
  readonly footer: Locator;
  readonly cropGuides: Locator;
  readonly cropCards: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.pageSubtitle = page.locator("section").first().locator("p").first();
    this.header = page.locator("header");
    this.footer = page.locator("footer");
    this.cropGuides = page.locator("section").filter({ hasText: /guide/i });
    this.cropCards = page
      .locator('a[href*="/blog/"]')
      .filter({ has: page.locator('[class*="card"]') });
  }

  /**
   * Navigate to blog page
   */
  async goto(locale: string = "en") {
    await super.goto(`/${locale}/blog`);
    await this.waitForPageLoad();
  }

  /**
   * Verify blog page loaded
   */
  async verifyPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.header).toBeVisible();
  }

  /**
   * Get crop guide count
   */
  async getCropGuideCount(): Promise<number> {
    return this.cropCards.count();
  }

  /**
   * Navigate to a specific crop guide
   */
  async goToCropGuide(cropName: string) {
    await this.cropCards
      .filter({ hasText: new RegExp(cropName, "i") })
      .first()
      .click();
  }

  /**
   * Check if a specific crop guide exists
   */
  async hasCropGuide(cropName: string): Promise<boolean> {
    return this.cropCards
      .filter({ hasText: new RegExp(cropName, "i") })
      .first()
      .isVisible();
  }
}

/**
 * About Page Object Model
 */
export class AboutPage extends BasePage {
  readonly pageTitle: Locator;
  readonly header: Locator;
  readonly footer: Locator;
  readonly missionCard: Locator;
  readonly visionCard: Locator;
  readonly countriesSection: Locator;
  readonly countryCards: Locator;
  readonly teamSection: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.header = page.locator("header");
    this.footer = page.locator("footer");
    this.missionCard = page
      .locator('[class*="card"]')
      .filter({ hasText: /mission/i });
    this.visionCard = page
      .locator('[class*="card"]')
      .filter({ hasText: /vision/i });
    this.countriesSection = page
      .locator("section")
      .filter({ hasText: /countries|pays/i });
    this.countryCards = page
      .locator('[class*="card"]')
      .filter({ has: page.locator("text=/burkina|mali|niger/i") });
    this.teamSection = page
      .locator("section")
      .filter({ hasText: /team|equipe/i });
  }

  /**
   * Navigate to about page
   */
  async goto(locale: string = "en") {
    await super.goto(`/${locale}/about`);
    await this.waitForPageLoad();
  }

  /**
   * Verify about page loaded
   */
  async verifyPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.header).toBeVisible();
  }

  /**
   * Get country card count
   */
  async getCountryCount(): Promise<number> {
    return this.countryCards.count();
  }

  /**
   * Check if mission section is visible
   */
  async hasMissionSection(): Promise<boolean> {
    return this.missionCard.isVisible();
  }

  /**
   * Check if vision section is visible
   */
  async hasVisionSection(): Promise<boolean> {
    return this.visionCard.isVisible();
  }
}

/**
 * Contact Page Object Model
 */
export class ContactPage extends BasePage {
  readonly pageTitle: Locator;
  readonly header: Locator;
  readonly footer: Locator;
  readonly contactForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageTextarea: Locator;
  readonly submitButton: Locator;
  readonly contactInfoCard: Locator;
  readonly officesCard: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.header = page.locator("header");
    this.footer = page.locator("footer");
    this.contactForm = page.locator("form");
    this.nameInput = page.locator("#name");
    this.emailInput = page.locator("#email");
    this.subjectInput = page.locator("#subject");
    this.messageTextarea = page.locator("#message");
    this.submitButton = page.getByRole("button", { name: /submit|envoyer/i });
    this.contactInfoCard = page
      .locator('[class*="card"]')
      .filter({ hasText: /contact information|informations de contact/i });
    this.officesCard = page
      .locator('[class*="card"]')
      .filter({ hasText: /regional offices|bureaux regionaux/i });
  }

  /**
   * Navigate to contact page
   */
  async goto(locale: string = "en") {
    await super.goto(`/${locale}/contact`);
    await this.waitForPageLoad();
  }

  /**
   * Verify contact page loaded
   */
  async verifyPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.contactForm).toBeVisible();
  }

  /**
   * Fill out contact form
   */
  async fillForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.subjectInput.fill(data.subject);
    await this.messageTextarea.fill(data.message);
  }

  /**
   * Submit contact form
   */
  async submitForm() {
    await this.submitButton.click();
  }

  /**
   * Check if contact info is displayed
   */
  async hasContactInfo(): Promise<boolean> {
    return this.contactInfoCard.isVisible();
  }

  /**
   * Check if offices list is displayed
   */
  async hasOfficesList(): Promise<boolean> {
    return this.officesCard.isVisible();
  }
}
