import type {
  AccountKitTheme,
  AccountKitThemeColor,
  ComponentDef,
} from "../types";
import { getColorVariableName } from "../utils.js";

/**
 * Converts the color configs in the account kit theme to CSS variables.
 *
 * @param {AccountKitTheme} theme the account kit theme
 * @returns {ComponentDef} a CSS rules object which adds the color variables to the root element
 */
export const colorVariables = (theme: AccountKitTheme): ComponentDef => {
  // This assumes that the colors object is a flat object of type { [name: string]: ColorVariantRecord }
  const { colors } = theme;
  const rules = Object.entries(colors).reduce((accum, [name_, variant]) => {
    const name = name_ as AccountKitThemeColor;
    accum[
      `@apply [${getColorVariableName(name)}:${variant.light.replaceAll(
        " ",
        "_"
      )}] dark:[${getColorVariableName(name)}:${variant.dark.replaceAll(
        " ",
        "_"
      )}]`
    ] = {};

    return accum;
  }, {} as Record<string, {}>);

  return {
    ":root": {
      ...rules,
    },
  };
};
