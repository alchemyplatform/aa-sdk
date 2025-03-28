import type { Config as TailwindConfig } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { borderRadiusVariables } from "./components/border-vars.js";
import { buttonComponents } from "./components/buttons.js";
import { colorVariables } from "./components/colorsvars.js";
import { formControlComponents } from "./components/form-controls.js";
import { inputComponents } from "./components/input.js";
import { modalComponents } from "./components/modal.js";
import { createDefaultTheme } from "./theme.js";
import type { AccountKitThemeColor, AccountKitThemeOverride } from "./types.js";
import {
  borderRadiusUtilities,
  borderRadiusValues,
  borderUtilities,
} from "./utilities/borders.js";
import { apply, getColorVariableName } from "./utils.js";

type TailWindPlugin = ReturnType<typeof plugin>;

/**
 * Get the path to the @account-kit/react package and the tailwind content.
 * This is used within the tailwind.config.js to include the @account-kit content.
 *
 * @example
 * ```ts
 *
 * import accountKitUi, { getAccountKitContentPath } from "@account-kit/react/tailwind";
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
 * @returns {string} The resolved path to the @account-kit/react package and the tailwind content
 */
export const getAccountKitContentPath = () => {
  const pathToMe = require.resolve("@account-kit/react");
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
 * import accountKitUi, { getAccountKitContentPath } from "@account-kit/react/tailwind";
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
 * @param {AccountKitThemeOverride} themeOverride optional parameter that allows for overriding any of the default account kit theme values
 * @returns {TailWindPlugin} a TailwindPlugin to be used within the tailwind.config.js
 */
export const accountKitUi: (
  themeOverride?: AccountKitThemeOverride
) => TailWindPlugin = (themeOverride) => {
  const defaultTheme = createDefaultTheme();
  const accountKitTheme = apply(defaultTheme, themeOverride);
  const { colors, borderRadius, ...rest } = accountKitTheme;

  return plugin(
    ({ addComponents, addUtilities, matchUtilities, addBase }) => {
      // base
      addBase(colorVariables(accountKitTheme));
      addBase(borderRadiusVariables(accountKitTheme));

      // utilities
      addUtilities(borderUtilities);

      // components
      addComponents(buttonComponents);
      addComponents(inputComponents);
      addComponents(formControlComponents);
      addComponents(modalComponents);
      matchUtilities(borderRadiusUtilities, {
        values: borderRadiusValues,
      });
    },
    {
      theme: {
        extend: {
          ...rest,
          colors: Object.keys(colors).reduce(
            (acc, key) => ({
              ...acc,
              [key]: `var(${getColorVariableName(
                key as AccountKitThemeColor
              )})`,
            }),
            {} as Record<AccountKitThemeColor, string>
          ),
          keyframes: {
            "fade-in": {
              "0%": { opacity: "0" },
              "100%": { opacity: "1" },
            },
            "slide-up": {
              "0%": {
                transform: "translateY(100%)",
                opacity: "0",
              },
              "100%": {
                transform: "translateY(0%)",
                opacity: "1",
              },
            },
            "fade-out": {
              "0%": { opacity: "1" },
              "100%": { opacity: "0" },
            },
            "slide-down": {
              "0%": {
                transform: "translateY(0%)",
                opacity: "1",
              },
              "100%": {
                transform: "translateY(100%)",
                opacity: "0",
              },
            },
          },
          animation: {
            "fade-in": "fade-in 150ms ease",
            "slide-up": "slide-up 350ms cubic-bezier(.15,1.15,0.6,1.00)",
            "fade-out": "fade-out 150ms ease",
            "slide-down": "slide-down 350ms cubic-bezier(.15,1.15,0.6,1.00)",
          },
        },
      },
    }
  );
};

/**
 * A utility function for augmenting an existing tailwind config with the account kit ui components
 *
 * @param {TailwindConfig} config the existing tailwind config
 * @param {AccountKitThemeOverride} themeOverride optional parameter that allows overrides to Account Kit UI theme styles
 * @returns {TailwindConfig} the augmented tailwind config
 */
export const withAccountKitUi = (
  config: Partial<TailwindConfig>,
  themeOverride?: AccountKitThemeOverride
): TailwindConfig => ({
  darkMode: [
    "variant",
    [
      "@media (prefers-color-scheme: dark) { &:not(.light, .light *) }",
      "&:is(.dark, .dark *)",
    ],
  ],
  ...config,
  content: Array.isArray(config.content)
    ? [...config.content, getAccountKitContentPath()]
    : {
        ...config.content,
        files: [
          ...(Array.isArray(config.content?.files) ? config.content.files : []),
          getAccountKitContentPath(),
        ],
      },
  plugins: [...(config.plugins ?? []), accountKitUi(themeOverride)],
});
