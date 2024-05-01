import type { ComponentDef } from "../types";
import { getColorVariableName } from "../utils.js";

export const inputComponents: ComponentDef = {
  ".input": {
    // container styling
    "@apply p-3 inline-flex gap-2 h-10 items-center": {},
    "@apply static-border": {},
    [`@apply text-[var(${getColorVariableName("fg-primary")})]`]: {},
    "&-disabled, &:disabled, &[disabled]": {
      "@apply static-border pointer-events-none": {},
      [`@apply bg-[var(${getColorVariableName("bg-surface-inset")})]`]: {},
      input: {
        [`@apply bg-[var(${getColorVariableName(
          "bg-surface-inset"
        )})] cursor-not-allowed`]: {},
        [`@apply placeholder-[var(${getColorVariableName("fg-disabled")})]`]:
          {},
      },
      "svg > *": {
        fill: `var(${getColorVariableName("fg-disabled")}) !important`,
      },
    },
    "svg > *": {
      fill: `var(${getColorVariableName("fg-primary")})`,
    },
    "&:focus, &:focus-visible, &:focus-within, &:active": {
      "@apply active-border": {},
    },
    borderRadius: "8px",
    "&-error, &[error]": {
      "@apply critical-border": {},
    },

    // input field styling
    input: {
      "@apply appearance-none": {},
      "&:focus, &:focus-visible, &:focus-within, &:active": {
        "@apply outline-none": {},
      },
    },

    // utility class that matches the input fields state
    // here we use this to style something following the input based
    // on if the placeholder is shown
    "input:placeholder-shown + .match-input": {
      // for svg we want to set the fill to the disabled color
      // this makes a lot of assumptions about how our svgs are structured
      // pretty brittle so fix this later
      "> *": {
        fill: `var(${getColorVariableName("fg-disabled")}) !important`,
      },
      [`@apply text-[var(${getColorVariableName("fg-disabled")})]`]: {},
    },
  },
};
