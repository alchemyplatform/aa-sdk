import type { UtilityDef } from "../types.js";
import { getColorVariableName } from "../utils.js";

/**
 * A utility function for generating the account kit button utilities
 *
 * @returns a utility definition object
 */
export const buttonUtilities: UtilityDef = {
  ".btn-bg-primary": {
    backgroundColor: `var(${getColorVariableName("btn-primary")})`,
    color: `var(${getColorVariableName("fg-invert")})`,
  },
  ".btn-bg-secondary": {
    backgroundColor: `var(${getColorVariableName("btn-secondary")})`,
    color: `var(${getColorVariableName("fg-primary")})`,
  },
  ".btn-bg-social": {
    backgroundColor: `var(${getColorVariableName("btn-social")})`,
    color: `var(${getColorVariableName("fg-primary")})`,
  },
};
