import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Demo Dashboard Page Object Model
 * Handles demo mode dashboard interactions (no auth required)
 */
export class DemoPage extends BasePage {
  // Common elements
  readonly sidebar: Locator;
  readonly header: Locator;
  readonly mainContent: Locator;
  readonly demoBanner: Locator;

  // Navigation links
  readonly dashboardLink: Locator;
  readonly farmsLink: Locator;
  readonly cropsLink: Locator;
  readonly tasksLink: Locator;
  readonly financeLink: Locator;
  readonly teamLink: Locator;
  readonly calendarLink: Locator;
  readonly agentsLink: Locator;

  constructor(page: Page) {
    super(page);
    // Main layout
    this.sidebar = page.locator('aside, nav[role="navigation"]').first();
    this.header = page.locator("header").first();
    this.mainContent = page.locator("main");
    this.demoBanner = page.locator("text=demo").first();

    // Sidebar navigation
    this.dashboardLink = page
      .getByRole("link", { name: /overview|dashboard|accueil/i })
      .first();
    this.farmsLink = page.getByRole("link", { name: /farms|fermes/i }).first();
    this.cropsLink = page
      .getByRole("link", { name: /crops|cultures/i })
      .first();
    this.tasksLink = page.getByRole("link", { name: /tasks|taches/i }).first();
    this.financeLink = page.getByRole("link", { name: /finance/i }).first();
    this.teamLink = page.getByRole("link", { name: /team|equipe/i }).first();
    this.calendarLink = page
      .getByRole("link", { name: /calendar|calendrier/i })
      .first();
    this.agentsLink = page.getByRole("link", { name: /agents|ai/i }).first();
  }

  /**
   * Navigate to demo dashboard
   */
  async goto(locale: string = "en") {
    await super.goto(`/${locale}/demo`);
    await this.waitForPageLoad();
  }

  /**
   * Verify demo dashboard loaded
   */
  async verifyPageLoaded() {
    await expect(this.mainContent).toBeVisible();
  }

  /**
   * Navigate to farms page
   */
  async goToFarms() {
    await this.farmsLink.click();
    await this.page.waitForURL("**/demo/farms");
  }

  /**
   * Navigate to tasks page
   */
  async goToTasks() {
    await this.tasksLink.click();
    await this.page.waitForURL("**/demo/tasks");
  }

  /**
   * Navigate to finance page
   */
  async goToFinance() {
    await this.financeLink.click();
    await this.page.waitForURL("**/demo/finance");
  }

  /**
   * Navigate to calendar page
   */
  async goToCalendar() {
    await this.calendarLink.click();
    await this.page.waitForURL("**/demo/calendar");
  }

  /**
   * Navigate to AI agents page
   */
  async goToAgents() {
    await this.agentsLink.click();
    await this.page.waitForURL("**/demo/agents");
  }

  /**
   * Check if demo banner is visible
   */
  async hasDemoBanner(): Promise<boolean> {
    return this.page.locator('[class*="amber"]').first().isVisible();
  }
}

/**
 * Demo Farms Page Object Model
 */
export class DemoFarmsPage extends DemoPage {
  readonly pageTitle: Locator;
  readonly farmsTable: Locator;
  readonly farmRows: Locator;
  readonly statsCards: Locator;
  readonly addFarmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.farmsTable = page.locator("table");
    this.farmRows = page.locator("table tbody tr");
    this.statsCards = page
      .locator('[class*="card"]')
      .filter({ hasText: /total|farms|hectares/i });
    this.addFarmButton = page.getByRole("button", {
      name: /add farm|ajouter/i,
    });
  }

  /**
   * Navigate to demo farms page
   */
  async goto(locale: string = "en") {
    await this.page.goto(`/${locale}/demo/farms`);
    await this.waitForPageLoad();
  }

  /**
   * Get farm count from table
   */
  async getFarmCount(): Promise<number> {
    return this.farmRows.count();
  }

  /**
   * Check if farms table is visible
   */
  async verifyFarmsTableVisible() {
    await expect(this.farmsTable).toBeVisible();
  }

  /**
   * Click on a farm row by name
   */
  async clickFarmByName(farmName: string) {
    await this.page
      .locator("table tbody tr")
      .filter({ hasText: farmName })
      .click();
  }
}

/**
 * Demo Finance Page Object Model
 */
export class DemoFinancePage extends DemoPage {
  readonly pageTitle: Locator;
  readonly incomeCard: Locator;
  readonly expenseCard: Locator;
  readonly profitCard: Locator;
  readonly transactionsTab: Locator;
  readonly salesTab: Locator;
  readonly transactionsTable: Locator;
  readonly salesTable: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.incomeCard = page
      .locator('[class*="card"]')
      .filter({ hasText: /total income|revenu/i });
    this.expenseCard = page
      .locator('[class*="card"]')
      .filter({ hasText: /expense|depenses/i });
    this.profitCard = page
      .locator('[class*="card"]')
      .filter({ hasText: /profit|benefice/i });
    this.transactionsTab = page.getByRole("tab", { name: /transactions/i });
    this.salesTab = page.getByRole("tab", { name: /sales|ventes/i });
    this.transactionsTable = page.locator("table").first();
    this.salesTable = page.locator("table").first();
  }

  /**
   * Navigate to demo finance page
   */
  async goto(locale: string = "en") {
    await this.page.goto(`/${locale}/demo/finance`);
    await this.waitForPageLoad();
  }

  /**
   * Switch to transactions tab
   */
  async showTransactions() {
    await this.transactionsTab.click();
  }

  /**
   * Switch to sales tab
   */
  async showSales() {
    await this.salesTab.click();
  }

  /**
   * Verify finance stats are displayed
   */
  async verifyStatsDisplayed() {
    await expect(this.incomeCard).toBeVisible();
    await expect(this.expenseCard).toBeVisible();
  }
}

/**
 * Demo Calendar Page Object Model
 */
export class DemoCalendarPage extends DemoPage {
  readonly pageTitle: Locator;
  readonly calendarGrid: Locator;
  readonly monthHeader: Locator;
  readonly dayHeaders: Locator;
  readonly taskItems: Locator;
  readonly legendSection: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.calendarGrid = page.locator(".grid.grid-cols-7");
    this.monthHeader = page
      .locator('[class*="card"]')
      .first()
      .locator('h2, [class*="title"]')
      .first();
    this.dayHeaders = page
      .locator(".grid.grid-cols-7 > div")
      .filter({ hasText: /sun|mon|tue|wed|thu|fri|sat/i });
    this.taskItems = page.locator('[class*="bg-"][class*="500"]');
    this.legendSection = page
      .locator('[class*="card"]')
      .filter({ hasText: /legend|priority/i });
  }

  /**
   * Navigate to demo calendar page
   */
  async goto(locale: string = "en") {
    await this.page.goto(`/${locale}/demo/calendar`);
    await this.waitForPageLoad();
  }

  /**
   * Verify calendar is displayed
   */
  async verifyCalendarDisplayed() {
    await expect(this.calendarGrid).toBeVisible();
  }

  /**
   * Get count of tasks displayed on calendar
   */
  async getTaskCount(): Promise<number> {
    return this.taskItems.count();
  }
}

/**
 * Demo AI Agents Page Object Model
 */
export class DemoAgentsPage extends DemoPage {
  readonly pageTitle: Locator;
  readonly agentList: Locator;
  readonly chatArea: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly newConversationButton: Locator;
  readonly demoModeNotice: Locator;
  readonly agronomistAgent: Locator;
  readonly marketingAgent: Locator;
  readonly financeAgent: Locator;
  readonly messageArea: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.agentList = page.locator('[class*="card"]').first();
    this.chatArea = page.locator('[class*="card"]').last();
    this.chatInput = page.locator("textarea");
    this.sendButton = page
      .getByRole("button")
      .filter({ has: page.locator("svg.lucide-send") });
    this.newConversationButton = page.getByRole("button", {
      name: /new conversation|nouvelle/i,
    });
    this.demoModeNotice = page
      .locator('[class*="amber"]')
      .filter({ hasText: /demo mode/i });
    this.agronomistAgent = page.getByRole("button", {
      name: /agronomist|agronome/i,
    });
    this.marketingAgent = page.getByRole("button", { name: /marketing/i });
    this.financeAgent = page.getByRole("button", { name: /finance/i });
    this.messageArea = page
      .locator('[class*="card"]')
      .last()
      .locator('[class*="overflow-y-auto"]');
  }

  /**
   * Navigate to demo agents page
   */
  async goto(locale: string = "en") {
    await this.page.goto(`/${locale}/demo/agents`);
    await this.waitForPageLoad();
  }

  /**
   * Select an agent type
   */
  async selectAgent(type: "agronomist" | "marketing" | "finance") {
    const agentButton = this.page
      .locator("button")
      .filter({ hasText: new RegExp(type, "i") })
      .first();
    await agentButton.click();
  }

  /**
   * Send a message in the chat
   */
  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    await this.sendButton.click();
  }

  /**
   * Wait for response in chat
   */
  async waitForResponse(timeout: number = 5000) {
    // Wait for the streaming animation to finish
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Get message count in chat
   */
  async getMessageCount(): Promise<number> {
    return this.page
      .locator('[class*="rounded-lg"][class*="px-4"][class*="py-2"]')
      .count();
  }

  /**
   * Click a suggestion badge
   */
  async clickSuggestion(text: string) {
    await this.page
      .locator('[class*="badge"]')
      .filter({ hasText: text })
      .first()
      .click();
  }

  /**
   * Verify agent chat interface is displayed
   */
  async verifyChatDisplayed() {
    await expect(this.chatInput).toBeVisible();
    await expect(this.sendButton).toBeVisible();
  }
}
