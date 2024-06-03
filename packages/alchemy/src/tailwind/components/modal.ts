import type { ComponentDef } from "../types";

export const modalComponents: ComponentDef = {
  ".modal": {
    "@apply rounded-2xl": {},
    "@apply bg-bg-surface-default": {},
    "&::backdrop": {
      "@apply bg-black bg-opacity-[0.8]": {},
    },
    ".modal-box": {
      "@apply z-[1] px-6 py-4": {},
    },
    ".modal-backdrop": {
      "@apply fixed w-screen h-screen top-0 left-0": {},
      "@apply -z-[1] col-start-1 row-start-1 grid self-stretch justify-self-stretch text-transparent":
        {},
      button: {
        opacity: "0",
        "@apply h-screen w-screen cursor-default": {},
      },
    },
  },
};
