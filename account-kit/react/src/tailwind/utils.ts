import type {
  AccountKitThemeColor,
  ColorVariantRecord,
  DeepPartial,
} from "./types";

/**
 * Creates a color object to be used within account kit utilities, components, and themes
 *
 * @param {string} light the light mode color value
 * @param {string} dark the dark mode color value
 * @returns {ColorVariantRecord} the color set object
 */
export const createColorSet = (
  light: string,
  dark: string,
): ColorVariantRecord => ({
  light,
  dark,
});

/**
 * Overwrites the values in S with values in T if they exist
 *
 * @template {Record<string, any>} S the source object type
 * @param {S} source the source object to replace values with those from target
 * @param {DeepPartial<S>} target the target object to use as a source of truth
 * @returns {S} the deeply merged object of S and T
 */
export const apply = <S extends Record<string, any>>(
  source: S,
  target?: DeepPartial<S>,
): S => {
  if (!target) return source;

  for (const key in source) {
    if (target[key] == null) {
      continue;
    } else if (typeof source[key] !== "object") {
      // Also this seems to be fine when building with esm but not cjs or doing cli build
      // vscode complains this isn't an issue but TS does. I dunno
      // @ts-expect-error typescript doesn't like this but the tests pass
      source[key] = target[key];
    } else {
      apply(source[key], target[key]);
    }
  }

  return source;
};

/**
 * Given an Account Kit theme color name, returns the css variable name
 *
 * @param {AccountKitThemeColor} name one of the Account Kit theme color names
 * @returns {string} the css variable name
 */
export const getColorVariableName = (name: AccountKitThemeColor): string => {
  // add a prefix to the color variable name to avoid conflicts
  return `--akui-${name}`;
};

/**
 * Used to get the css variable name for the base border radius
 *
 * @returns {string} the css variable name for the base border radius
 */
export const getBorderRadiusBaseVariableName = (): string => {
  return "--akui-border-radius-base";
};

/**
 * Returns a css value for scaling the base border radius
 *
 * @param {number} scale the scale factor to apply to the base border radius
 * @returns {string} Returns a css value for scaling the base border radius
 */
export const getScaledBorderRadius = (scale: number) => {
  return `calc(var(${getBorderRadiusBaseVariableName()}) * ${scale})`;
};
