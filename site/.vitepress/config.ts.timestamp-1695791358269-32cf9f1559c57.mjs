// .vitepress/config.ts
import { $ } from "file:///Users/ajayvasisht/Desktop/alchemy/aa-sdk-private/site/node_modules/execa/index.js";
import { defineConfig } from "file:///Users/ajayvasisht/Desktop/alchemy/aa-sdk-private/node_modules/vitepress/dist/node/index.js";
var getRepoRoute = $.sync`git rev-parse --show-toplevel`;
var { stdout: basePath } = $.sync`basename ${getRepoRoute}`;
var config_default = defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  base: `/${basePath}`,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Docs", link: "/getting-started" },
      {
        text: "Examples",
        link: "https://github.com/alchemyplatform/aa-sdk/tree/main/examples"
      }
    ],
    sidebar: [
      { text: "Introduction", link: "/introduction" },
      { text: "Getting Started", link: "/getting-started" },
      {
        text: "Packages Overview",
        link: "/packages/overview"
      },
      {
        text: "Using Smart Accounts",
        base: "/smart-accounts",
        items: [
          { text: "Overview", link: "/overview" },
          {
            text: "Choosing a Smart Account",
            base: "/smart-accounts/accounts",
            link: "/light-account",
            items: [
              { text: "Light Account", link: "/light-account" },
              { text: "Modular Account", link: "/modular-account" },
              { text: "Using Your Own", link: "/using-your-own" }
            ]
          },
          {
            text: "Choosing a Signer",
            base: "/smart-accounts/signers",
            items: [
              { text: "Magic.Link", link: "/magic-link" },
              { text: "Web3Auth", link: "/web3auth" },
              { text: "Externally Owned Account", link: "/eoa" },
              { text: "Using Your Own", link: "/using-your-own" },
              { text: "Contributing", link: "/contributing" }
            ]
          },
          { text: "Sponsoring Gas", items: [] },
          { text: "Batching Transactions", link: "/batching-transactions" },
          { text: "Transferring Ownership", link: "/transferring-ownership" }
        ]
      },
      // Per Package docs
      {
        text: "aa-core",
        base: "/packages/aa-core",
        link: "/",
        collapsed: true,
        items: [
          {
            text: "Provider",
            link: "/introduction",
            base: "/packages/aa-core/provider",
            items: [{ text: "sendUserOperation", link: "/sendUserOperation" }]
          },
          { text: "Accounts" },
          { text: "Signers" },
          { text: "Public Client" },
          { text: "Utilities" }
        ]
      },
      {
        text: "aa-alchemy",
        base: "/packages/aa-alchemy",
        link: "/",
        collapsed: true,
        items: []
      },
      {
        text: "aa-accounts",
        collapsed: true,
        link: "/",
        base: "/packages/aa-accounts",
        items: [
          {
            text: "LightSmartContractAccount",
            link: "/introduction",
            base: "/packages/aa-accounts/light-account",
            items: [
              { text: "signMessageWith6492", link: "/signMessageWith6492" },
              { text: "signTypedData", link: "/signTypedData" },
              { text: "signTypedDataWith6492", link: "/signTypedDataWith6492" },
              { text: "getOwner", link: "/getOwner" },
              {
                text: "encodeTransferOwnership",
                link: "/encodeTransferOwnership"
              },
              { text: "transferOwnership", link: "/transferOwnership" }
            ]
          },
          { text: "Contributing", link: "/contributing" }
        ]
      },
      {
        text: "aa-ethers",
        base: "/packages/aa-ethers",
        link: "/",
        collapsed: true,
        items: []
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" }
    ]
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWpheXZhc2lzaHQvRGVza3RvcC9hbGNoZW15L2FhLXNkay1wcml2YXRlL3NpdGUvLnZpdGVwcmVzc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FqYXl2YXNpc2h0L0Rlc2t0b3AvYWxjaGVteS9hYS1zZGstcHJpdmF0ZS9zaXRlLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hamF5dmFzaXNodC9EZXNrdG9wL2FsY2hlbXkvYWEtc2RrLXByaXZhdGUvc2l0ZS8udml0ZXByZXNzL2NvbmZpZy50c1wiO2ltcG9ydCB7ICQgfSBmcm9tIFwiZXhlY2FcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcblxuLy8gVGhpcyBtYWtlcyBzdXJlIHRoYXQgdGhpcyB3b3JrcyBpbiBmb3JrZWQgcmVwb3MgYXMgd2VsbFxuY29uc3QgZ2V0UmVwb1JvdXRlID0gJC5zeW5jYGdpdCByZXYtcGFyc2UgLS1zaG93LXRvcGxldmVsYDtcbmNvbnN0IHsgc3Rkb3V0OiBiYXNlUGF0aCB9ID0gJC5zeW5jYGJhc2VuYW1lICR7Z2V0UmVwb1JvdXRlfWA7XG5cbi8vIGh0dHBzOi8vdml0ZXByZXNzLmRldi9yZWZlcmVuY2Uvc2l0ZS1jb25maWdcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHRpdGxlOiBcIkFjY291bnQgS2l0XCIsXG4gIGRlc2NyaXB0aW9uOiBcIkFjY291bnQgQWJzdHJhY3Rpb24gTGVnb3NcIixcbiAgYmFzZTogYC8ke2Jhc2VQYXRofWAsXG4gIHRoZW1lQ29uZmlnOiB7XG4gICAgLy8gaHR0cHM6Ly92aXRlcHJlc3MuZGV2L3JlZmVyZW5jZS9kZWZhdWx0LXRoZW1lLWNvbmZpZ1xuICAgIG5hdjogW1xuICAgICAgeyB0ZXh0OiBcIkRvY3NcIiwgbGluazogXCIvZ2V0dGluZy1zdGFydGVkXCIgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogXCJFeGFtcGxlc1wiLFxuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbGNoZW15cGxhdGZvcm0vYWEtc2RrL3RyZWUvbWFpbi9leGFtcGxlc1wiLFxuICAgICAgfSxcbiAgICBdLFxuXG4gICAgc2lkZWJhcjogW1xuICAgICAgeyB0ZXh0OiBcIkludHJvZHVjdGlvblwiLCBsaW5rOiBcIi9pbnRyb2R1Y3Rpb25cIiB9LFxuICAgICAgeyB0ZXh0OiBcIkdldHRpbmcgU3RhcnRlZFwiLCBsaW5rOiBcIi9nZXR0aW5nLXN0YXJ0ZWRcIiB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiBcIlBhY2thZ2VzIE92ZXJ2aWV3XCIsXG4gICAgICAgIGxpbms6IFwiL3BhY2thZ2VzL292ZXJ2aWV3XCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiBcIlVzaW5nIFNtYXJ0IEFjY291bnRzXCIsXG4gICAgICAgIGJhc2U6IFwiL3NtYXJ0LWFjY291bnRzXCIsXG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgeyB0ZXh0OiBcIk92ZXJ2aWV3XCIsIGxpbms6IFwiL292ZXJ2aWV3XCIgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkNob29zaW5nIGEgU21hcnQgQWNjb3VudFwiLFxuICAgICAgICAgICAgYmFzZTogXCIvc21hcnQtYWNjb3VudHMvYWNjb3VudHNcIixcbiAgICAgICAgICAgIGxpbms6IFwiL2xpZ2h0LWFjY291bnRcIixcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJMaWdodCBBY2NvdW50XCIsIGxpbms6IFwiL2xpZ2h0LWFjY291bnRcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwiTW9kdWxhciBBY2NvdW50XCIsIGxpbms6IFwiL21vZHVsYXItYWNjb3VudFwiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJVc2luZyBZb3VyIE93blwiLCBsaW5rOiBcIi91c2luZy15b3VyLW93blwiIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJDaG9vc2luZyBhIFNpZ25lclwiLFxuICAgICAgICAgICAgYmFzZTogXCIvc21hcnQtYWNjb3VudHMvc2lnbmVyc1wiLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcIk1hZ2ljLkxpbmtcIiwgbGluazogXCIvbWFnaWMtbGlua1wiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJXZWIzQXV0aFwiLCBsaW5rOiBcIi93ZWIzYXV0aFwiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJFeHRlcm5hbGx5IE93bmVkIEFjY291bnRcIiwgbGluazogXCIvZW9hXCIgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcIlVzaW5nIFlvdXIgT3duXCIsIGxpbms6IFwiL3VzaW5nLXlvdXItb3duXCIgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcIkNvbnRyaWJ1dGluZ1wiLCBsaW5rOiBcIi9jb250cmlidXRpbmdcIiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgdGV4dDogXCJTcG9uc29yaW5nIEdhc1wiLCBpdGVtczogW10gfSxcbiAgICAgICAgICB7IHRleHQ6IFwiQmF0Y2hpbmcgVHJhbnNhY3Rpb25zXCIsIGxpbms6IFwiL2JhdGNoaW5nLXRyYW5zYWN0aW9uc1wiIH0sXG4gICAgICAgICAgeyB0ZXh0OiBcIlRyYW5zZmVycmluZyBPd25lcnNoaXBcIiwgbGluazogXCIvdHJhbnNmZXJyaW5nLW93bmVyc2hpcFwiIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgLy8gUGVyIFBhY2thZ2UgZG9jc1xuICAgICAge1xuICAgICAgICB0ZXh0OiBcImFhLWNvcmVcIixcbiAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtY29yZVwiLFxuICAgICAgICBsaW5rOiBcIi9cIixcbiAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiUHJvdmlkZXJcIixcbiAgICAgICAgICAgIGxpbms6IFwiL2ludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtY29yZS9wcm92aWRlclwiLFxuICAgICAgICAgICAgaXRlbXM6IFt7IHRleHQ6IFwic2VuZFVzZXJPcGVyYXRpb25cIiwgbGluazogXCIvc2VuZFVzZXJPcGVyYXRpb25cIiB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgdGV4dDogXCJBY2NvdW50c1wiIH0sXG4gICAgICAgICAgeyB0ZXh0OiBcIlNpZ25lcnNcIiB9LFxuICAgICAgICAgIHsgdGV4dDogXCJQdWJsaWMgQ2xpZW50XCIgfSxcbiAgICAgICAgICB7IHRleHQ6IFwiVXRpbGl0aWVzXCIgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6IFwiYWEtYWxjaGVteVwiLFxuICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1hbGNoZW15XCIsXG4gICAgICAgIGxpbms6IFwiL1wiLFxuICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6IFwiYWEtYWNjb3VudHNcIixcbiAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICBsaW5rOiBcIi9cIixcbiAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtYWNjb3VudHNcIixcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkxpZ2h0U21hcnRDb250cmFjdEFjY291bnRcIixcbiAgICAgICAgICAgIGxpbms6IFwiL2ludHJvZHVjdGlvblwiLFxuICAgICAgICAgICAgYmFzZTogXCIvcGFja2FnZXMvYWEtYWNjb3VudHMvbGlnaHQtYWNjb3VudFwiLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcInNpZ25NZXNzYWdlV2l0aDY0OTJcIiwgbGluazogXCIvc2lnbk1lc3NhZ2VXaXRoNjQ5MlwiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJzaWduVHlwZWREYXRhXCIsIGxpbms6IFwiL3NpZ25UeXBlZERhdGFcIiB9LFxuICAgICAgICAgICAgICB7IHRleHQ6IFwic2lnblR5cGVkRGF0YVdpdGg2NDkyXCIsIGxpbms6IFwiL3NpZ25UeXBlZERhdGFXaXRoNjQ5MlwiIH0sXG4gICAgICAgICAgICAgIHsgdGV4dDogXCJnZXRPd25lclwiLCBsaW5rOiBcIi9nZXRPd25lclwiIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcImVuY29kZVRyYW5zZmVyT3duZXJzaGlwXCIsXG4gICAgICAgICAgICAgICAgbGluazogXCIvZW5jb2RlVHJhbnNmZXJPd25lcnNoaXBcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiBcInRyYW5zZmVyT3duZXJzaGlwXCIsIGxpbms6IFwiL3RyYW5zZmVyT3duZXJzaGlwXCIgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IHRleHQ6IFwiQ29udHJpYnV0aW5nXCIsIGxpbms6IFwiL2NvbnRyaWJ1dGluZ1wiIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiBcImFhLWV0aGVyc1wiLFxuICAgICAgICBiYXNlOiBcIi9wYWNrYWdlcy9hYS1ldGhlcnNcIixcbiAgICAgICAgbGluazogXCIvXCIsXG4gICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgfSxcbiAgICBdLFxuXG4gICAgc29jaWFsTGlua3M6IFtcbiAgICAgIHsgaWNvbjogXCJnaXRodWJcIiwgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYWxjaGVteXBsYXRmb3JtL2FhLXNka1wiIH0sXG4gICAgXSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyVyxTQUFTLFNBQVM7QUFDN1gsU0FBUyxvQkFBb0I7QUFHN0IsSUFBTSxlQUFlLEVBQUU7QUFDdkIsSUFBTSxFQUFFLFFBQVEsU0FBUyxJQUFJLEVBQUUsZ0JBQWdCLFlBQVk7QUFHM0QsSUFBTyxpQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLEVBQ1AsYUFBYTtBQUFBLEVBQ2IsTUFBTSxJQUFJLFFBQVE7QUFBQSxFQUNsQixhQUFhO0FBQUE7QUFBQSxJQUVYLEtBQUs7QUFBQSxNQUNILEVBQUUsTUFBTSxRQUFRLE1BQU0sbUJBQW1CO0FBQUEsTUFDekM7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsRUFBRSxNQUFNLGdCQUFnQixNQUFNLGdCQUFnQjtBQUFBLE1BQzlDLEVBQUUsTUFBTSxtQkFBbUIsTUFBTSxtQkFBbUI7QUFBQSxNQUNwRDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTCxFQUFFLE1BQU0sWUFBWSxNQUFNLFlBQVk7QUFBQSxVQUN0QztBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sTUFBTTtBQUFBLFlBQ04sTUFBTTtBQUFBLFlBQ04sT0FBTztBQUFBLGNBQ0wsRUFBRSxNQUFNLGlCQUFpQixNQUFNLGlCQUFpQjtBQUFBLGNBQ2hELEVBQUUsTUFB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
