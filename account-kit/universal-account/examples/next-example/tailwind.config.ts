import { withAccountKitUi } from "@account-kit/react/tailwind";

export default withAccountKitUi(
  {
    // Existing Tailwind config
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  },
  {
    // AccountKit UI theme customizations (optional)
  }
);
