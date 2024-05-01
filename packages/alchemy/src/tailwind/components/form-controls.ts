import type { ComponentDef } from "../types.js";
import { getColorVariableName } from "../utils.js";

export const formControlComponents: ComponentDef = {
  ".form-controls": {
    "@apply flex flex-col gap-2": {},
    [`@apply text-[var(${getColorVariableName("fg-secondary")})]`]: {},
    ".form-label": {
      "@apply text-sm font-medium": {},
    },
    ".form-hint": {
      "@apply text-xs font-normal": {},
    },
    ".input-error + .form-hint, .input[error] + .form-hint": {
      [`@apply text-[var(${getColorVariableName("critical")})]`]: {},
    },
  },
};
