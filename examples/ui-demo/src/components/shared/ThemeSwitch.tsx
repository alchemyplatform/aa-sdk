"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

const ThemeSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, checked, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "relative peer inline-flex w-28 h-10 shrink-0 cursor-pointer items-center rounded-[8px] border border-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-input data-[state=unchecked]:bg-[#94A3B8]",
      className,
    )}
    checked={checked}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-9 w-14 rounded-[7px] bg-background ring-0 transition-transform data-[state=checked]:translate-x-[53px] data-[state=unchecked]:translate-x-[1px]",
      )}
    ></SwitchPrimitives.Thumb>
    <div className="absolute flex text-sm items-center inset-1 z-10 justify-between bg-transparent">
      <div className="flex items-center data-[state=unchecked]:font-medium justify-center gap-1 flex-1 basis-0">
        <Sun
          className={cn(checked && "stroke-demo-fg-toggle-icon")}
          size={18}
        />
      </div>
      <div className="flex items-center justify-center gap-1 flex-1 basis-0">
        <Moon
          className={cn(!checked && "stroke-demo-fg-secondary")}
          size={18}
        />
      </div>
    </div>
  </SwitchPrimitives.Root>
));
ThemeSwitch.displayName = SwitchPrimitives.Root.displayName;

export { ThemeSwitch };
