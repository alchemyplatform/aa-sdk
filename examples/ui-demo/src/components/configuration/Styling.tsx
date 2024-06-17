import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";
import { useConfig } from "@/src/app/state";
import { PhotoIcon } from "../icons/photo";
import { PhotoUploads } from "./PhotoUpload";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitch } from "../shared/ThemeSwitch";
import { useState } from "react";

export function Styling({ className }: { className?: string }) {
  const { config, setConfig } = useConfig();

  const onSwitchTheme = (isDarkMode: boolean) => {
    setConfig(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        theme: isDarkMode ? "dark" : "light"
      }
    }))
  }
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-col gap-4 border-b border-static py-6">
        <p className="font-semibold text-secondary-foreground text-sm">Theme</p>
        <ThemeSwitch checked={config.ui.theme === 'dark'} onCheckedChange={onSwitchTheme} />
      </div>

      <div className="flex flex-col gap-4 border-b border-static py-6 items-start">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-secondary-foreground text-sm">
            Color
          </p>
          <p className="text-gray-500 text-sm">
            Applied to links and buttons and illustrations
          </p>
        </div>
        <ColorPicker />
      </div>

      <div className="flex flex-col gap-4 border-b border-static py-6 items-start">
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

      <div className="flex flex-col gap-4 border-b border-static py-6 items-start">
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
        </div>
      </div>
    </div>
  );
}

const RADIUS_OPTIONS = [
  { className: "rounded-none", label: "None", id: "none" as const },
  { className: "rounded", label: "Small", id: "sm" as const },
  { className: "rounded-md", label: "Medium", id: "md" as const },
  { className: "rounded-lg", label: "Large", id: "lg" as const },
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
          className={`${
            option.className
          } py-2 flex-1 basis-0 bg-[#EFF4F9] text-fg-accent-brand hover:opacity-80 ${
            option.id === borderRadius
              ? "border-2 border-[rgba(0, 0, 0, 0.01)]"
              : "border-2 border-white"
          }`}
          style={{
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
