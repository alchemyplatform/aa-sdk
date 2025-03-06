// sharedWorkflow.ts
import { Page, expect } from "@playwright/test";

export async function mintWithGoogleAuthWorkflow(
  page: Page,
  googleEmail: string,
  googlePassword: string,
) {
  // Google sign in
  await page.locator("button[aria-label='Google sign in']").click();
  const popup = await page.waitForEvent("popup");
  await popup.waitForLoadState("networkidle");

  const emailInput = popup.getByRole("textbox");
  await emailInput.fill(googleEmail);
  await popup.getByRole("button", { name: /Next/i }).click();
  await expect(popup.getByText(/Enter your password/i)).toBeVisible();

  const passwordInput = popup.locator("input[type='password']:visible");
  await passwordInput.fill(googlePassword);
  await popup.getByRole("button", { name: /Next/i }).click();

  // Wait for page to load after sign in
  await expect(page.getByText(/Gasless transactions/i)).toBeVisible();
  const avatar = page.getByRole("button", { name: `Hello, ${googleEmail}` });
  await expect(avatar).toBeVisible();
  await page.locator("img[alt='An NFT']");

  // Collect NFT
  await page.getByRole("button", { name: "Collect NFT" }).click();
  await expect(page.getByText("Success", { exact: true })).toBeVisible({
    timeout: 30000,
  });

  // Create session key
  await page.getByRole("button", { name: "Create session key" }).click();
  await expect(page.getByText("Bought 1 ETH")).toBeVisible({
    timeout: 30000,
  });

  // Check external links
  await expect(page.locator("a[aria-label='View transaction']")).toBeVisible();
  await expect(page.getByRole("link", { name: "Quickstart" })).toHaveAttribute(
    "href",
    "https://accountkit.alchemy.com/react/quickstart",
  );
  await expect(page.locator("a[aria-label='GitHub']")).toHaveAttribute(
    "href",
    "https://github.com/alchemyplatform/aa-sdk/tree/v4.x.x",
  );
  await expect(page.getByRole("link", { name: "CSS" })).toHaveAttribute(
    "href",
    "https://github.com/alchemyplatform/aa-sdk/blob/v4.x.x/account-kit/react/src/tailwind/types.ts#L6",
  );
}
