import type { ComponentDef } from "../types";

export const modalComponents: ComponentDef = {
  ".modal": {
    "@apply radius-t-2 md:radius-2": {},
    "@apply bg-bg-surface-default": {},
    ".modal-box": {
      "@apply z-[1] px-6 py-4": {},
    },
  },
};
