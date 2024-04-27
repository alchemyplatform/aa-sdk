import type { Config as TailwindConfig } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { buttonComponents } from "./components/buttons.js";
import { colorVariables } from "./components/colorsvars.js";
import { createDefaultTheme } from "./theme.js";
import type { AccountKitThemeOverride } from "./types";
import { borderUtilities } from "./utilities/borders.js";
import { buttonUtilities } from "./utilities/buttons.js";
import { apply } from "./utils.js";

type TailWindPlugin = ReturnType<typeof plugin>;

/**
 * Get the path to the aa-alchemy package and the tailwind content.
 * This is used within the tailwind.config.js to include the aa-alchemy content.
 *
 * @example
 * ```ts
 *
 * import accountKitUi, { getAccountKitContentPath } from "@alchemy/aa-alchemy/tailwind";
 * import type { Config } from "tailwindcss";
 *
 * const config: Config = {
 *  content: [
 *    ...otheContetPaths
 *   getAccountKitContentPath()
 *  ],
 *  theme: {},
 *  plugins: [accountKitUi()],
 * };
 *
 * export default config;
 * ```
 * @returns The resolved path to the aa-alchemy package and the tailwind content
 */
export const getAccountKitContentPath = () => {
  const pathToMe = require.resolve("@alchemy/aa-alchemy");
  const contentPath = `${pathToMe.replace(
    "index.js",
    ""
  )}**/*.{js,ts,jsx,tsx,mdx}`;

  return contentPath;
};

/**
 * Given an optional theme override, returns a tailwind plugin that
 * creates all of the necessary css to use the account kit ui components.
 *
 * @example
 * ```ts
 *
 * import accountKitUi, { getAccountKitContentPath } from "@alchemy/aa-alchemy/tailwind";
 * import type { Config } from "tailwindcss";
 *
 * const config: Config = {
 *  content: [
 *    ...otheContetPaths
 *   getAccountKitContentPath()
 *  ],
 *  theme: {},
 *  plugins: [accountKitUi()],
 * };
 *
 * export default config;
 * ```
 * @param themeOverride optional parameter that allows for overriding any of the default account kit theme values
 * @returns a TailwindPlugin to be used within the tailwind.config.js
 */
export const accountKitUi: (
  themeOverride?: AccountKitThemeOverride
) => TailWindPlugin = (themeOverride) => {
  const defaultTheme = createDefaultTheme();
  const accountKitTheme = apply(defaultTheme, themeOverride);

  return plugin(
    ({ addComponents, addUtilities }) => {
      // utilities
      addUtilities(buttonUtilities);
      addUtilities(borderUtilities);

      // components
      addComponents(colorVariables(accountKitTheme));
      addComponents(buttonComponents);
    },
    {
      theme: {
        extend: {
          ...accountKitTheme,
        },
      },
    }
  );
};

/**
 * A utility function for augmenting an existing tailwind config with the account kit ui components
 *
 * @param config the existing tailwind config
 * @param themeOverride optional parameter that allows overrides to Account Kit UI theme styles
 * @returns the augmented tailwind config
 */
export const withAccountKitUi = (
  config: TailwindConfig,
  themeOverride?: AccountKitThemeOverride
): TailwindConfig => ({
  ...config,
  content: Array.isArray(config.content)
    ? [...config.content, getAccountKitContentPath()]
    : {
        ...config.content,
        files: [...config.content.files, getAccountKitContentPath()],
      },
  plugins: [...(config.plugins ?? []), accountKitUi(themeOverride)],
});
