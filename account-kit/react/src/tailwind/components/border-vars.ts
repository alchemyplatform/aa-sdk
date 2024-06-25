import type { AccountKitTheme, ComponentDef } from "../types";
import { getBorderRadiusBaseVariableName } from "../utils.js";

export const borderRadiusVariables = (theme: AccountKitTheme): ComponentDef => {
  const { borderRadius } = theme;
  const borderRadiusValue = (() => {
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
  })();

  return {
    ":root": {
      [getBorderRadiusBaseVariableName()]: borderRadiusValue,
    },
  };
};
