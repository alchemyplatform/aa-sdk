import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/state";
import { useDebounceEffect } from "@/utils/hooks/useDebounceEffect";
import { Sketch } from "@uiw/react-color";
import { useLayoutEffect, useState } from "react";

export function ColorPicker({ theme }: { theme: "dark" | "light" }) {
  const { primaryColor, setPrimaryColor } = useConfigStore(
    ({ ui: { primaryColor }, setPrimaryColor }) => ({
      primaryColor,
      setPrimaryColor,
    })
  );

  const [innerColor, setInnerColor] = useState(primaryColor[theme]);

  const onSetThemeColor = (color: string) => {
    setPrimaryColor(theme, color);
  };

  useLayoutEffect(() => {
    setInnerColor(primaryColor[theme]);
  }, [primaryColor, theme]);

  useDebounceEffect(
    () => {
      onSetThemeColor(innerColor);
    },
    [innerColor],
    250
  );

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "self-start border rounded-lg py-2 px-[10px] gap-2 flex items-center justify-between hover:opacity-80 w-28 h-10 border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
        id="color-picker"
      >
        <div
          className="h-6 w-6 rounded shrink-0"
          style={{ backgroundColor: innerColor }}
        />
        <div className="text-sm">{innerColor}</div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={8}
        className="p-0 w-fit border-0"
      >
        <Sketch
          color={innerColor}
          onChange={(color) => {
            setInnerColor(color.hex);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
