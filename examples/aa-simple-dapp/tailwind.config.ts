import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-1": "linear-gradient(125deg, #ff9c27 0%, #fd48ce 51.7%)",
        "gradient-2":
          "linear-gradient(120deg, #5498ff 26.44%, #a131f9 109.11%)",
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
