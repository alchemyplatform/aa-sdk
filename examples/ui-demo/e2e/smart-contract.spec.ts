import { test, expect } from "@playwright/test";
import { mintWithGoogleAuthWorkflow } from "./helpers/mintWorkflow";
const googleEmail = process.env.PLAYWRIGHT_GOOGLE_EMAIL;
const googlePassword = process.env.PLAYWRIGHT_GOOGLE_PASSWORD;

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL!);
});
test("Google sign in", async ({ page }) => {
  if (!googleEmail || !googlePassword) {
    throw new Error(
      "PLAYWRIGHT_GOOGLE_EMAIL and PLAYWRIGHT_GOOGLE_PASSWORD must be set"
    );
  }
  await expect(page).toHaveTitle(/Account Kit/);
  // Fast way to initialize the page and ensure config is loaded
  await page.getByRole("switch", { name: "Email" }).click();
  await page.getByRole("switch", { name: "Email" }).click();

  const walletSwitch = await page.locator("#wallet-switch");
  if ((await walletSwitch.getAttribute("aria-checked")) === "true") {
    await walletSwitch.click();
  }

  await mintWithGoogleAuthWorkflow(page, googleEmail, googlePassword);
});
