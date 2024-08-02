import { useConfig } from "@/app/state";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Sketch } from "@uiw/react-color";

export function ColorPicker({ theme }: { theme: "dark" | "light" }) {
  const { config, setConfig } = useConfig();

  const onSetThemeColor = (color: string) => {
    setConfig((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        primaryColor: {
          ...prev.ui.primaryColor,
          [theme]: color,
        },
      },
    }));
  };

  const color = config.ui.primaryColor[theme];

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "self-start border rounded-lg py-2 px-[10px] gap-2 flex items-center justify-between hover:opacity-80 w-28 h-10 border-gray-300"
        )}
      >
        <div
          className="h-6 w-6 rounded shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="text-sm">{color}</div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={8}
        className="p-0 w-fit border-0"
      >
        <Sketch
          color={color}
          onChange={(color) => {
            onSetThemeColor(color.hex);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
