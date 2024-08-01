import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";
import { PhotoUploads } from "./PhotoUpload";
import { ThemeSwitch } from "../shared/ThemeSwitch";
import { FileCode } from "lucide-react";
import ExternalLink from "../shared/ExternalLink";
import { IllustrationStyle } from "../icons/illustration-style";
import { getBorderRadiusValue } from "@account-kit/react/tailwind";
import { useConfig } from "@/app/state";
import { HelpTooltip } from "../shared/HelpTooltip";

export function Styling({ className }: { className?: string }) {
  const { config, setConfig } = useConfig();

  const onSwitchTheme = (isDarkMode: boolean) => {
    setConfig((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        theme: isDarkMode ? "dark" : "light",
      },
    }));
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-col gap-4 border-b border-border pt-8 pb-5">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-secondary-foreground text-sm">
            Appearance
          </p>
          <HelpTooltip text="Preview how the UI will look in light and dark mode - once integrated, the components will automatically adapt to the OS setting or a .light/.dark class on the root element" />
        </div>

        <ThemeSwitch
          checked={config.ui.theme === "dark"}
          onCheckedChange={onSwitchTheme}
        />
      </div>

      <div className="flex flex-col gap-4 border-b border-border pt-4 pb-5 items-start">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-secondary-foreground text-sm">
            Color
          </p>
          <HelpTooltip text="Color changes will be applied to buttons, text links and illustrations" />
        </div>

        <div className="flex gap-2 self-stretch">
          <div className="flex flex-col gap-2 flex-1 basis-0">
            <div className="text-gray-600 text-xs font-semibold">
              Light mode
            </div>
            <ColorPicker theme="light" />
          </div>
          <div className="flex flex-col gap-2 flex-1 basis-0">
            <div className="text-gray-600 text-xs font-semibold">Dark mode</div>
            <ColorPicker theme="dark" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-border pt-4 pb-5 items-start">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-secondary-foreground text-sm">
            Logo
          </p>
          <HelpTooltip text="PNG, JPG, GIF files accepted" />
        </div>

        <div className="flex self-stretch gap-8">
          <PhotoUploads mode="light" />
          <PhotoUploads mode="dark" />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-border pt-4 pb-5 items-start">
        <p className="font-semibold text-secondary-foreground text-sm">
          Corner radius
        </p>

        <CornerRadiusOptions />
      </div>

      <div className="flex flex-col gap-4 pt-4 pb-5 items-start">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-secondary-foreground text-sm">
            Illustration Style
          </p>
          <HelpTooltip text="These will appear as supplementary graphics on certain screens" />
        </div>

        <IllustrationStyleOptions />
      </div>

      <LearnMore />
    </div>
  );
}

const RADIUS_OPTIONS = [
  { label: "None", id: "none" as const },
  { label: "Small", id: "sm" as const },
  { label: "Medium", id: "md" as const },
  { label: "Large", id: "lg" as const },
];

export function CornerRadiusOptions() {
  const {
    config: {
      ui: { borderRadius },
    },
    setConfig,
  } = useConfig();

  const onChange = (borderRadius: "none" | "sm" | "md" | "lg") => {
    setConfig((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        borderRadius,
      },
    }));
  };

  return (
    <div className="flex self-stretch gap-3">
      {RADIUS_OPTIONS.map((option) => (
        <button
          className={`h-9 flex items-center justify-center flex-1 basis-0 bg-[#EFF4F9] text-[#363FF9] hover:opacity-80 ${
            option.id === borderRadius
              ? "border-2 border-[rgba(0, 0, 0, 0.01)]"
              : "border-2 border-white"
          }`}
          style={{
            borderRadius: getBorderRadiusValue(option.id),
            boxShadow:
              option.id === borderRadius
                ? "0px 0px 6px 0px rgba(36, 0, 255, 0.7)"
                : undefined,
          }}
          key={option.id}
          onClick={() => onChange(option.id)}
        >
          <span className="text-sm font-semibold">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

const options = ["outline", "linear", "filled", "flat"] as const;

function IllustrationStyleOptions() {
  const {
    config: {
      ui: { illustrationStyle },
    },
    setConfig,
  } = useConfig();

  const onChange = (style: "outline" | "linear" | "filled" | "flat") => {
    setConfig((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        illustrationStyle: style,
      },
    }));
  };

  return (
    <div className="flex self-stretch gap-3">
      {options.map((value) => (
        <button
          key={value}
          className={cn(
            "py-2 flex-1 basis-0 rounded-lg border border-[#CBD5E1]",
            "text-fg-accent-brand hover:opacity-80",
            "flex items-center justify-center"
          )}
          style={{
            boxShadow:
              illustrationStyle === value
                ? "0px 0px 6px 0px rgba(36, 0, 255, 0.7)"
                : undefined,
          }}
          onClick={() => onChange(value)}
        >
          <IllustrationStyle className="text-fg-accent-brand" variant={value} />
        </button>
      ))}
    </div>
  );
}

function LearnMore() {
  return (
    <div className="flex items-center gap-1 text-xs text-center self-center mt-8">
      <FileCode className="stroke-secondary stroke-1" size={18} />
      <div className="text-secondary">Want to fully configure the CSS?</div>
      <ExternalLink className="font-semibold text-blue-600" href="https://github.com/alchemyplatform/aa-sdk/blob/v4.x.x/account-kit/react/src/tailwind/types.ts#L6">
        Click to learn how
      </ExternalLink>
    </div>
  );
}
