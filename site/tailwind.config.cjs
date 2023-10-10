/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{js,ts,jsx,tsx,md}"],
  darkMode: "class",
  important: true,
  theme: {
    extend: {
      backgroundImage: {
        "gradient-1": "linear-gradient(125deg, #ff9c27 0%, #fd48ce 51.7%)",
        "gradient-2":
          "linear-gradient(120deg, #5498ff 26.44%, #a131f9 109.11%)",
        "gradient-3":
          "linear-gradient(126deg, #ff37dc 26.26%, #733ff1 108.32%)",
        "gradient-4": "linear-gradient(123deg, #ff3a3a -4.89%, #fe8862 90.61%)",
      },
    },
  },
  plugins: [],
};
