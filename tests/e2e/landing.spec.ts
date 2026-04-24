import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ReleaseFlow/);
  });

  test("should show hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Stop Writing")).toBeVisible();
  });

  test("should have connect github button in header", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Connect GitHub" })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign In" }).first().click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Login Page", () => {
  test("should load login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Quick Generate", () => {
  test("should load quick generate page", async ({ page }) => {
    await page.goto("/quick");
    await expect(page).toHaveURL(/quick/);
  });
});

test.describe("Pricing Page", () => {
  test("should load pricing page", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
  });

  test("should show free plan heading", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
  });
});

test.describe("Templates Page", () => {
  test("should load templates page", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();
  });
});

test.describe("Waitlist Page", () => {
  test("should load waitlist page", async ({ page }) => {
    await page.goto("/waitlist");
    await expect(page.getByRole("heading", { name: "Join the Waitlist" })).toBeVisible();
  });

  test("should accept email input", async ({ page }) => {
    await page.goto("/waitlist");
    await page.getByPlaceholder("your@email.com").fill("test@example.com");
    await page.getByRole("button", { name: "Join" }).click();
    await expect(page.getByText("You're on the list!")).toBeVisible();
  });
});