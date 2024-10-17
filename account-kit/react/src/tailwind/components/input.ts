import type { ComponentDef } from "../types";

export const inputComponents: ComponentDef = {
  ".akui-input": {
    // container styling
    "@apply p-3 inline-flex gap-2 h-10 items-center": {},
    "@apply static-border": {},
    "@apply text-fg-primary text-sm": {},
    "@apply bg-bg-surface-default": {},
    "&-disabled, &:disabled, &[disabled]": {
      "@apply static-border pointer-events-none": {},
      [`@apply bg-bg-surface-inset`]: {},
      input: {
        "@apply bg-bg-surface-inset cursor-not-allowed": {},
        "@apply placeholder-fg-disabled": {},
      },
      "svg > *": {
        "@apply !fill-fg-disabled": {},
        // fill: `var(${getColorVariableName("fg-disabled")}) !important`,
      },
    },
    "svg > *": {
      "@apply fill-fg-primary": {},
      // fill: `var(${getColorVariableName("fg-primary")})`,
    },
    "&:focus, &:focus-visible, &:focus-within, &:active": {
      "@apply active-border": {},
    },
    "@apply radius": {},
    "&-error, &[error]": {
      "@apply critical-border": {},
    },

    // input field styling
    input: {
      "@apply appearance-none grow bg-inherit": {},
      "&:focus, &:focus-visible, &:focus-within, &:active": {
        "@apply outline-none": {},
      },
    },

    // utility class that matches the input fields state
    // here we use this to style something following the input based
    // on if the placeholder is shown
    ".akui-input:placeholder-shown + .match-input": {
      // for svg we want to set the fill to the disabled color
      // this makes a lot of assumptions about how our svgs are structured
      // pretty brittle so fix this later
      "> *": {
        "@apply fill-fg-disabled": {},
      },
      "@apply text-fg-disabled": {},
    },
  },
};
