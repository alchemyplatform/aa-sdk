"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import { Code } from "../icons/code";

const CodePreviewSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <div className="flex gap-2 items-center">
    <label
      htmlFor="code-preview-switch"
      className={cn(
        "px-2 py-1 h-5 rounded text-xs font-semibold hidden lg:block lg:leading-none",
        props.checked
          ? "bg-[#F3F3FF] text-[#8B5CF6]"
          : "bg-demo-surface-secondary text-[#374151]"
      )}
    >
      Code preview
    </label>
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-demo-bg-toggle-active data-[state=unchecked]:bg-demo-bg-toggle-inactive",
        className
      )}
      {...props}
      ref={ref}
      id="code-preview-switch"
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "flex items-center justify-center pointer-events-none h-[24px] w-[24px] rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0"
        )}
      >
        <Code />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  </div>
));
CodePreviewSwitch.displayName = SwitchPrimitives.Root.displayName;

export { CodePreviewSwitch };
