import type { ComponentDef } from "../types";

export const buttonComponents: ComponentDef = {
  ".btn": {
    "@apply p-3 inline-flex h-10 font-semibold": {},
    "@apply gap-2": {},
    "@apply items-center": {},
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
    "@apply btn-bg-primary": {},
  },
  ".btn-secondary": {
    "@apply btn-bg-secondary": {},
  },
  ".btn-auth": {
    "@apply btn-bg-social": {},
    "@apply static-border": {},
  },
};
