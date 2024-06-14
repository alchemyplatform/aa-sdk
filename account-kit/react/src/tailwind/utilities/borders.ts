import type { UtilityDef } from "../types.js";
import { getColorVariableName } from "../utils.js";

/**
 * A utility function for generating the account kit border utilities
 *
 * @returns a utility definition object
 */
export const borderUtilities: UtilityDef = {
  ".active-border": {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: `var(${getColorVariableName("active")})`,
  },
  ".static-border": {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: `var(${getColorVariableName("static")})`,
  },
  ".critical-border": {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: `var(${getColorVariableName("critical")})`,
  },
};
