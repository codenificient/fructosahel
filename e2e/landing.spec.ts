import { test, expect } from "./fixtures/test-fixtures";
import { LOCALES, waitForNetworkIdle } from "./utils";

test.describe("Landing Page", () => {
  test.describe("Page Loading", () => {
    test("should load the landing page correctly in English", async ({
      landingPage,
    }) => {
      await landingPage.goto("en");
      await landingPage.verifyPageLoaded();

      // Verify hero section
      const heroTitle = await landingPage.getHeroTitle();
      expect(heroTitle).toBeTruthy();
    });

    test("should load the landing page correctly in French", async ({
      landingPage,
    }) => {
      await landingPage.goto("fr");
      await landingPage.verifyPageLoaded();

      // Verify hero section
      const heroTitle = await landingPage.getHeroTitle();
      expect(heroTitle).toBeTruthy();
    });

    test("should display all main sections", async ({ landingPage }) => {
      await landingPage.goto("en");

      // Verify hero section
      await expect(landingPage.heroTitle).toBeVisible();

      // Verify CTA buttons
      await expect(landingPage.ctaButton).toBeVisible();
      await expect(landingPage.tryDemoButton).toBeVisible();

      // Verify footer
      await landingPage.verifyFooterVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should have working navigation links", async ({
      landingPage,
      page,
    }) => {
      await landingPage.goto("en");

      // Test About link
      await landingPage.navigateTo("About");
      await page.waitForURL("**/about");
      expect(page.url()).toContain("/about");

      // Go back and test Blog
      await landingPage.goto("en");
      await landingPage.navigateTo("Blog");
      await page.waitForURL("**/blog");
      expect(page.url()).toContain("/blog");

      // Go back and test Contact
      await landingPage.goto("en");
      await landingPage.navigateTo("Contact");
      await page.waitForURL("**/contact");
      expect(page.url()).toContain("/contact");
    });

    test("should navigate to demo from CTA", async ({ landingPage, page }) => {
      await landingPage.goto("en");
      await landingPage.clickTryDemo();
      await page.waitForURL("**/demo");
      expect(page.url()).toContain("/demo");
    });

    test("should navigate to dashboard from main CTA", async ({
      landingPage,
      page,
    }) => {
      await landingPage.goto("en");
      await landingPage.clickCTA();
      await page.waitForURL("**/dashboard**");
      expect(page.url()).toContain("/dashboard");
    });
  });

  test.describe("Language Switcher", () => {
    test("should switch from English to French", async ({
      landingPage,
      page,
    }) => {
      await landingPage.goto("en");
      expect(page.url()).toContain("/en");

      await landingPage.switchLanguage("Francais");
      await page.waitForURL("**/fr");
      expect(page.url()).toContain("/fr");
    });

    test("should switch from French to English", async ({
      landingPage,
      page,
    }) => {
      await landingPage.goto("fr");
      expect(page.url()).toContain("/fr");

      await landingPage.switchLanguage("English");
      await page.waitForURL("**/en");
      expect(page.url()).toContain("/en");
    });

    test("should preserve locale in navigation", async ({
      landingPage,
      page,
    }) => {
      // Start in French
      await landingPage.goto("fr");

      // Navigate to About
      await landingPage.navigateTo("A propos");
      await page.waitForURL("**/fr/about");
      expect(page.url()).toContain("/fr/about");
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile viewport", async ({
      page,
      landingPage,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await landingPage.goto("en");
      await landingPage.verifyPageLoaded();

      // Verify mobile menu button is visible
      const mobileMenuButton = page
        .locator("button")
        .filter({ has: page.locator("svg.lucide-menu") });
      await expect(mobileMenuButton).toBeVisible();
    });

    test("should display correctly on tablet viewport", async ({
      page,
      landingPage,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await landingPage.goto("en");
      await landingPage.verifyPageLoaded();
    });
  });

  test.describe("Statistics Section", () => {
    test("should display stats section with data", async ({
      landingPage,
      page,
    }) => {
      await landingPage.goto("en");

      // Check for stats
      const hasStats = await landingPage.hasStatsSection();
      expect(hasStats).toBeTruthy();

      // Verify specific stat values are present
      await expect(page.getByText("50+")).toBeVisible();
      await expect(page.getByText("1,200")).toBeVisible();
    });
  });

  test.describe("Crops Section", () => {
    test("should display crop cards", async ({ landingPage, page }) => {
      await landingPage.goto("en");

      // Check for crop emojis
      await expect(page.locator('text="🍍"').first()).toBeVisible();
      await expect(page.locator('text="🥜"').first()).toBeVisible();
      await expect(page.locator('text="🥑"').first()).toBeVisible();
    });

    test("should navigate to crop guide when clicked", async ({
      landingPage,
      page,
    }) => {
      await landingPage.goto("en");

      // Click on pineapple crop card
      await page.locator('a[href*="/blog/pineapple"]').first().click();
      await page.waitForURL("**/blog/pineapple");
      expect(page.url()).toContain("/blog/pineapple");
    });
  });
});
