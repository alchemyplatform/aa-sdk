import { DefaultTheme } from "vitepress/types/default-theme";
import { aaAccountsSidebar } from "./aa-accounts";
import { aaAlchemySidebar } from "./aa-alchemy";
import { aaCoreSidebar } from "./aa-core";
import { aaEthersSidebar } from "./aa-ethers";
import { aaSignersSidebar } from "./aa-signers";

export const packagesSidebar: DefaultTheme.SidebarItem = {
  text: "aa-sdk Packages",
  base: "/packages",
  items: [
    { text: "Overview", link: "/" },
    aaCoreSidebar,
    aaAlchemySidebar,
    aaAccountsSidebar,
    aaSignersSidebar,
    aaEthersSidebar,
  ],
};
