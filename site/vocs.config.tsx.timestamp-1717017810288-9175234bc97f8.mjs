var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../lerna.json
var require_lerna = __commonJS({
  "../lerna.json"(exports, module) {
    module.exports = {
      $schema: "node_modules/lerna/schemas/lerna-schema.json",
      version: "3.17.0",
      npmClient: "yarn",
      conventionalCommits: true,
      changelog: true,
      command: {
        version: {
          message: "chore(release): publish %s [skip-ci]"
        }
      },
      granularPathspec: false
    };
  }
});

// vocs.config.tsx
import { aaCoreSideBar } from "sidebar/aa-core.js";
import { defineConfig } from "file:///Users/moldy/alchemy/aa-sdk/node_modules/vocs/_lib/index.js";
import { Fragment, jsx } from "file:///Users/moldy/alchemy/aa-sdk/node_modules/react/jsx-runtime.js";
var pkg = require_lerna();
var vocs_config_default = defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  logoUrl: "/kit-logo.svg",
  rootDir: "./",
  head: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    "meta",
    {
      name: "google-site-verification",
      content: "W4pmFb0Oe26_OndBLdy5uqNrsl_gfmKfTlHwlHPd4Co"
    }
  ) }),
  topNav: [
    { text: "Docs", link: "/getting-started/introduction" },
    {
      text: "Examples",
      link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples"
    },
    {
      text: pkg.version,
      items: [
        {
          text: "Migrating to 3.x.x",
          link: "/migration-guides/migrating-to-v3"
        },
        {
          text: "Changelog",
          link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CHANGELOG.md"
        },
        {
          text: "Contributing",
          link: "https://github.com/alchemyplatform/aa-sdk/blob/main/CONTRIBUTING.md"
        }
      ]
    }
  ],
  sidebar: [
    {
      text: "Getting started",
      items: [
        {
          text: "Overview",
          link: "/getting-started/overview"
        },
        {
          text: "Quick start",
          items: [
            { text: "Introduction", link: "/getting-started/introduction" },
            {
              text: "Setup",
              link: "/getting-started/setup-app"
            },
            {
              text: "Log in users",
              link: "/getting-started/log-in-users"
            },
            { text: "Send user operations", link: "/getting-started/send-uos" }
          ]
        }
      ]
    },
    {
      text: "Using Alchemy Signer",
      items: [
        {
          text: "Introduction",
          link: "/signers/alchemy-signer/introduction"
        },
        {
          text: "Passkey signup",
          link: "/signers/alchemy-signer/passkey-signup"
        },
        {
          text: "Passkey authentication",
          link: "/signers/alchemy-signer/passkey-auth"
        },
        {
          text: "User sessions",
          link: "/signers/alchemy-signer/manage-user-sessions"
        },
        {
          text: "Export private key",
          link: "/signers/alchemy-signer/export-private-key"
        }
      ]
    },
    {
      text: "Using smart accounts",
      items: [
        {
          text: "Send user operations",
          link: "/using-smart-accounts/send-user-operations"
        },
        {
          text: "Batch user operations",
          link: "/using-smart-accounts/batch-user-operations"
        },
        {
          text: "Sponsor gas",
          collapsed: false,
          items: [
            {
              text: "Use the Gas Manager",
              link: "/using-smart-accounts/sponsoring-gas/gas-manager"
            },
            {
              text: "Check eligibility",
              link: "/using-smart-accounts/sponsoring-gas/checking-eligibility"
            }
          ]
        },
        {
          text: "Simulate user operations",
          link: "/using-smart-accounts/simulate-user-operations"
        },
        {
          text: "Session keys",
          collapsed: false,
          items: [
            {
              text: "Overview",
              link: "/using-smart-accounts/session-keys/"
            },
            {
              text: "Getting started",
              link: "/using-smart-accounts/session-keys/getting-started"
            },
            {
              text: "Supported permissions",
              link: "/using-smart-accounts/session-keys/supported-permissions"
            }
          ]
        },
        {
          text: "Transfer ownership",
          collapsed: false,
          items: [
            {
              text: "Modular Account",
              link: "/using-smart-accounts/transfer-ownership/modular-account"
            },
            {
              text: "Light Account",
              link: "/using-smart-accounts/transfer-ownership/light-account"
            },
            {
              text: "Multi-Owner Light Account",
              link: "/using-smart-accounts/transfer-ownership/multi-owner-light-account"
            }
          ]
        },
        {
          text: "Alchemy enhanced APIs",
          collapsed: false,
          items: [
            {
              text: "Get account NFTs",
              link: "/using-smart-accounts/enhanced-apis/nft"
            },
            {
              text: "Get account tokens",
              link: "/using-smart-accounts/enhanced-apis/token"
            }
          ]
        }
      ]
    },
    {
      text: "React Hooks",
      items: [
        { text: "Overview", link: "/react/overview" },
        { text: "SSR", link: "/react/ssr" },
        { text: "createConfig", link: "/react/createConfig" },
        { text: "useAuthenticate", link: "/react/useAuthenticate" },
        { text: "useSmartAccountClient", link: "/react/useSmartAccountClient" },
        { text: "useClientActions", link: "/react/useClientActions" },
        { text: "useAccount", link: "/react/useAccount" },
        { text: "useSigner", link: "/react/useSigner" },
        { text: "useSignerStatus", link: "/react/useSignerStatus" },
        { text: "useUser", link: "/react/useUser" },
        { text: "useBundlerClient", link: "/react/useBundlerClient" },
        { text: "useAddPasskey", link: "/react/useAddPasskey" },
        { text: "useLogout", link: "/react/useLogout" },
        { text: "useExportAccount", link: "/react/useExportAccount" },
        { text: "useSignMessage", link: "/react/useSignMessage" },
        { text: "useSignTypedData", link: "/react/useSignTypedData" },
        { text: "useSendUserOperation", link: "/react/useSendUserOperation" },
        {
          text: "useDropAndReplaceUserOperation",
          link: "/react/useDropAndReplaceUserOperation"
        },
        {
          text: "useWaitForUserOperationTransaction",
          link: "/react/useWaitForUserOperationTransaction"
        },
        { text: "useSendTransaction", link: "/react/useSendTransaction" },
        { text: "useSendTransactions", link: "/react/useSendTransactions" },
        { text: "useChain", link: "/react/useChain" }
      ]
    },
    {
      text: "Choosing a smart account",
      items: [
        { text: "Introduction", link: "/smart-accounts/" },
        {
          text: "Modular Account",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/smart-accounts/modular-account/" },
            {
              text: "Getting started",
              link: "/smart-accounts/modular-account/getting-started"
            },
            {
              text: "Deployments",
              link: "/smart-accounts/modular-account/deployments"
            },
            {
              text: "Upgrading to Modular Account",
              link: "/smart-accounts/modular-account/upgrade-la-to-ma"
            },
            {
              text: "Multisig Plugin",
              collapsed: true,
              items: [
                {
                  text: "Introduction",
                  link: "/smart-accounts/modular-account/multisig-plugin/"
                },
                {
                  text: "Getting started",
                  link: "/smart-accounts/modular-account/multisig-plugin/getting-started"
                },
                {
                  text: "Technical details",
                  link: "/smart-accounts/modular-account/multisig-plugin/technical-details"
                }
              ]
            }
          ]
        },
        {
          text: "Light Account",
          collapsed: false,
          items: [
            { text: "Overview", link: "/smart-accounts/light-account/" },
            {
              text: "Getting started",
              link: "/smart-accounts/light-account/getting-started"
            },
            {
              text: "Deployments",
              link: "/smart-accounts/light-account/deployments"
            }
          ]
        },
        {
          text: "Custom accounts",
          collapsed: true,
          items: [
            {
              text: "Use your own",
              link: "/smart-accounts/custom/using-your-own"
            },
            {
              text: "Contribute your account",
              link: "/smart-accounts/custom/contributing"
            }
          ]
        },
        { text: "Gas benchmarks", link: "/smart-accounts/gas-benchmarks" }
      ]
    },
    {
      text: "Extending smart accounts",
      items: [
        {
          text: "Install plugins",
          link: "/extending-smart-accounts/install-plugins"
        },
        {
          text: "Get installed plugins",
          link: "/extending-smart-accounts/get-installed-plugins"
        }
      ]
    },
    {
      text: "Custom signers",
      items: [
        { text: "Introduction", link: "/signers/choosing-a-signer" },
        {
          text: "Third-party signers",
          collapsed: true,
          items: [
            { text: "Magic", link: "/signers/guides/magic" },
            { text: "Web3Auth", link: "/signers/guides/web3auth" },
            { text: "Turnkey", link: "/signers/guides/turnkey" },
            { text: "Privy", link: "/signers/guides/privy" },
            { text: "Dynamic", link: "/signers/guides/dynamic" },
            { text: "Fireblocks", link: "/signers/guides/fireblocks" },
            { text: "Portal", link: "/signers/guides/portal" },
            { text: "Capsule", link: "/signers/guides/capsule" },
            { text: "Lit Protocol", link: "/signers/guides/lit" },
            {
              text: "Particle Network",
              link: "/signers/guides/particle-network"
            },
            { text: "Arcana Auth", link: "/signers/guides/arcana-auth" },
            { text: "Dfns", link: "/signers/guides/dfns" },
            { text: "WalletKit", link: "/signers/guides/walletkit" },
            { text: "Passport", link: "/signers/guides/passport" }
          ]
        },
        { text: "EOA signer", link: "/signers/eoa" },
        {
          text: "Build your own",
          link: "/signers/guides/custom-signer"
        },
        {
          text: "Contribute your signer",
          link: "/signers/contributing"
        }
      ]
    },
    {
      text: "Custom infra",
      items: [
        { text: "Use custom bundler", link: "/third-party/bundlers" },
        { text: "Use custom paymaster", link: "/third-party/paymasters" }
      ]
    },
    {
      text: "aa-sdk packages",
      items: [{ text: "Overview", link: "/packages/" }, aaCoreSideBar]
    },
    {
      text: "Resources",
      items: [
        { text: "FAQs", link: "/resources/faqs" },
        { text: "React Native", link: "/resources/react-native" },
        { text: "Terms", link: "/resources/terms" },
        { text: "Types", link: "/resources/types" },
        { text: "Contact us", link: "/resources/contact-us" }
      ]
    }
  ],
  socials: [
    { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" }
  ]
  // TODO: add head from previous config
  // This is not supported in vocs
  // sitemap: {
  //   hostname: "https://accountkit.alchemy.com",
  // },
});
export {
  vocs_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbGVybmEuanNvbiIsICJ2b2NzLmNvbmZpZy50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbIntcbiAgXCIkc2NoZW1hXCI6IFwibm9kZV9tb2R1bGVzL2xlcm5hL3NjaGVtYXMvbGVybmEtc2NoZW1hLmpzb25cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMy4xNy4wXCIsXG4gIFwibnBtQ2xpZW50XCI6IFwieWFyblwiLFxuICBcImNvbnZlbnRpb25hbENvbW1pdHNcIjogdHJ1ZSxcbiAgXCJjaGFuZ2Vsb2dcIjogdHJ1ZSxcbiAgXCJjb21tYW5kXCI6IHtcbiAgICBcInZlcnNpb25cIjoge1xuICAgICAgXCJtZXNzYWdlXCI6IFwiY2hvcmUocmVsZWFzZSk6IHB1Ymxpc2ggJXMgW3NraXAtY2ldXCJcbiAgICB9XG4gIH0sXG4gIFwiZ3JhbnVsYXJQYXRoc3BlY1wiOiBmYWxzZVxufVxuIiwgImltcG9ydCB7IGFhQ29yZVNpZGVCYXIgfSBmcm9tIFwic2lkZWJhci9hYS1jb3JlLmpzXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5jb25zdCBwa2cgPSByZXF1aXJlKFwiLi4vbGVybmEuanNvblwiKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGl0bGU6IFwiQWNjb3VudCBLaXRcIixcbiAgZGVzY3JpcHRpb246IFwiQWNjb3VudCBBYnN0cmFjdGlvbiBMZWdvc1wiLFxuICBsb2dvVXJsOiBcIi9raXQtbG9nby5zdmdcIixcbiAgcm9vdERpcjogXCIuL1wiLFxuICBoZWFkOiAoXG4gICAgPD5cbiAgICAgIDxtZXRhXG4gICAgICAgIG5hbWU9XCJnb29nbGUtc2l0ZS12ZXJpZmljYXRpb25cIlxuICAgICAgICBjb250ZW50PVwiVzRwbUZiME9lMjZfT25kQkxkeTV1cU5yc2xfZ2ZtS2ZUbEh3bEhQZDRDb1wiXG4gICAgICAvPlxuICAgIDwvPlxuICApLFxuICB0b3BOYXY6IFtcbiAgICB7IHRleHQ6IFwiRG9jc1wiLCBsaW5rOiBcIi9nZXR0aW5nLXN0YXJ0ZWQvaW50cm9kdWN0aW9uXCIgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkV4YW1wbGVzXCIsXG4gICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbGNoZW15cGxhdGZvcm0vYWEtc2RrL3RyZWUvbWFpbi9leGFtcGxlc1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogcGtnLnZlcnNpb24sXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJNaWdyYXRpbmcgdG8gMy54LnhcIixcbiAgICAgICAgICBsaW5rOiBcIi9taWdyYXRpb24tZ3VpZGVzL21pZ3JhdGluZy10by12M1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJDaGFuZ2Vsb2dcIixcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbGNoZW15cGxhdGZvcm0vYWEtc2RrL2Jsb2IvbWFpbi9DSEFOR0VMT0cubWRcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ29udHJpYnV0aW5nXCIsXG4gICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYWxjaGVteXBsYXRmb3JtL2FhLXNkay9ibG9iL21haW4vQ09OVFJJQlVUSU5HLm1kXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gIHNpZGViYXI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkdldHRpbmcgc3RhcnRlZFwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXdcIixcbiAgICAgICAgICBsaW5rOiBcIi9nZXR0aW5nLXN0YXJ0ZWQvb3ZlcnZpZXdcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiUXVpY2sgc3RhcnRcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiBcIkludHJvZHVjdGlvblwiLCBsaW5rOiBcIi9nZXR0aW5nLXN0YXJ0ZWQvaW50cm9kdWN0aW9uXCIgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJTZXR1cFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9nZXR0aW5nLXN0YXJ0ZWQvc2V0dXAtYXBwXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkxvZyBpbiB1c2Vyc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9nZXR0aW5nLXN0YXJ0ZWQvbG9nLWluLXVzZXJzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIlNlbmQgdXNlciBvcGVyYXRpb25zXCIsIGxpbms6IFwiL2dldHRpbmctc3RhcnRlZC9zZW5kLXVvc1wiIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlVzaW5nIEFsY2hlbXkgU2lnbmVyXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2FsY2hlbXktc2lnbmVyL2ludHJvZHVjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJQYXNza2V5IHNpZ251cFwiLFxuICAgICAgICAgIGxpbms6IFwiL3NpZ25lcnMvYWxjaGVteS1zaWduZXIvcGFzc2tleS1zaWdudXBcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiUGFzc2tleSBhdXRoZW50aWNhdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3NpZ25lcnMvYWxjaGVteS1zaWduZXIvcGFzc2tleS1hdXRoXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlVzZXIgc2Vzc2lvbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2FsY2hlbXktc2lnbmVyL21hbmFnZS11c2VyLXNlc3Npb25zXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkV4cG9ydCBwcml2YXRlIGtleVwiLFxuICAgICAgICAgIGxpbms6IFwiL3NpZ25lcnMvYWxjaGVteS1zaWduZXIvZXhwb3J0LXByaXZhdGUta2V5XCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJVc2luZyBzbWFydCBhY2NvdW50c1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU2VuZCB1c2VyIG9wZXJhdGlvbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9zZW5kLXVzZXItb3BlcmF0aW9uc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJCYXRjaCB1c2VyIG9wZXJhdGlvbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9iYXRjaC11c2VyLW9wZXJhdGlvbnNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU3BvbnNvciBnYXNcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVXNlIHRoZSBHYXMgTWFuYWdlclwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9zcG9uc29yaW5nLWdhcy9nYXMtbWFuYWdlclwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJDaGVjayBlbGlnaWJpbGl0eVwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9zcG9uc29yaW5nLWdhcy9jaGVja2luZy1lbGlnaWJpbGl0eVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJTaW11bGF0ZSB1c2VyIG9wZXJhdGlvbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9zaW11bGF0ZS11c2VyLW9wZXJhdGlvbnNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU2Vzc2lvbiBrZXlzXCIsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3XCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzaW5nLXNtYXJ0LWFjY291bnRzL3Nlc3Npb24ta2V5cy9cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiR2V0dGluZyBzdGFydGVkXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzaW5nLXNtYXJ0LWFjY291bnRzL3Nlc3Npb24ta2V5cy9nZXR0aW5nLXN0YXJ0ZWRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiU3VwcG9ydGVkIHBlcm1pc3Npb25zXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzaW5nLXNtYXJ0LWFjY291bnRzL3Nlc3Npb24ta2V5cy9zdXBwb3J0ZWQtcGVybWlzc2lvbnNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVHJhbnNmZXIgb3duZXJzaGlwXCIsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk1vZHVsYXIgQWNjb3VudFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy90cmFuc2Zlci1vd25lcnNoaXAvbW9kdWxhci1hY2NvdW50XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkxpZ2h0IEFjY291bnRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvdHJhbnNmZXItb3duZXJzaGlwL2xpZ2h0LWFjY291bnRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiTXVsdGktT3duZXIgTGlnaHQgQWNjb3VudFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy90cmFuc2Zlci1vd25lcnNoaXAvbXVsdGktb3duZXItbGlnaHQtYWNjb3VudFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJBbGNoZW15IGVuaGFuY2VkIEFQSXNcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiR2V0IGFjY291bnQgTkZUc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2luZy1zbWFydC1hY2NvdW50cy9lbmhhbmNlZC1hcGlzL25mdFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJHZXQgYWNjb3VudCB0b2tlbnNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNpbmctc21hcnQtYWNjb3VudHMvZW5oYW5jZWQtYXBpcy90b2tlblwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiUmVhY3QgSG9va3NcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgdGV4dDogXCJPdmVydmlld1wiLCBsaW5rOiBcIi9yZWFjdC9vdmVydmlld1wiIH0sXG4gICAgICAgIHsgdGV4dDogXCJTU1JcIiwgbGluazogXCIvcmVhY3Qvc3NyXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcImNyZWF0ZUNvbmZpZ1wiLCBsaW5rOiBcIi9yZWFjdC9jcmVhdGVDb25maWdcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlQXV0aGVudGljYXRlXCIsIGxpbms6IFwiL3JlYWN0L3VzZUF1dGhlbnRpY2F0ZVwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VTbWFydEFjY291bnRDbGllbnRcIiwgbGluazogXCIvcmVhY3QvdXNlU21hcnRBY2NvdW50Q2xpZW50XCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZUNsaWVudEFjdGlvbnNcIiwgbGluazogXCIvcmVhY3QvdXNlQ2xpZW50QWN0aW9uc1wiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VBY2NvdW50XCIsIGxpbms6IFwiL3JlYWN0L3VzZUFjY291bnRcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlU2lnbmVyXCIsIGxpbms6IFwiL3JlYWN0L3VzZVNpZ25lclwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VTaWduZXJTdGF0dXNcIiwgbGluazogXCIvcmVhY3QvdXNlU2lnbmVyU3RhdHVzXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZVVzZXJcIiwgbGluazogXCIvcmVhY3QvdXNlVXNlclwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VCdW5kbGVyQ2xpZW50XCIsIGxpbms6IFwiL3JlYWN0L3VzZUJ1bmRsZXJDbGllbnRcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlQWRkUGFzc2tleVwiLCBsaW5rOiBcIi9yZWFjdC91c2VBZGRQYXNza2V5XCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZUxvZ291dFwiLCBsaW5rOiBcIi9yZWFjdC91c2VMb2dvdXRcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlRXhwb3J0QWNjb3VudFwiLCBsaW5rOiBcIi9yZWFjdC91c2VFeHBvcnRBY2NvdW50XCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZVNpZ25NZXNzYWdlXCIsIGxpbms6IFwiL3JlYWN0L3VzZVNpZ25NZXNzYWdlXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcInVzZVNpZ25UeXBlZERhdGFcIiwgbGluazogXCIvcmVhY3QvdXNlU2lnblR5cGVkRGF0YVwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VTZW5kVXNlck9wZXJhdGlvblwiLCBsaW5rOiBcIi9yZWFjdC91c2VTZW5kVXNlck9wZXJhdGlvblwiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcInVzZURyb3BBbmRSZXBsYWNlVXNlck9wZXJhdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3JlYWN0L3VzZURyb3BBbmRSZXBsYWNlVXNlck9wZXJhdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJ1c2VXYWl0Rm9yVXNlck9wZXJhdGlvblRyYW5zYWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvcmVhY3QvdXNlV2FpdEZvclVzZXJPcGVyYXRpb25UcmFuc2FjdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlU2VuZFRyYW5zYWN0aW9uXCIsIGxpbms6IFwiL3JlYWN0L3VzZVNlbmRUcmFuc2FjdGlvblwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJ1c2VTZW5kVHJhbnNhY3Rpb25zXCIsIGxpbms6IFwiL3JlYWN0L3VzZVNlbmRUcmFuc2FjdGlvbnNcIiB9LFxuICAgICAgICB7IHRleHQ6IFwidXNlQ2hhaW5cIiwgbGluazogXCIvcmVhY3QvdXNlQ2hhaW5cIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQ2hvb3NpbmcgYSBzbWFydCBhY2NvdW50XCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL1wiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk1vZHVsYXIgQWNjb3VudFwiLFxuICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIiwgbGluazogXCIvc21hcnQtYWNjb3VudHMvbW9kdWxhci1hY2NvdW50L1wiIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiR2V0dGluZyBzdGFydGVkXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3NtYXJ0LWFjY291bnRzL21vZHVsYXItYWNjb3VudC9nZXR0aW5nLXN0YXJ0ZWRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiRGVwbG95bWVudHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvbW9kdWxhci1hY2NvdW50L2RlcGxveW1lbnRzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlVwZ3JhZGluZyB0byBNb2R1bGFyIEFjY291bnRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvbW9kdWxhci1hY2NvdW50L3VwZ3JhZGUtbGEtdG8tbWFcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiTXVsdGlzaWcgUGx1Z2luXCIsXG4gICAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvbW9kdWxhci1hY2NvdW50L211bHRpc2lnLXBsdWdpbi9cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IFwiR2V0dGluZyBzdGFydGVkXCIsXG4gICAgICAgICAgICAgICAgICBsaW5rOiBcIi9zbWFydC1hY2NvdW50cy9tb2R1bGFyLWFjY291bnQvbXVsdGlzaWctcGx1Z2luL2dldHRpbmctc3RhcnRlZFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogXCJUZWNobmljYWwgZGV0YWlsc1wiLFxuICAgICAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvbW9kdWxhci1hY2NvdW50L211bHRpc2lnLXBsdWdpbi90ZWNobmljYWwtZGV0YWlsc1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkxpZ2h0IEFjY291bnRcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6IFwiT3ZlcnZpZXdcIiwgbGluazogXCIvc21hcnQtYWNjb3VudHMvbGlnaHQtYWNjb3VudC9cIiB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkdldHRpbmcgc3RhcnRlZFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9zbWFydC1hY2NvdW50cy9saWdodC1hY2NvdW50L2dldHRpbmctc3RhcnRlZFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJEZXBsb3ltZW50c1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9zbWFydC1hY2NvdW50cy9saWdodC1hY2NvdW50L2RlcGxveW1lbnRzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkN1c3RvbSBhY2NvdW50c1wiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlVzZSB5b3VyIG93blwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9zbWFydC1hY2NvdW50cy9jdXN0b20vdXNpbmcteW91ci1vd25cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiQ29udHJpYnV0ZSB5b3VyIGFjY291bnRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc21hcnQtYWNjb3VudHMvY3VzdG9tL2NvbnRyaWJ1dGluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6IFwiR2FzIGJlbmNobWFya3NcIiwgbGluazogXCIvc21hcnQtYWNjb3VudHMvZ2FzLWJlbmNobWFya3NcIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiRXh0ZW5kaW5nIHNtYXJ0IGFjY291bnRzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJJbnN0YWxsIHBsdWdpbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi9leHRlbmRpbmctc21hcnQtYWNjb3VudHMvaW5zdGFsbC1wbHVnaW5zXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkdldCBpbnN0YWxsZWQgcGx1Z2luc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2V4dGVuZGluZy1zbWFydC1hY2NvdW50cy9nZXQtaW5zdGFsbGVkLXBsdWdpbnNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkN1c3RvbSBzaWduZXJzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsIGxpbms6IFwiL3NpZ25lcnMvY2hvb3NpbmctYS1zaWduZXJcIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJUaGlyZC1wYXJ0eSBzaWduZXJzXCIsXG4gICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6IFwiTWFnaWNcIiwgbGluazogXCIvc2lnbmVycy9ndWlkZXMvbWFnaWNcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIldlYjNBdXRoXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL3dlYjNhdXRoXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJUdXJua2V5XCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL3R1cm5rZXlcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIlByaXZ5XCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL3ByaXZ5XCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJEeW5hbWljXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL2R5bmFtaWNcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkZpcmVibG9ja3NcIiwgbGluazogXCIvc2lnbmVycy9ndWlkZXMvZmlyZWJsb2Nrc1wiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiUG9ydGFsXCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL3BvcnRhbFwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiQ2Fwc3VsZVwiLCBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy9jYXBzdWxlXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJMaXQgUHJvdG9jb2xcIiwgbGluazogXCIvc2lnbmVycy9ndWlkZXMvbGl0XCIgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJQYXJ0aWNsZSBOZXR3b3JrXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL3BhcnRpY2xlLW5ldHdvcmtcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiQXJjYW5hIEF1dGhcIiwgbGluazogXCIvc2lnbmVycy9ndWlkZXMvYXJjYW5hLWF1dGhcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkRmbnNcIiwgbGluazogXCIvc2lnbmVycy9ndWlkZXMvZGZuc1wiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiV2FsbGV0S2l0XCIsIGxpbms6IFwiL3NpZ25lcnMvZ3VpZGVzL3dhbGxldGtpdFwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiUGFzc3BvcnRcIiwgbGluazogXCIvc2lnbmVycy9ndWlkZXMvcGFzc3BvcnRcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHsgdGV4dDogXCJFT0Egc2lnbmVyXCIsIGxpbms6IFwiL3NpZ25lcnMvZW9hXCIgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQnVpbGQgeW91ciBvd25cIixcbiAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2d1aWRlcy9jdXN0b20tc2lnbmVyXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNvbnRyaWJ1dGUgeW91ciBzaWduZXJcIixcbiAgICAgICAgICBsaW5rOiBcIi9zaWduZXJzL2NvbnRyaWJ1dGluZ1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuXG4gICAge1xuICAgICAgdGV4dDogXCJDdXN0b20gaW5mcmFcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgdGV4dDogXCJVc2UgY3VzdG9tIGJ1bmRsZXJcIiwgbGluazogXCIvdGhpcmQtcGFydHkvYnVuZGxlcnNcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiVXNlIGN1c3RvbSBwYXltYXN0ZXJcIiwgbGluazogXCIvdGhpcmQtcGFydHkvcGF5bWFzdGVyc1wiIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJhYS1zZGsgcGFja2FnZXNcIixcbiAgICAgIGl0ZW1zOiBbeyB0ZXh0OiBcIk92ZXJ2aWV3XCIsIGxpbms6IFwiL3BhY2thZ2VzL1wiIH0sIGFhQ29yZVNpZGVCYXJdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJSZXNvdXJjZXNcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgdGV4dDogXCJGQVFzXCIsIGxpbms6IFwiL3Jlc291cmNlcy9mYXFzXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIlJlYWN0IE5hdGl2ZVwiLCBsaW5rOiBcIi9yZXNvdXJjZXMvcmVhY3QtbmF0aXZlXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIlRlcm1zXCIsIGxpbms6IFwiL3Jlc291cmNlcy90ZXJtc1wiIH0sXG4gICAgICAgIHsgdGV4dDogXCJUeXBlc1wiLCBsaW5rOiBcIi9yZXNvdXJjZXMvdHlwZXNcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiQ29udGFjdCB1c1wiLCBsaW5rOiBcIi9yZXNvdXJjZXMvY29udGFjdC11c1wiIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gIHNvY2lhbHM6IFtcbiAgICB7IGljb246IFwiZ2l0aHViXCIsIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2FsY2hlbXlwbGF0Zm9ybS9hYS1zZGtcIiB9LFxuICBdLFxuICAvLyBUT0RPOiBhZGQgaGVhZCBmcm9tIHByZXZpb3VzIGNvbmZpZ1xuICAvLyBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdm9jc1xuICAvLyBzaXRlbWFwOiB7XG4gIC8vICAgaG9zdG5hbWU6IFwiaHR0cHM6Ly9hY2NvdW50a2l0LmFsY2hlbXkuY29tXCIsXG4gIC8vIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQ0UsU0FBVztBQUFBLE1BQ1gsU0FBVztBQUFBLE1BQ1gsV0FBYTtBQUFBLE1BQ2IscUJBQXVCO0FBQUEsTUFDdkIsV0FBYTtBQUFBLE1BQ2IsU0FBVztBQUFBLFFBQ1QsU0FBVztBQUFBLFVBQ1QsU0FBVztBQUFBLFFBQ2I7QUFBQSxNQUNGO0FBQUEsTUFDQSxrQkFBb0I7QUFBQSxJQUN0QjtBQUFBO0FBQUE7OztBQ1pBLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsb0JBQW9CO0FBVXpCLG1CQUNFLFdBREY7QUFSSixJQUFNLE1BQU07QUFFWixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsRUFDUCxhQUFhO0FBQUEsRUFDYixTQUFTO0FBQUEsRUFDVCxTQUFTO0FBQUEsRUFDVCxNQUNFLGdDQUNFO0FBQUEsSUFBQztBQUFBO0FBQUEsTUFDQyxNQUFLO0FBQUEsTUFDTCxTQUFRO0FBQUE7QUFBQSxFQUNWLEdBQ0Y7QUFBQSxFQUVGLFFBQVE7QUFBQSxJQUNOLEVBQUUsTUFBTSxRQUFRLE1BQU0sZ0NBQWdDO0FBQUEsSUFDdEQ7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTSxJQUFJO0FBQUEsTUFDVixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sT0FBTztBQUFBLFlBQ0wsRUFBRSxNQUFNLGdCQUFnQixNQUFNLGdDQUFnQztBQUFBLFlBQzlEO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQSxFQUFFLE1BQU0sd0JBQXdCLE1BQU0sNEJBQTRCO0FBQUEsVUFDcEU7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7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
