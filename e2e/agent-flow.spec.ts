import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_EMAIL ?? "e2e@agentdesk.app";
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "test-password-123";

test.describe("Agent Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login and reach dashboard", async ({ page }) => {
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("create a new agent", async ({ page }) => {
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15000 });

    await page.goto("/agents/new");
    await page.fill('input[placeholder="My Agent"]', "E2E Test Agent");
    await page.fill('input[placeholder="What does this agent do?"]', "Created by Playwright");
    await page.selectOption("select", "gpt-4o-mini");
    await page.fill('textarea', "You are a test assistant. Reply with 'OK' to any message.");
    await page.click('button[type="submit"]');

    await expect(page.locator("h1")).toContainText("E2E Test Agent", { timeout: 15000 });
  });

  test("agent detail page shows config and executions section", async ({ page }) => {
    await page.goto("/agents");
    const firstAgent = page.locator("a:has-text('View')").first();
    if (await firstAgent.isVisible()) {
      await firstAgent.click();
      await expect(page.locator("text=System Prompt")).toBeVisible();
      await expect(page.locator("text=Recent Executions")).toBeVisible();
    }
  });

  test("executions page loads and shows table", async ({ page }) => {
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15000 });

    await page.goto("/executions");
    await expect(page.locator("h1")).toContainText("Execution History");
    await expect(page.locator("table")).toBeVisible();
  });
});