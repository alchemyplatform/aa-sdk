import { ChevronDown } from "@/components/icons/chevron-down";
import { IllustrationStyle } from "@/components/icons/illustration-style";
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
import { useState } from "react";

const ILLUSTRATION_STYLE_OPTIONS = [
  { label: "Outline", id: "outline" as const },
  { label: "Linear", id: "linear" as const },
  { label: "Filled", id: "filled" as const },
  { label: "Flat", id: "flat" as const },
];

const options = ["outline", "linear", "filled", "flat"] as const;

export function IllustrationStyleOptions() {
  const { illustrationStyle, setIllustrationStyle } = useConfigStore(
    ({ ui: { illustrationStyle }, setIllustrationStyle }) => ({
      illustrationStyle,
      setIllustrationStyle,
    }),
  );

  return (
    <>
      <div className="hidden lg:flex self-stretch gap-3">
        {options.map((value) => (
          <button
            key={value}
            className={cn(
              "py-2 flex-1 basis-0 rounded-lg border border-[#64748B]",
              "text-fg-accent-brand hover:opacity-80",
              "flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              illustrationStyle === value
                ? "bg-demo-surface-secondary font-semibold"
                : "border-gray-300",
            )}
            onClick={() => {
              setIllustrationStyle(value);
              Metrics.trackEvent({
                name: "branding_illustration_style_changed",
                data: { variant: value },
              });
            }}
          >
            <IllustrationStyle
              className="text-fg-accent-brand"
              variant={value}
            />
          </button>
        ))}
      </div>
      <div className="flex lg:hidden w-full">
        <IllustrationStyleSelectMenu />
      </div>
    </>
  );
}

const IllustrationStyleSelectMenu = () => {
  const { illustrationStyle, setIllustrationStyle } = useConfigStore(
    ({ ui: { illustrationStyle, primaryColor }, setIllustrationStyle }) => ({
      illustrationStyle,
      setIllustrationStyle,
      primaryColor,
    }),
  );

  type IllustrationStyle = typeof illustrationStyle;
  const [selected, setSelected] =
    useState<IllustrationStyle>(illustrationStyle);
  const [menuOpen, setMenuOpen] = useState(false);

  const onChange = (style: IllustrationStyle) => {
    setSelected(style);

    setIllustrationStyle(style);
  };

  const getIllustrationStyleValue = (style: IllustrationStyle) => {
    return (
      ILLUSTRATION_STYLE_OPTIONS.find((option) => option.id === style)?.label ||
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
      <SelectMenuTrigger isOpen={menuOpen}>
        <span className="text-sm font-normal block text-left text-secondary-foreground">
          {getIllustrationStyleValue(selected)}
        </span>
        <div className="ml-1 w-[20px] h-[20px] flex items-center justify-center">
          <ChevronDown
            className={cn(
              "stroke-demo-fg-primary transition",
              menuOpen && "rotate-180",
            )}
          />
        </div>
      </SelectMenuTrigger>
      <SelectMenuContent position="popper" className="p-0 my-2">
        <SelectMenuViewport>
          {options.map((option) => (
            <SelectMenuItem
              key={option}
              value={option}
              className={cn(
                "px-4 py-3 hover:bg-[rgba(239,244,249,0.4)] transition-colors ease-out outline-none text-sm",
                selected === option
                  ? "font-medium bg-demo-surface-secondary"
                  : "font-normal",
              )}
            >
              {getIllustrationStyleValue(option)}
            </SelectMenuItem>
          ))}
        </SelectMenuViewport>
      </SelectMenuContent>
    </SelectMenu>
  );
};
