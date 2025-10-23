// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      "import/extensions": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
    },
    ignores: ["dist/*"],
  },
]);
