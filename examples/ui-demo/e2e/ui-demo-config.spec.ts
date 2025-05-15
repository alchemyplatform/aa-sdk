import { expect, test } from "@playwright/test";
import path from "path";
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

test("Branding config", async ({ page }) => {
  // Dark mode
  const darkModeToggle = page.locator("button[id='theme-switch']");
  await expect(darkModeToggle).not.toBeChecked();
  await expect(page.locator(".bg-bg-surface-default")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)"
  );
  darkModeToggle.click();
  await expect(darkModeToggle).toBeChecked();
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.locator(".bg-bg-surface-default")).toHaveCSS(
    "background-color",
    "rgb(2, 6, 23)"
  );
  // Brand color
  await expect(page.locator(".akui-btn-primary").first()).toHaveCSS(
    "background-color",
    "rgb(255, 102, 204)"
  );
  const brandColorButton = page.locator("button[id='color-picker']");
  await brandColorButton.click();
  const colorPicker = page
    .locator("div")
    .filter({ hasText: /^Hex$/ })
    .getByRole("textbox");
  await colorPicker.fill("#000000");
  await expect(page.locator(".akui-btn-primary").first()).toHaveCSS(
    "background-color",
    "rgb(0, 0, 0)"
  );
  // Logo
  const logoInput = page.locator('input[type="file"]');
  // TODO: validate this in CI/CD
  const logoPath = path.join(__dirname, "../public/next.svg");
  await logoInput.setInputFiles(logoPath);
  await expect(page.getByRole("img", { name: "next.svg" })).toBeVisible();
  await page.locator("button[id='logo-remove']").click();
  await expect(page.getByRole("img", { name: "next.svg" })).not.toBeVisible();
  // Border radius
  await expect(page.locator(".radius-2").first()).toHaveCSS(
    "border-radius",
    "16px"
  );
  await page.getByRole("button", { name: "Medium" }).click();
  await expect(page.locator(".radius-2").first()).toHaveCSS(
    "border-radius",
    "32px"
  );
  await page.getByRole("button", { name: "Large" }).click();
  await expect(page.locator(".radius-2").first()).toHaveCSS(
    "border-radius",
    "48px"
  );
  await page.getByRole("button", { name: "None" }).click();
  await expect(page.locator(".radius-2").first()).toHaveCSS(
    "border-radius",
    "0px"
  );
});

test("code preview", async ({ page }) => {
  const codePreviewSwitch = page.getByRole("switch", { name: "Code preview" });
  await expect(codePreviewSwitch).not.toBeChecked();
  await codePreviewSwitch.click();
  await expect(codePreviewSwitch).toBeChecked();
  await expect(page.getByText("Export configuration")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Fully customize styling here." })
  ).toHaveAttribute(
    "href",
    "https://www.alchemy.com/docs/wallets/react/customization/theme"
  );
  await codePreviewSwitch.click();
  await expect(codePreviewSwitch).not.toBeChecked();
});
