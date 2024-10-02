import type { UtilityDef } from "../types.js";
import { getColorVariableName, getScaledBorderRadius } from "../utils.js";

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
  // default border radius
  ".radius": {
    borderRadius: getScaledBorderRadius(1),
  },
};

export const borderRadiusValues = {
  "1": 1,
  "2": 2,
  "4": 4,
};

export const borderRadiusUtilities = {
  radius: (value: string | number) => ({
    borderRadius:
      typeof value === "string" ? value : getScaledBorderRadius(value),
  }),
  "radius-t": (value: string | number) => ({
    borderTopLeftRadius:
      typeof value === "string" ? value : getScaledBorderRadius(value),
    borderTopRightRadius:
      typeof value === "string" ? value : getScaledBorderRadius(value),
  }),
};
