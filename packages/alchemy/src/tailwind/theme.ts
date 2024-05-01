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
      "fg-secondary": createColorSet("#475569", "#E2E8F0"),
      "fg-tertiary": createColorSet("#94A3B8", "#94A3B8"),
      "fg-invert": createColorSet("#FFF", "#000"),
      "fg-disabled": createColorSet("#CBD5E1", "#475569"),

      // surface colors
      "bg-surface-default": createColorSet("#fff", "#020617"),
      "bg-surface-subtle": createColorSet("#FBFDFF", "#0F172A"),
      "bg-surface-inset": createColorSet("#EFF4F9", "#1F2937"),
    },
  };
}
