import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL!);
});
test("Toggle auth methods", async ({ page }) => {
  // EMAIL
  const emailInput = page.getByPlaceholder("Email", { exact: true });
  const emailToggle = page.getByRole("switch", { name: /email/i });
  await expect(emailInput).toBeVisible();
  await expect(emailToggle).toBeChecked();
  await emailToggle.click();
  await expect(emailToggle).not.toBeChecked();
  await expect(emailInput).not.toBeVisible();

  // PASSKEY
  const passkeyToggle = page.getByRole("switch", { name: /passkeys/i });
  const passkeyButton = page.getByRole("button", { name: "I have a passkey" });
  await expect(passkeyToggle).toBeChecked();
  await expect(passkeyButton).toBeVisible();
  await passkeyToggle.click();
  await expect(passkeyToggle).not.toBeChecked();
  await expect(passkeyButton).not.toBeVisible();

  // SOCIAL
  const socialAuthToggle = page.getByRole("switch", { name: /social/i });

  const googleButton = page.locator("button[aria-label='Google sign in']");
  const googleAuthToggle = page.locator(
    "button[aria-label='Google social authentication toggle']"
  );

  const facebookButton = page.locator("button[aria-label='Facebook sign in']");
  const facebookAuthToggle = page.locator(
    "button[aria-label='Facebook social authentication toggle']"
  );

  const discordButton = page.locator("button[aria-label='Discord sign in']");
  const discordAuthToggle = page.locator(
    "button[aria-label='Discord social authentication toggle']"
  );

  const twitterButton = page.locator("button[aria-label='Twitter sign in']");
  const twitterAuthToggle = page.locator(
    "button[aria-label='Twitter social authentication toggle']"
  );

  await expect(socialAuthToggle).toBeChecked();
  await expect(googleButton).toBeVisible();
  await expect(facebookButton).toBeVisible();
  await expect(discordButton).toBeVisible();
  await expect(twitterButton).toBeVisible();

  await socialAuthToggle.click();
  await expect(socialAuthToggle).not.toBeChecked();
  await expect(googleButton).not.toBeVisible();
  await expect(facebookButton).not.toBeVisible();
  await expect(discordButton).not.toBeVisible();
  await expect(twitterButton).not.toBeVisible();

  await socialAuthToggle.click();

  await expect(googleButton).toBeVisible();
  await expect(facebookButton).toBeVisible();
  await expect(discordButton).toBeVisible();
  await expect(twitterButton).toBeVisible();

  await googleAuthToggle.click();
  await expect(googleButton).not.toBeVisible();

  await facebookAuthToggle.click();
  await expect(facebookButton).not.toBeVisible();

  await discordAuthToggle.click();
  await expect(discordButton).not.toBeVisible();

  await twitterAuthToggle.click();
  await expect(twitterButton).not.toBeVisible();

  // EXTERNAL WALLET
  const externalWalletToggle = page.getByRole("switch", {
    name: /external wallets/i,
  });
  const externalWalletButton = page.getByRole("button", {
    name: "Continue with a wallet",
  });
  await expect(externalWalletToggle).toBeChecked();
  await expect(externalWalletButton).toBeVisible();

  await externalWalletToggle.click();
  await expect(externalWalletToggle).not.toBeChecked();
  await expect(externalWalletButton).not.toBeVisible();

  await externalWalletToggle.click();
  await expect(externalWalletToggle).toBeChecked();
  await expect(externalWalletButton).toBeVisible();
});
