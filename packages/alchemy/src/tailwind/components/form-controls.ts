import type { ComponentDef } from "../types.js";

export const formControlComponents: ComponentDef = {
  ".form-controls": {
    "@apply flex flex-col gap-2": {},
    "@apply text-fg-secondary": {},
    ".form-label": {
      "@apply text-sm font-medium": {},
    },
    ".form-hint": {
      "@apply text-xs font-normal": {},
    },
    ".input-error + .form-hint, .input[error] + .form-hint": {
      "@apply text-critical": {},
    },
  },
};
