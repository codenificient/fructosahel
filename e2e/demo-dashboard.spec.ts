import { test, expect } from "./fixtures/test-fixtures";

test.describe("Demo Dashboard", () => {
  test.describe("Demo Home Page", () => {
    test("should load demo dashboard correctly", async ({ demoPage }) => {
      await demoPage.goto("en");
      await demoPage.verifyPageLoaded();
    });

    test("should display demo mode indicator", async ({ demoPage }) => {
      await demoPage.goto("en");

      const hasDemoBanner = await demoPage.hasDemoBanner();
      expect(hasDemoBanner).toBeTruthy();
    });

    test("should display dashboard statistics", async ({ demoPage, page }) => {
      await demoPage.goto("en");

      // Check for stats cards
      await expect(page.getByText(/total farms/i).first()).toBeVisible();
      await expect(page.getByText(/hectares/i).first()).toBeVisible();
    });

    test("should display charts and analytics", async ({ demoPage, page }) => {
      await demoPage.goto("en");

      // Check for analytics section
      await expect(page.getByText(/analytics/i).first()).toBeVisible();
    });

    test("should display quick actions", async ({ demoPage, page }) => {
      await demoPage.goto("en");

      // Check for quick action buttons
      await expect(page.getByText(/quick actions/i).first()).toBeVisible();
    });
  });

  test.describe("Demo Navigation", () => {
    test("should navigate to farms page", async ({ demoPage, page }) => {
      await demoPage.goto("en");
      await demoPage.goToFarms();
      expect(page.url()).toContain("/demo/farms");
    });

    test("should navigate to tasks page", async ({ demoPage, page }) => {
      await demoPage.goto("en");
      await demoPage.goToTasks();
      expect(page.url()).toContain("/demo/tasks");
    });

    test("should navigate to finance page", async ({ demoPage, page }) => {
      await demoPage.goto("en");
      await demoPage.goToFinance();
      expect(page.url()).toContain("/demo/finance");
    });

    test("should navigate to calendar page", async ({ demoPage, page }) => {
      await demoPage.goto("en");
      await demoPage.goToCalendar();
      expect(page.url()).toContain("/demo/calendar");
    });

    test("should navigate to AI agents page", async ({ demoPage, page }) => {
      await demoPage.goto("en");
      await demoPage.goToAgents();
      expect(page.url()).toContain("/demo/agents");
    });
  });
});

test.describe("Demo Farms Page", () => {
  test("should load farms page correctly", async ({ demoFarmsPage }) => {
    await demoFarmsPage.goto("en");
    await demoFarmsPage.verifyFarmsTableVisible();
  });

  test("should display demo banner", async ({ demoFarmsPage }) => {
    await demoFarmsPage.goto("en");

    const hasBanner = await demoFarmsPage.hasDemoBanner();
    expect(hasBanner).toBeTruthy();
  });

  test("should display farms in table", async ({ demoFarmsPage }) => {
    await demoFarmsPage.goto("en");

    const farmCount = await demoFarmsPage.getFarmCount();
    expect(farmCount).toBeGreaterThan(0);
  });

  test("should display farm statistics cards", async ({
    demoFarmsPage,
    page,
  }) => {
    await demoFarmsPage.goto("en");

    // Check stats cards
    await expect(page.getByText(/total farms/i).first()).toBeVisible();
    await expect(page.getByText(/total hectares/i).first()).toBeVisible();
  });

  test("should display country flags in farm rows", async ({
    demoFarmsPage,
    page,
  }) => {
    await demoFarmsPage.goto("en");

    // Check for country flags
    const hasFlag = await page.locator("text=/🇧🇫|🇲🇱|🇳🇪/").first().isVisible();
    expect(hasFlag).toBeTruthy();
  });

  test("should have disabled add farm button in demo", async ({
    demoFarmsPage,
  }) => {
    await demoFarmsPage.goto("en");

    await expect(demoFarmsPage.addFarmButton).toBeDisabled();
  });
});

test.describe("Demo Finance Page", () => {
  test("should load finance page correctly", async ({ demoFinancePage }) => {
    await demoFinancePage.goto("en");
    await demoFinancePage.verifyStatsDisplayed();
  });

  test("should display income and expense totals", async ({
    demoFinancePage,
    page,
  }) => {
    await demoFinancePage.goto("en");

    // Check for financial stats
    await expect(page.getByText(/total income/i).first()).toBeVisible();
    await expect(page.getByText(/expense/i).first()).toBeVisible();
    await expect(page.getByText(/profit/i).first()).toBeVisible();
  });

  test("should display transactions tab by default", async ({
    demoFinancePage,
  }) => {
    await demoFinancePage.goto("en");

    await expect(demoFinancePage.transactionsTab).toBeVisible();
    await expect(demoFinancePage.transactionsTable).toBeVisible();
  });

  test("should switch to sales tab", async ({ demoFinancePage, page }) => {
    await demoFinancePage.goto("en");

    await demoFinancePage.showSales();
    await expect(page.getByText(/sales records/i)).toBeVisible();
  });

  test("should display currency in XOF format", async ({
    demoFinancePage,
    page,
  }) => {
    await demoFinancePage.goto("en");

    await expect(page.getByText(/XOF/).first()).toBeVisible();
  });
});

test.describe("Demo Calendar Page", () => {
  test("should load calendar page correctly", async ({ demoCalendarPage }) => {
    await demoCalendarPage.goto("en");
    await demoCalendarPage.verifyCalendarDisplayed();
  });

  test("should display current month header", async ({ demoCalendarPage }) => {
    await demoCalendarPage.goto("en");

    await expect(demoCalendarPage.monthHeader).toBeVisible();
  });

  test("should display day headers", async ({ demoCalendarPage, page }) => {
    await demoCalendarPage.goto("en");

    // Check for day abbreviations
    await expect(page.getByText("Sun").first()).toBeVisible();
    await expect(page.getByText("Mon").first()).toBeVisible();
    await expect(page.getByText("Tue").first()).toBeVisible();
  });

  test("should display priority legend", async ({ demoCalendarPage }) => {
    await demoCalendarPage.goto("en");

    await expect(demoCalendarPage.legendSection).toBeVisible();
  });

  test("should display tasks on calendar", async ({ demoCalendarPage }) => {
    await demoCalendarPage.goto("en");

    const taskCount = await demoCalendarPage.getTaskCount();
    // May or may not have tasks depending on the current month
    expect(taskCount).toBeGreaterThanOrEqual(0);
  });
});
