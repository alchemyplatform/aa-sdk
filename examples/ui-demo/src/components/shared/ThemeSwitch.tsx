"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"

const ThemeSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "relative peer inline-flex h-8 w-48 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-7 w-24 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[92px] data-[state=unchecked]:translate-x-0"
      )}
    ></SwitchPrimitives.Thumb>
    <div className="absolute flex text-sm items-center inset-1 z-10 justify-between bg-transparent">
      <div className="flex items-center data-[state=unchecked]:font-medium justify-center gap-1 flex-1 basis-0">
        <Sun size={18} /><div className={cn(!props.checked && "font-medium")}>Light</div>
      </div>
      <div className="flex items-center justify-center gap-1 flex-1 basis-0">
        <Moon size={18} /><div className={cn(props.checked && "font-medium")}>Dark</div>
      </div>
    </div>
  </SwitchPrimitives.Root>
))
ThemeSwitch.displayName = SwitchPrimitives.Root.displayName

export { ThemeSwitch }
