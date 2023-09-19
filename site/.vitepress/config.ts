import { $ } from "execa";
import { defineConfig } from "vitepress";

// This makes sure that this works in forked repos as well
const getRepoRoute = $.sync`git rev-parse --show-toplevel`;
const { stdout: basePath } = $.sync`basename ${getRepoRoute}`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Account Kit",
  description: "Account Abstraction Legos",
  base: `/${basePath}`,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/alchemyplatform/aa-sdk" },
    ],
  },
});
