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
          "colors": {
            "active": {
              "dark": "#94A3B8",
              "light": "#94A3B8",
            },
            "btn-primary": {
              "dark": "#fff",
              "light": "#000",
            },
            "btn-secondary": {
              "dark": "#374151",
              "light": "#E2E8F0",
            },
            "btn-social": {
              "dark": "argb(255, 255, 255, 0.05)",
              "light": "#FFF",
            },
            "critical": {
              "dark": "#DC2626",
              "light": "#F87171",
            },
            "fg-invert": {
              "dark": "#000",
              "light": "#FFF",
            },
            "fg-primary": {
              "dark": "#fff",
              "light": "#000",
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
