import { createDefaultTheme } from "./theme.js";
import type { AccountKitThemeOverride } from "./types.js";
import { apply, createColorSet } from "./utils.js";

describe("tailwind utils test", () => {
  describe("merge tests", () => {
    it("should correctly override items in the default theme", () => {
      const theme = createDefaultTheme();
      const override: AccountKitThemeOverride = {
        colors: {
          border: {
            active: createColorSet("light", "dark"),
          },
          "bg-btn-primary": createColorSet("btn", "primary"),
        },
      };

      expect(apply(theme, override)).toMatchInlineSnapshot(`
        {
          "borderRadius": "sm",
          "colors": {
            "active": {
              "dark": "#94A3B8",
              "light": "#94A3B8",
            },
            "bg-surface-critical": {
              "dark": "#FEF2F2",
              "light": "#FEF2F2",
            },
            "bg-surface-default": {
              "dark": "#020617",
              "light": "#fff",
            },
            "bg-surface-error": {
              "dark": "#F87171",
              "light": "#DC2626",
            },
            "bg-surface-inset": {
              "dark": "#1F2937",
              "light": "#EFF4F9",
            },
            "bg-surface-subtle": {
              "dark": "#0F172A",
              "light": "#FBFDFF",
            },
            "bg-surface-success": {
              "dark": "#86EFAC",
              "light": "#16A34A",
            },
            "bg-surface-warning": {
              "dark": "#FDBA74",
              "light": "#EA580C",
            },
            "btn-auth": {
              "dark": "argb(255, 255, 255, 0.05)",
              "light": "#FFF",
            },
            "btn-primary": {
              "dark": "#FF66CC",
              "light": "#E82594",
            },
            "btn-secondary": {
              "dark": "#374151",
              "light": "#E2E8F0",
            },
            "critical": {
              "dark": "#DC2626",
              "light": "#F87171",
            },
            "fg-accent-brand": {
              "dark": "#FF66CC",
              "light": "#E82594",
            },
            "fg-critical": {
              "dark": "#F87171",
              "light": "#B91C1C",
            },
            "fg-disabled": {
              "dark": "#475569",
              "light": "#CBD5E1",
            },
            "fg-invert": {
              "dark": "#020617",
              "light": "#FFF",
            },
            "fg-primary": {
              "dark": "#fff",
              "light": "#020617",
            },
            "fg-secondary": {
              "dark": "#E2E8F0",
              "light": "#475569",
            },
            "fg-success": {
              "dark": "#86EFAC",
              "light": "#16A34A",
            },
            "fg-tertiary": {
              "dark": "#94A3B8",
              "light": "#94A3B8",
            },
            "static": {
              "dark": "#374151",
              "light": "#CBD5E1",
            },
          },
        }
      `);
    });

    it("should correctly return the original theme if no override is passed", () => {
      const defaultTheme = createDefaultTheme();

      expect(apply(defaultTheme)).toBe(defaultTheme);
    });
  });
});
