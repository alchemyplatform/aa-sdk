import { type PluginAPI } from "tailwindcss/types/config";

export type ColorVariant = "dark" | "light";
export type ColorVariantRecord = Record<ColorVariant, string>;

export interface AccountKitTheme {
  colors: {
    active: ColorVariantRecord;
    static: ColorVariantRecord;
    critical: ColorVariantRecord;

    // button colors
    "btn-primary": ColorVariantRecord;
    "btn-secondary": ColorVariantRecord;
    "btn-auth": ColorVariantRecord;

    // fg colors
    "fg-primary": ColorVariantRecord;
    "fg-secondary": ColorVariantRecord;
    "fg-tertiary": ColorVariantRecord;
    "fg-invert": ColorVariantRecord;
    "fg-disabled": ColorVariantRecord;
    "fg-accent-brand": ColorVariantRecord;
    "fg-critical": ColorVariantRecord;
    "fg-success": ColorVariantRecord;

    // surface colors
    "bg-surface-default": ColorVariantRecord;
    "bg-surface-subtle": ColorVariantRecord;
    "bg-surface-inset": ColorVariantRecord;
    "bg-surface-critical": ColorVariantRecord;
    "bg-surface-success": ColorVariantRecord;
    "bg-surface-warning": ColorVariantRecord;
    "bg-surface-error": ColorVariantRecord;
  };
  // these define the border radius base for the various components.
  // the mapped value applies to the smallest value used and everything scales up from there by multiple of 2
  borderRadius: "none" | "xs" | "sm" | "md" | "lg";
}

export type AccountKitThemeColor = keyof AccountKitTheme["colors"];

export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type AccountKitThemeOverride = DeepPartial<AccountKitTheme>;

export type ComponentDef = Parameters<PluginAPI["addComponents"]>[0];
export type UtilityDef = Parameters<PluginAPI["addUtilities"]>[0];
export type ThemeFn = PluginAPI["theme"];
