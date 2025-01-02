import { SidebarItem } from "vocs";
import { authenticatingUsersSidebar } from "./authenticating-users.js";

export const reactNativeSignerSidebar: SidebarItem[] = [
	{
		text: "Overview",
		link: "/react-native/signer/overview",
	},
	{
		text: "Setup",
		link: "/react-native/signer/setup-guide",
	},
	{
		text: "Authenticating Users",
		items: authenticatingUsersSidebar,
		collapsed: true,
	},
];
