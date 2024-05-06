import type { ComponentDef } from "../types";

export const buttonComponents: ComponentDef = {
  ".btn": {
    "@apply p-3 inline-flex h-10 font-semibold": {},
    "@apply gap-2": {},
    "@apply items-center justify-center": {},
    "@apply shrink-0": {},
    "@apply cursor-pointer": {},
    // for w/e reason, using @apply rounded-[8px] doesn't work
    borderRadius: "8px",
    "&:hover": {
      // this is simpler than using the hover: with apply directive
      boxShadow: "2.8px 2.8px 8.8px 0px rgba(22, 22, 22, 0.14)",
    },
    "@apply disabled:cursor-not-allowed disabled:opacity-25 disabled:shadow-none":
      {},
    "@apply active:shadow-none": {},
  },
  ".btn-primary": {
    "@apply bg-btn-primary text-fg-invert": {},
  },
  ".btn-secondary": {
    "@apply bg-btn-secondary text-fg-primary": {},
  },
  ".btn-auth": {
    "@apply bg-btn-social text-fg-primary": {},
    "@apply static-border": {},
  },
};
