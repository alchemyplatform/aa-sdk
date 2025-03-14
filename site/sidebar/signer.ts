import { SidebarItem } from "vocs";

export const signerSidebar: SidebarItem[] = [
  { text: "Overview", link: "/signer/overview" },
  { text: "What is a signer?", link: "/signer/what-is-a-signer" },
  { text: "Getting started", link: "/signer/quickstart" },
  {
    text: "Using Alchemy Signer",
    items: [
      { text: "User sessions", link: "/signer/user-sessions" },
      { text: "Export private key", link: "/signer/export-private-key" },
      { text: "As an EOA", link: "/signer/as-an-eoa" },
    ],
  },
  {
    text: "Policies",
    items: [
      { text: "Overview", link: "/signer/policies/overview" },
      { text: "Key concepts", link: "/signer/policies/key-concepts-and-examples" },
      { text: "Offchain policies", link: "/signer/policies/offchain-policy-configuration" },
      { text: "Onchain policies", link: "/signer/policies/onchain-policy-configuration" },
    ],
  },
  {
    text: "Authentication methods",
    items: [
      {
        text: "Email OTP",
        link: "/signer/authentication/email-otp",
      },
      {
        text: "Email magic-link",
        link: "/signer/authentication/email-magic-link",
      },
      {
        text: "Social login",
        link: "/signer/authentication/social-login",
      },
      {
        text: "Custom social providers",
        link: "/signer/authentication/auth0",
      },
      {
        text: "Passkey signup",
        link: "/signer/authentication/passkey-signup",
      },
      {
        text: "Passkey login",
        link: "/signer/authentication/passkey-login",
      },
      { text: "Add passkey", link: "/signer/authentication/add-passkey" },
    ],
  },
  {
    text: "Third-party signers",
    items: [{ text: "Custom signer", link: "../third-party/signers" }],
  },
  {
    text: "SDK Reference",
    link: "/reference/account-kit/signer",
  },
];
