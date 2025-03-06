import { ChevronDown } from "@/components/icons/chevron-down";
import {
  SelectMenu,
  SelectMenuContent,
  SelectMenuItem,
  SelectMenuTrigger,
  SelectMenuViewport,
} from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import { Metrics } from "@/metrics";
import { useConfigStore } from "@/state";
import { getBorderRadiusValue } from "@account-kit/react/tailwind";
import { useState } from "react";

const RADIUS_OPTIONS = [
  { label: "None", id: "none" as const },
  { label: "Small", id: "sm" as const },
  { label: "Medium", id: "md" as const },
  { label: "Large", id: "lg" as const },
];

function useBorderRadius() {
  return useConfigStore(
    ({ ui: { borderRadius, primaryColor, theme }, setBorderRadius }) => ({
      setBorderRadius,
      theme,
      primaryColor,
      borderRadius,
    })
  );
}

export function CornerRadiusOptions() {
  const { borderRadius, setBorderRadius } = useBorderRadius();

  return (
    <>
      <div className="hidden lg:flex self-stretch gap-3">
        {RADIUS_OPTIONS.map((option) => (
          <button
            className={`h-9 flex items-center justify-center flex-1 basis-0 hover:opacity-80 border border-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              option.id === borderRadius
                ? " bg-demo-surface-secondary font-semibold"
                : "border-gray-300"
            }`}
            style={{
              borderRadius: getBorderRadiusValue(option.id),
            }}
            key={option.id}
            onClick={() => {
              setBorderRadius(option.id);
              Metrics.trackEvent({
                name: "branding_corner_radius_changed",
                data: { corner_radius: option.id },
              });
            }}
          >
            <span className="text-sm font-normal">{option.label}</span>
          </button>
        ))}
      </div>
      <div className="flex lg:hidden w-full">
        <CornerRadiusSelectMenu />
      </div>
    </>
  );
}

function CornerRadiusSelectMenu() {
  const { borderRadius, primaryColor, theme, setBorderRadius } =
    useBorderRadius();

  type BorderRadius = typeof borderRadius;
  const [selected, setSelected] = useState<BorderRadius>(borderRadius);
  const [menuOpen, setMenuOpen] = useState(false);

  const onChange = (borderRadius: BorderRadius) => {
    setSelected(borderRadius);

    setBorderRadius(borderRadius);
  };

  const getRadiusLabel = (borderRadius: BorderRadius) => {
    return (
      RADIUS_OPTIONS.find((option) => option.id === borderRadius)?.label ||
      "None"
    );
  };

  return (
    <SelectMenu
      open={menuOpen}
      onOpenChange={setMenuOpen}
      value={selected}
      onValueChange={onChange}
    >
      <SelectMenuTrigger
        isOpen={menuOpen}
        className={cn(
          "w-full radius py-3 px-4 bg-white border border-border flex items-center justify-between transition-colors ease-out",
          menuOpen && `border-[${primaryColor[theme]}]`
        )}
      >
        <span className="text-sm font-normal block text-left text-secondary-foreground">
          {getRadiusLabel(selected)}
        </span>
        <div className="ml-1 w-[20px] h-[20px] flex items-center justify-center">
          <ChevronDown
            className={cn(
              "transition-transform stroke-demo-fg-primary",
              menuOpen && "rotate-180"
            )}
          />
        </div>
      </SelectMenuTrigger>
      <SelectMenuContent position="popper" className="p-0 my-2">
        <SelectMenuViewport>
          {RADIUS_OPTIONS.map((option) => (
            <SelectMenuItem
              key={option.id}
              value={option.id}
              className={cn(
                "px-4 py-3 hover:bg-[rgba(239,244,249,0.4)] transition-colors ease-out outline-none text-sm",
                selected === option.id
                  ? "font-medium bg-demo-surface-secondary"
                  : "font-normal"
              )}
            >
              {option.label}
            </SelectMenuItem>
          ))}
        </SelectMenuViewport>
      </SelectMenuContent>
    </SelectMenu>
  );
}
