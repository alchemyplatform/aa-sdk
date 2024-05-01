import { withAccountKitUi } from "@alchemy/aa-alchemy/tailwind";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = withAccountKitUi({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {},
  plugins: [plugin(({ addComponents }) => {
    // use this as a playground to test out new styles and components before moving them
    addComponents({
    });
  })],
});

export default config;
