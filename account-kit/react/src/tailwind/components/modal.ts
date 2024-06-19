import type { ComponentDef } from "../types";

export const modalComponents: ComponentDef = {
  ".modal": {
    "@apply rounded-t-2xl md:rounded-2xl": {},
    "@apply bg-bg-surface-default": {},
    ".modal-box": {
      "@apply z-[1] px-6 py-4": {},
    },
  },
};
