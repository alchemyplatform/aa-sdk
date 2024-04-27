import { withAccountKitUi } from "@alchemy/aa-alchemy/tailwind";
import type { Config } from "tailwindcss";

const config: Config = withAccountKitUi({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {},
  plugins: [],
});

export default config;
