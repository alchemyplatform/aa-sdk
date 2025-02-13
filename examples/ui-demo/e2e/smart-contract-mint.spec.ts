import { test, expect } from "@playwright/test";

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
  // Enabling and disabling email to ensure config is loaded
  // TODO: find a better way to determine init complete.
  await page.getByRole("switch", { name: "Email" }).click();
  await page.getByRole("switch", { name: "Email" }).click();
  await page.locator("button[aria-label='Google sign in']").click();
  const pagePromise = page.waitForEvent("popup");
  const popup = await pagePromise;
  await popup.waitForLoadState("networkidle");
  const emailInput = await popup.getByRole("textbox");

  await emailInput.fill(googleEmail);
  await popup.getByRole("button", { name: /Next/i }).click();
  await expect(popup.getByText(/Enter your password/i)).toBeVisible();
  const passwordInput = await popup.locator("input[type='password']:visible");
  await passwordInput.fill(googlePassword);
  await popup.getByRole("button", { name: /Next/i }).click();

  // Wait for the page to load after sign in
  await expect(page.getByText(/One-click checkout/i).first()).toBeVisible();
  const avatar = await page.getByRole("button", {
    name: `Hello, ${googleEmail}`,
  });
  expect(avatar).toBeVisible();
  await page.locator("img[alt='An NFT']");

  // Collect NFT
  await page.getByRole("button", { name: "Collect NFT" }).click();
  await expect(await page.getByText("Success", { exact: true })).toBeVisible({
    timeout: 30000,
  });

  // Check external links
  await expect(
    page.getByRole("link", { name: "View transaction" })
  ).toBeVisible();
  await expect(
    await page.getByRole("link", { name: "Build with Account kit" })
  ).toHaveAttribute(
    "href",
    "https://dashboard.alchemy.com/accounts?utm_source=demo_alchemy_com&utm_medium=referral&utm_campaign=demo_to_dashboard"
  );
  await expect(
    await page.getByRole("link", { name: "Learn how." })
  ).toHaveAttribute("href", "https://accountkit.alchemy.com/react/sponsor-gas");
  await expect(
    await page.getByRole("link", { name: "View docs" })
  ).toHaveAttribute("href", "https://accountkit.alchemy.com/react/quickstart");
  await expect(
    await page.getByRole("link", { name: "Quickstart" })
  ).toHaveAttribute("href", "https://accountkit.alchemy.com/react/quickstart");
  await expect(await page.locator("a[aria-label='GitHub']")).toHaveAttribute(
    "href",
    "https://github.com/alchemyplatform/aa-sdk/tree/v4.x.x"
  );
  await expect(await page.getByRole("link", { name: "CSS" })).toHaveAttribute(
    "href",
    "https://github.com/alchemyplatform/aa-sdk/blob/v4.x.x/account-kit/react/src/tailwind/types.ts#L6"
  );
});
