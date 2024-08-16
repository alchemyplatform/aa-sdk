import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { getBorderRadiusValue } from "@account-kit/react/tailwind";
import { IllustrationStyle } from "../icons/illustration-style";
import { PaintIcon } from "../icons/paint";
import { SparkleIcon } from "../icons/sparkle";
import ExternalLink from "../shared/ExternalLink";
import { HelpTooltip } from "../shared/HelpTooltip";
import { ThemeSwitch } from "../shared/ThemeSwitch";
import { ColorPicker } from "./ColorPicker";
import { PhotoUploads } from "./PhotoUpload";

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
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-2">
          <PaintIcon />
          <span className="font-semibold">Branding</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full border-b border-border pb-5">
        <div className="flex flex-row justify-between grow items-center">
          <p className="font-medium text-sm">Theme</p>
          <ThemeSwitch
            checked={config.ui.theme === "dark"}
            onCheckedChange={onSwitchTheme}
          />
        </div>
        <div className="flex flex-row justify-between grow items-center">
          <p className="font-medium text-sm">Brand color</p>
          <ColorPicker theme={config.ui.theme} />
        </div>
        <div className="flex flex-row justify-between grow items-center">
          <div>
            <p className="font-medium text-sm">
              Logo <span className="text-gray-400 font-normal">(optional)</span>
            </p>
            <p className="text-gray-400 font-normal text-xs">
              PNG, JPG, GIF files accepted
            </p>
          </div>
          <PhotoUploads mode={config.ui.theme} />
        </div>
      </div>

      <div className="flex flex-col gap-4 items-start">
        <p className="font-semibold text-secondary-foreground text-sm">
          Corner radius
        </p>

        <CornerRadiusOptions />
      </div>
      <div className="flex flex-col gap-4 items-start">
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
          className={`h-9 flex items-center justify-center flex-1 basis-0 hover:opacity-80 border border-gray-300 ${
            option.id === borderRadius
              ? "border-[#363FF9] border-[1.5px] bg-[#EFF4F9] font-semibold"
              : ""
          }`}
          style={{
            borderRadius: getBorderRadiusValue(option.id),
          }}
          key={option.id}
          onClick={() => onChange(option.id)}
        >
          <span className="text-sm font-normal">{option.label}</span>
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
            "py-2 flex-1 basis-0 rounded-lg border border-gray-300",
            "text-fg-accent-brand hover:opacity-80",
            "flex items-center justify-center",
            illustrationStyle === value
              ? "border-[#363FF9] border-[1.5px] bg-[#EFF4F9] font-semibold"
              : ""
          )}
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
    <div className="flex items-center gap-1 text-xs flex-1 w-full justify-center">
      <SparkleIcon />
      <div className="text-secondary">
        Customize every pixel with{" "}
        <ExternalLink
          className="font-semibold text-blue-600"
          href="https://github.com/alchemyplatform/aa-sdk/blob/v4.x.x/account-kit/react/src/tailwind/types.ts#L6"
        >
          CSS
        </ExternalLink>{" "}
        overrides
      </div>
    </div>
  );
}
