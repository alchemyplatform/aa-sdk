// eslint-disable-next-line import/extensions
import { withAccountKitUi } from "./src/tailwind/plugin";

export default withAccountKitUi({
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./.storybook/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  prefix: 'alchemy-',
  plugins: [],
});