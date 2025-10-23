import { withAccountKitUi } from "@account-kit/react/tailwind";

export default withAccountKitUi(
  {
    // Your existing Tailwind config (if any)
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  },
  {
    // Account Kit UI theme customizations (optional)
    // See customization guide below for available options
  },
);
