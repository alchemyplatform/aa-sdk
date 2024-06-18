import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useConfig } from "@/src/app/state";
import { Chrome, Sketch } from "@uiw/react-color";

export function ColorPicker() {
  const { config, setConfig } = useConfig();

  const onSetThemeColor = (color: string) => {
    setConfig(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        primaryColor: color
      }
    }))
  }

  return (
    <Popover>
      <PopoverTrigger className="rounded-lg py-2 px-[10px] min-w-[120px] gap-2 flex items-center justify-center border border-gray-300 hover:opacity-80">
        <div className="h-6 w-6 rounded" style={{ backgroundColor: config.ui.primaryColor }} />
        <div className="text-sm">{config.ui.primaryColor}</div>
      </PopoverTrigger>
      <PopoverContent side="right" sideOffset={8} className="p-0 w-fit border-0">
        <Sketch
          color={config.ui.primaryColor}
          onChange={(color) => {
            onSetThemeColor(color.hex);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
