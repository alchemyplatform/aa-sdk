import type { ComponentDef } from "../types.js";

export const formControlComponents: ComponentDef = {
  ".akui-form-controls": {
    "@apply flex flex-col gap-2": {},
    "@apply text-fg-secondary": {},
  },
  ".akui-form-label": {
    "@apply text-sm font-medium": {},
  },
  ".akui-form-hint": {
    "@apply text-xs font-normal": {},
  },
  ".akui-input-error + .akui-form-hint, .akui-input[error] + .akui-form-hint": {
    "@apply text-critical": {},
  },
};
