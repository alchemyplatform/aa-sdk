import type { AccountKitTheme } from "./types.js";
import { createColorSet } from "./utils.js";

/**
 * Creates a default Tailwind theme object containing the default settings for the Account Kit UI.
 *
 * @returns {AccountKitTheme}  The default theme object.
 */
export function createDefaultTheme(): AccountKitTheme {
  return {
    colors: {
      active: createColorSet("#94A3B8", "#94A3B8"),
      static: createColorSet("#CBD5E1", "#374151"),
      critical: createColorSet("#F87171", "#DC2626"),

      // button colors
      "btn-primary": createColorSet("#E82594", "#FF66CC"),
      "btn-secondary": createColorSet("#E2E8F0", "#374151"),
      "btn-auth": createColorSet("#FFF", "argb(255, 255, 255, 0.05)"),

      // fg colors
      "fg-primary": createColorSet("#020617", "#fff"),
      "fg-secondary": createColorSet("#475569", "#E2E8F0"),
      "fg-tertiary": createColorSet("#94A3B8", "#94A3B8"),
      "fg-invert": createColorSet("#FFF", "#020617"),
      "fg-disabled": createColorSet("#CBD5E1", "#475569"),
      "fg-accent-brand": createColorSet("#E82594", "#FF66CC"),
      "fg-critical": createColorSet("#B91C1C", "#F87171"),
      "fg-success": createColorSet("#16A34A", "#86EFAC"),

      // surface colors
      "bg-surface-default": createColorSet("#fff", "#020617"),
      "bg-surface-subtle": createColorSet("#FBFDFF", "#0F172A"),
      "bg-surface-inset": createColorSet("#EFF4F9", "#1F2937"),
      "bg-surface-critical": createColorSet("#FEF2F2", "#FEF2F2"),
      "bg-surface-error": createColorSet("#DC2626", "#F87171"),
      "bg-surface-success": createColorSet("#16A34A", "#86EFAC"),
      "bg-surface-warning": createColorSet("#EA580C", "#FDBA74"),
    },
    borderRadius: "sm",
  };
}
