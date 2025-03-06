import type { AccountKitTheme, ComponentDef } from "../types";
import { getBorderRadiusBaseVariableName } from "../utils.js";

export function getBorderRadiusValue(
  borderRadius: AccountKitTheme["borderRadius"]
): string {
  switch (borderRadius) {
    case "lg":
      return "24px";
    case "md":
      return "16px";
    case "xs":
      return "4px";
    case "none":
      return "0px";
    case "sm":
    default:
      return "8px";
  }
}

export function borderRadiusVariables(theme: AccountKitTheme): ComponentDef {
  return {
    ":root": {
      [getBorderRadiusBaseVariableName()]: getBorderRadiusValue(
        theme.borderRadius
      ),
    },
  };
}
