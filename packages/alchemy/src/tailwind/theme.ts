import type { AccountKitTheme } from "./types.js";
import { createColorSet } from "./utils.js";

/**
 * Creates a default Tailwind theme object containing the default settings for the Account Kit UI.
 *
 * @returns The default theme object.
 */
export function createDefaultTheme(): AccountKitTheme {
  return {
    colors: {
      active: createColorSet("#94A3B8", "#94A3B8"),
      static: createColorSet("#CBD5E1", "#374151"),
      critical: createColorSet("#F87171", "#DC2626"),

      // button colors
      "btn-primary": createColorSet("#000", "#fff"),
      "btn-secondary": createColorSet("#E2E8F0", "#374151"),
      "btn-social": createColorSet("#FFF", "argb(255, 255, 255, 0.05)"),

      // fg colors
      "fg-primary": createColorSet("#000", "#fff"),
      "fg-invert": createColorSet("#FFF", "#000"),

      // surface colors
    },
  };
}
