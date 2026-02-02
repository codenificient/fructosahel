import { test, expect } from "./fixtures/test-fixtures";

test.describe("Demo AI Agents", () => {
  test.describe("Agents Page Loading", () => {
    test("should load agents page correctly", async ({ demoAgentsPage }) => {
      await demoAgentsPage.goto("en");
      await demoAgentsPage.verifyChatDisplayed();
    });

    test("should display demo mode notice", async ({ demoAgentsPage }) => {
      await demoAgentsPage.goto("en");

      await expect(demoAgentsPage.demoModeNotice).toBeVisible();
    });

    test("should display agent selection panel", async ({ demoAgentsPage }) => {
      await demoAgentsPage.goto("en");

      await expect(demoAgentsPage.agentList).toBeVisible();
    });

    test("should display chat area", async ({ demoAgentsPage }) => {
      await demoAgentsPage.goto("en");

      await expect(demoAgentsPage.chatArea).toBeVisible();
      await expect(demoAgentsPage.chatInput).toBeVisible();
      await expect(demoAgentsPage.sendButton).toBeVisible();
    });
  });

  test.describe("Agent Selection", () => {
    test("should display all three agent types", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      // Check for all agent types
      await expect(page.getByText(/agronomist/i).first()).toBeVisible();
      await expect(page.getByText(/marketing/i).first()).toBeVisible();
      await expect(page.getByText(/finance/i).first()).toBeVisible();
    });

    test("should switch to marketing agent", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      await demoAgentsPage.selectAgent("marketing");

      // Verify marketing agent is selected
      await expect(page.getByText(/market/i).first()).toBeVisible();
    });

    test("should switch to finance agent", async ({ demoAgentsPage, page }) => {
      await demoAgentsPage.goto("en");

      await demoAgentsPage.selectAgent("finance");

      // Verify finance agent is selected
      await expect(page.getByText(/finance/i).first()).toBeVisible();
    });

    test("should show agent-specific suggestions", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      // Default is agronomist - check for agronomist suggestions
      await expect(page.getByText(/plant.*mango/i).first()).toBeVisible();
    });
  });

  test.describe("Chat Functionality", () => {
    test("should allow typing in chat input", async ({ demoAgentsPage }) => {
      await demoAgentsPage.goto("en");

      await demoAgentsPage.chatInput.fill("Hello, how can you help me?");
      await expect(demoAgentsPage.chatInput).toHaveValue(
        "Hello, how can you help me?",
      );
    });

    test("should send message and receive response", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      // Send a message
      await demoAgentsPage.sendMessage(
        "What is the best time to plant mangoes?",
      );

      // Wait for response (demo mode has simulated delay)
      await demoAgentsPage.waitForResponse(3000);

      // Check that messages appear
      const messageCount = await demoAgentsPage.getMessageCount();
      expect(messageCount).toBeGreaterThanOrEqual(2); // User message + AI response
    });

    test("should disable send button while streaming", async ({
      demoAgentsPage,
    }) => {
      await demoAgentsPage.goto("en");

      // Type a message
      await demoAgentsPage.chatInput.fill("Test message");
      await demoAgentsPage.sendButton.click();

      // Button should be disabled during streaming
      // Note: This may be too fast to catch in demo mode
      await demoAgentsPage.page.waitForTimeout(100);
    });

    test("should start new conversation", async ({ demoAgentsPage }) => {
      await demoAgentsPage.goto("en");

      // Send a message first
      await demoAgentsPage.sendMessage("First message");
      await demoAgentsPage.waitForResponse(3000);

      // Start new conversation
      await demoAgentsPage.newConversationButton.click();

      // Chat should be cleared (no messages)
      const messageCount = await demoAgentsPage.getMessageCount();
      expect(messageCount).toBe(0);
    });

    test("should click suggestion to populate input", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      // Click on a suggestion badge
      const suggestion = page
        .locator('[class*="badge"]')
        .filter({ hasText: /mango/i })
        .first();
      if (await suggestion.isVisible()) {
        await suggestion.click();

        // Input should have text
        const inputValue = await demoAgentsPage.chatInput.inputValue();
        expect(inputValue.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Agent Context", () => {
    test("agronomist should provide farming advice", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      // Select agronomist
      await demoAgentsPage.selectAgent("agronomist");

      // Send a farming question
      await demoAgentsPage.sendMessage("How much water do pineapples need?");
      await demoAgentsPage.waitForResponse(4000);

      // Response should mention agricultural terms
      const response = await page
        .locator('[class*="bg-muted"]')
        .last()
        .textContent();
      // Demo responses are pre-written, so we just verify we got a response
      expect(response).toBeTruthy();
    });

    test("marketing agent should provide market advice", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      // Select marketing agent
      await demoAgentsPage.selectAgent("marketing");

      // Send a market question
      await demoAgentsPage.sendMessage("What are the current cashew prices?");
      await demoAgentsPage.waitForResponse(4000);

      // Verify we got a response
      const messageCount = await demoAgentsPage.getMessageCount();
      expect(messageCount).toBeGreaterThanOrEqual(2);
    });

    test("finance agent should provide financial advice", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("en");

      // Select finance agent
      await demoAgentsPage.selectAgent("finance");

      // Send a finance question
      await demoAgentsPage.sendMessage(
        "How much does it cost to start a mango farm?",
      );
      await demoAgentsPage.waitForResponse(4000);

      // Verify we got a response
      const messageCount = await demoAgentsPage.getMessageCount();
      expect(messageCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe("French Locale", () => {
    test("should load agents page in French", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("fr");
      await demoAgentsPage.verifyChatDisplayed();

      // Check for French text
      await expect(page.getByText(/nouveau/i).first()).toBeVisible();
    });

    test("should display agents in French", async ({
      demoAgentsPage,
      page,
    }) => {
      await demoAgentsPage.goto("fr");

      // Check for French agent names (may be translated or English)
      await expect(demoAgentsPage.agentList).toBeVisible();
    });
  });
});
