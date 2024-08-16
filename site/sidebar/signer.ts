import { SidebarItem } from "vocs";
import { sharedSidebar } from "./shared.js";

export const signerSidebar: SidebarItem[] = [
  {
    text: "Overview",
    items: [
      { text: "Introduction", link: "/signer/overview" },
      { text: "What is a signer?", link: "/signer/what-is-a-signer" },
      { text: "Getting started", link: "/signer/quickstart" },
    ],
  },
  {
    text: "Using Alchemy Signer",
    items: [
      {
        text: "Authentication",
        items: [
          {
            text: "Email magic-link",
            link: "/signer/authentication/email-magic-link",
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
      { text: "User sessions", link: "/signer/user-sessions" },
      { text: "Export private key", link: "/signer/export-private-key" },
      { text: "As an EOA", link: "/signer/as-an-eoa" },
    ],
  },
  {
    text: "Third-party signers",
    items: [{ text: "Custom signer", link: "/signer/custom-signer" }],
  },
  {
    text: "SDK Reference",
    link: "/reference/account-kit/signer",
  },
  ...sharedSidebar,
];
