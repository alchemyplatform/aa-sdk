import type { ComponentDef } from "../types";

export const buttonComponents: ComponentDef = {
  ".btn-group": {
    "@apply flex flex-row gap-3 flex-wrap": {},
    " > .btn:first-child": {
      "@apply grow shrink-0 min-w-full": {},
    },
    " > .btn:not(:first-child)": {
      "@apply flex-1": {},
    },
    "&:has(> :nth-child(4)) > .btn:not(:first-child) > .btn-content": {
      display: "none",
    },
  },
  ".btn": {
    "@apply max-h-[40px]": {},
    "@apply p-3 inline-flex h-10 font-semibold text-base sm:text-sm": {},
    "@apply gap-2": {},
    "@apply items-center justify-center": {},
    "@apply shrink-0": {},
    "@apply cursor-pointer": {},
    "@apply transition-shadow": {},
    "@apply radius": {},
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
    "@apply bg-btn-auth text-fg-primary": {},
    "@apply static-border": {},
  },
  ".btn-link": {
    // clear out the default button styles
    "@apply appearance-none active:appearance-none hover:appearance-none": {},
    "@apply p-0 h-[unset]": {},
    "@apply cursor-pointer": {},
    "@apply text-fg-accent-brand": {},
    "@apply disabled:cursor-not-allowed disabled:opacity-25 disabled:shadow-none":
      {},
    "&:hover": {
      // this is simpler than using the hover: with apply directive
      boxShadow: "unset",
    },
    "@apply active:opacity-25": {},
  },
};
