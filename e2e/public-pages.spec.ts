import { test, expect } from "./fixtures/test-fixtures";

test.describe("Public Pages", () => {
  test.describe("About Page", () => {
    test("should load about page correctly in English", async ({
      aboutPage,
    }) => {
      await aboutPage.goto("en");
      await aboutPage.verifyPageLoaded();

      // Verify page title
      await expect(aboutPage.pageTitle).toContainText(/about/i);
    });

    test("should load about page correctly in French", async ({
      aboutPage,
    }) => {
      await aboutPage.goto("fr");
      await aboutPage.verifyPageLoaded();

      // Verify page title
      await expect(aboutPage.pageTitle).toContainText(/propos/i);
    });

    test("should display mission and vision sections", async ({
      aboutPage,
    }) => {
      await aboutPage.goto("en");

      const hasMission = await aboutPage.hasMissionSection();
      const hasVision = await aboutPage.hasVisionSection();

      expect(hasMission).toBeTruthy();
      expect(hasVision).toBeTruthy();
    });

    test("should display operating countries", async ({ aboutPage }) => {
      await aboutPage.goto("en");

      const countryCount = await aboutPage.getCountryCount();
      expect(countryCount).toBeGreaterThanOrEqual(3);
    });

    test("should display team section", async ({ aboutPage, page }) => {
      await aboutPage.goto("en");

      await expect(aboutPage.teamSection).toBeVisible();
      // Check for team roles
      await expect(
        page.getByText(/agricultural experts|experts agricoles/i).first(),
      ).toBeVisible();
    });
  });

  test.describe("Blog Page", () => {
    test("should load blog page correctly in English", async ({ blogPage }) => {
      await blogPage.goto("en");
      await blogPage.verifyPageLoaded();

      // Verify page title
      await expect(blogPage.pageTitle).toContainText(/blog|knowledge/i);
    });

    test("should load blog page correctly in French", async ({ blogPage }) => {
      await blogPage.goto("fr");
      await blogPage.verifyPageLoaded();
    });

    test("should display crop guides", async ({ blogPage }) => {
      await blogPage.goto("en");

      const guideCount = await blogPage.getCropGuideCount();
      expect(guideCount).toBeGreaterThanOrEqual(6);
    });

    test("should have pineapple guide", async ({ blogPage }) => {
      await blogPage.goto("en");

      const hasPineapple = await blogPage.hasCropGuide("Pineapple");
      expect(hasPineapple).toBeTruthy();
    });

    test("should have cashew guide", async ({ blogPage }) => {
      await blogPage.goto("en");

      const hasCashew = await blogPage.hasCropGuide("Cashew");
      expect(hasCashew).toBeTruthy();
    });

    test("should have mango guide", async ({ blogPage }) => {
      await blogPage.goto("en");

      const hasMango = await blogPage.hasCropGuide("Mango");
      expect(hasMango).toBeTruthy();
    });

    test("should navigate to crop guide when clicked", async ({
      blogPage,
      page,
    }) => {
      await blogPage.goto("en");
      await blogPage.goToCropGuide("Pineapple");
      await page.waitForURL("**/blog/pineapple");
      expect(page.url()).toContain("/blog/pineapple");
    });
  });

  test.describe("Contact Page", () => {
    test("should load contact page correctly in English", async ({
      contactPage,
    }) => {
      await contactPage.goto("en");
      await contactPage.verifyPageLoaded();

      // Verify page title
      await expect(contactPage.pageTitle).toContainText(/contact/i);
    });

    test("should load contact page correctly in French", async ({
      contactPage,
    }) => {
      await contactPage.goto("fr");
      await contactPage.verifyPageLoaded();
    });

    test("should display contact form", async ({ contactPage }) => {
      await contactPage.goto("en");

      await expect(contactPage.contactForm).toBeVisible();
      await expect(contactPage.nameInput).toBeVisible();
      await expect(contactPage.emailInput).toBeVisible();
      await expect(contactPage.subjectInput).toBeVisible();
      await expect(contactPage.messageTextarea).toBeVisible();
      await expect(contactPage.submitButton).toBeVisible();
    });

    test("should allow filling out the form", async ({ contactPage }) => {
      await contactPage.goto("en");

      await contactPage.fillForm({
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "This is a test message for the contact form.",
      });

      // Verify form fields are filled
      await expect(contactPage.nameInput).toHaveValue("Test User");
      await expect(contactPage.emailInput).toHaveValue("test@example.com");
      await expect(contactPage.subjectInput).toHaveValue("Test Subject");
      await expect(contactPage.messageTextarea).toHaveValue(
        "This is a test message for the contact form.",
      );
    });

    test("should display contact information", async ({ contactPage }) => {
      await contactPage.goto("en");

      const hasContactInfo = await contactPage.hasContactInfo();
      expect(hasContactInfo).toBeTruthy();
    });

    test("should display regional offices", async ({ contactPage }) => {
      await contactPage.goto("en");

      const hasOffices = await contactPage.hasOfficesList();
      expect(hasOffices).toBeTruthy();
    });

    test("should display all three country offices", async ({
      contactPage,
      page,
    }) => {
      await contactPage.goto("en");

      // Check for country flags
      await expect(page.locator('text="🇧🇫"').first()).toBeVisible();
      await expect(page.locator('text="🇲🇱"').first()).toBeVisible();
      await expect(page.locator('text="🇳🇪"').first()).toBeVisible();
    });
  });

  test.describe("Cross-page Navigation", () => {
    test("should navigate between all public pages", async ({ page }) => {
      // Start at landing
      await page.goto("/en");
      await expect(page.locator("h1").first()).toBeVisible();

      // Go to About
      await page.getByRole("link", { name: "About" }).first().click();
      await page.waitForURL("**/about");
      expect(page.url()).toContain("/about");

      // Go to Blog from About
      await page.getByRole("link", { name: "Blog" }).first().click();
      await page.waitForURL("**/blog");
      expect(page.url()).toContain("/blog");

      // Go to Contact from Blog
      await page.getByRole("link", { name: "Contact" }).first().click();
      await page.waitForURL("**/contact");
      expect(page.url()).toContain("/contact");

      // Return to Home
      await page.getByRole("link", { name: "Home" }).first().click();
      await page.waitForURL("**/en");
      expect(page.url()).toMatch(/\/en\/?$/);
    });
  });
});
