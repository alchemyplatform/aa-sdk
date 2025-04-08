import { SidebarItem } from "vocs";

export const reactGuides: SidebarItem[] = [
  {
    text: "Overview",
    link: "/react/overview",
  },
  {
    text: "Quickstart",
    link: "/react/quickstart",
  },
  {
    text: "Login UI",
    items: [
      { text: "Pre-built UI", link: "/react/ui-components" },
      { text: "Custom UI", link: "/react/react-hooks" },
    ],
  },
  {
    text: "Login methods",
    items: [
      { text: "Set up", link: "/react/getting-started" },
      { text: "Email OTP", link: "/react/login-methods/email-otp" },
      {
        text: "Email magic-link",
        link: "/react/login-methods/email-magic-link",
      },
      {
        text: "Social login",
        link: "/react/login-methods/social-login",
      },
      {
        text: "Custom social providers",
        link: "/react/login-methods/social-providers",
      },
      {
        text: "Passkey signup",
        link: "/react/login-methods/passkey-signup",
      },
      {
        text: "Passkey login",
        link: "/react/login-methods/passkey-login",
      },
      {
        text: "Multi-factor authentication",
        collapsed: true,
        items: [
          { text: "Set up MFA", link: "/react/mfa/setup-mfa" },
          { text: "Email OTP", link: "/react/mfa/email-otp" },
          {
            text: "Email magic-link",
            link: "/react/mfa/email-magic-link",
          },
          {
            text: "Social login",
            link: "/react/mfa/social-login",
          },
        ],
      },
    ],
  },
  {
    text: "Using smart accounts",
    items: [
      {
        text: "Set up your client",
        link: "/react/how-to-set-up-smart-account-client",
      },
      {
        text: "Send user operations",
        link: "/react/send-user-operations",
      },
      { text: "Sponsor gas", link: "/react/sponsor-gas" },
      { text: "Add passkey", link: "/react/add-passkey" },
      { text: "Multi-chain apps", link: "/react/multi-chain-apps" },
    ],
  },
  {
    text: "Using EIP-7702",
    link: "/react/using-7702",
  },
  {
    text: "Customizing UI components",
    items: [{ text: "Theme", link: "/react/customization/theme" }],
  },
  {
    text: "Server side rendering",
    link: "/react/ssr",
  },
  { text: "SDK Reference", link: "/reference/account-kit/react" },
];
