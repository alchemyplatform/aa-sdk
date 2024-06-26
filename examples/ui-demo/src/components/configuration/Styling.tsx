import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";
import { useConfig } from "@/src/app/state";
import { PhotoUploads } from "./PhotoUpload";
import { ThemeSwitch } from "../shared/ThemeSwitch";
import { FileCode } from "lucide-react";
import ExternalLink from "../shared/ExternalLink";
import { IllustrationStyle } from "../icons/illustration-style";
import { getBorderRadiusValue } from "@/src/utils/radius";

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
      <div className="flex flex-col gap-4 border-b border-border py-6">
        <p className="font-semibold text-secondary-foreground text-sm">Theme</p>
        <ThemeSwitch
          checked={config.ui.theme === "dark"}
          onCheckedChange={onSwitchTheme}
        />
      </div>

      <div className="flex flex-col gap-4 border-b border-border py-6 items-start">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-secondary-foreground text-sm">
            Color
          </p>
          <p className="text-gray-500 text-sm">
            Applied to links and buttons and illustrations
          </p>
        </div>
        <div className="flex gap-2 self-stretch">
          <div className="flex flex-col gap-2 flex-1 basis-0">
            <div className="text-gray-600 text-xs font-semibold">
              Light mode
            </div>
            <ColorPicker theme="light" />
          </div>
          <div className="flex flex-col gap-2 flex-1 basis-0">
            <div className="text-gray-600 text-xs font-semibold">
              Dark mode
            </div>
            <ColorPicker theme="dark" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-border py-6 items-start">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-secondary-foreground text-sm">
            Logo
          </p>
          <p className="text-gray-500 text-sm">PNG, JPG, GIF</p>
        </div>
        <div className="flex self-stretch gap-8">
          <PhotoUploads mode="light" />
          <PhotoUploads mode="dark" />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-border py-6 items-start">
        <div className="flex flex-col gap-2 self-stretch">
          <p className="font-semibold text-secondary-foreground text-sm">
            Corner radius
          </p>
          <CornerRadiusOptions />
        </div>
      </div>

      <div className="flex flex-col gap-4 py-6 items-start">
        <div className="flex flex-col gap-2 self-stretch">
          <p className="font-semibold text-secondary-foreground text-sm">
            Illustration style
          </p>
          <IllustrationStyleOptions />
        </div>
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
          className={`py-2 flex-1 basis-0 bg-[#EFF4F9] text-[#363FF9] hover:opacity-80 ${
            option.id === borderRadius
              ? "border-2 border-[rgba(0, 0, 0, 0.01)]"
              : "border-2 border-white"
          }`}
          style={{
            borderRadius: getBorderRadiusValue(option.id),
            boxShadow:
              option.id === borderRadius
                ? "0px 0px 4px 0px rgba(36, 0, 255, 0.7)"
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
                ? "0px 0px 4px 0px rgba(36, 0, 255, 0.7)"
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
      <ExternalLink className="font-semibold text-blue-600" href="#">
        Click to learn how
      </ExternalLink>
    </div>
  );
}
