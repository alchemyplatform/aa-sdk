import { cn } from "@/lib/utils";
import { useConfigStore } from "@/state";
import { PaletteIcon } from "../icons/palette";
import { SparkleIcon } from "../icons/sparkle";
import ExternalLink from "../shared/ExternalLink";
import { HelpTooltip } from "../shared/HelpTooltip";
import { ThemeSwitch } from "../shared/ThemeSwitch";
import { ColorPicker } from "./ColorPicker";
import { PhotoUploads } from "./PhotoUpload";

import { CornerRadiusOptions } from "./components/CornerRadiusOptions";
import { IllustrationStyleOptions } from "./components/IllustrationStyleOptions";

export function Styling({ className }: { className?: string }) {
  const { logo, setSupportUrl, setTheme, supportUrl, theme } = useConfigStore(
    ({ supportUrl, ui, setTheme, setSupportUrl }) => {
      return {
        logo: ui.theme === "dark" ? ui.logoDark : ui.logoLight,
        supportUrl,
        theme: ui.theme,
        setTheme,
        setSupportUrl,
      };
    }
  );

  const onSwitchTheme = (isDarkMode: boolean) => {
    setTheme(isDarkMode ? "dark" : "light");
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center gap-2">
          <PaletteIcon />
          <span className="font-semibold">Branding</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full border-b border-border pb-5">
        <div className="flex flex-row justify-between grow items-center">
          <p className="font-medium text-sm text-secondary-foreground">Theme</p>
          <ThemeSwitch
            checked={theme === "dark"}
            onCheckedChange={onSwitchTheme}
          />
        </div>
        <div className="flex flex-row justify-between grow items-center">
          <p className="font-medium text-sm text-secondary-foreground">Color</p>
          <ColorPicker theme={theme} />
        </div>
        <div className="flex flex-row justify-between grow items-center">
          <div>
            <p className="font-medium text-sm text-secondary-foreground">
              Logo{" "}
              <span className="text-fg-tertiary font-normal">(optional)</span>
            </p>
            <p className="text-fg-tertiary font-normal text-xs">
              {logo?.fileName ? (
                <span className="truncate block max-w-[200px]">
                  {logo.fileName}
                </span>
              ) : (
                "SVG or PNG, max 320x48 px"
              )}
            </p>
          </div>
          <PhotoUploads mode={theme} />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-4 items-start">
        <p className="font-medium text-secondary-foreground text-sm">
          Corner radius
        </p>
        <CornerRadiusOptions />
      </div>
      <div className="flex flex-col gap-2 md:gap-4 items-start">
        <div className="flex items-center gap-1">
          <p className="font-medium text-secondary-foreground text-sm">
            Illustration Style
          </p>
          <HelpTooltip text="These will appear as supplementary graphics on certain screens" />
        </div>

        <IllustrationStyleOptions />
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <label
          htmlFor="support-url"
          className="font-medium text-sm text-secondary-foreground"
        >
          Support URL{" "}
          <span className="text-fg-tertiary font-normal">(optional)</span>
        </label>
        <input
          id="support-url"
          value={supportUrl}
          onChange={(e) => setSupportUrl(e.target.value)}
          onBlur={(e) => setSupportUrl(e.target.value)}
          className="w-full border border-border rounded-lg px-[10px] py-[14px] h-10 text-sm"
          placeholder="website, telegram, or email"
        />
      </div>
      <LearnMore />
    </div>
  );
}

function LearnMore() {
  return (
    <div className="flex items-center gap-1 text-xs flex-1 w-full justify-center">
      <SparkleIcon />
      <div className="text-secondary">
        Customize every pixel with{" "}
        <ExternalLink
          className="font-semibold text-btn-primary"
          href="https://github.com/alchemyplatform/aa-sdk/blob/v4.x.x/account-kit/react/src/tailwind/types.ts#L6"
        >
          CSS
        </ExternalLink>{" "}
        overrides
      </div>
    </div>
  );
}
