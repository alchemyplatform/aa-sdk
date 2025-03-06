"use client";

import { cn } from "@/lib/utils";
import { useConfigStore } from "@/state";
import { hexToRgba } from "@/utils/hex-to-rgba";
import * as SelectPrimitives from "@radix-ui/react-select";
import React from "react";

const SelectMenu = SelectPrimitives.Root;

type SelectMenuTriggerProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitives.Trigger
> & {
  isOpen?: boolean;
};
const SelectMenuTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Trigger>,
  SelectMenuTriggerProps
>(({ className, isOpen, ...props }, ref) => {
  const { primaryColor, theme } = useConfigStore(
    ({ ui: { primaryColor, theme } }) => ({ theme, primaryColor })
  );

  return (
    <SelectPrimitives.Trigger
      ref={ref}
      className={cn(
        "w-full radius py-3 px-4 bg-white border border-border flex items-center justify-between transition-colors ease-out active:outline-none",
        isOpen && `border-[${primaryColor[theme]}]`,
        className
      )}
      style={{
        backgroundColor: isOpen
          ? hexToRgba(primaryColor[theme], 0.035)
          : "white",
        border: `1px solid ${isOpen ? primaryColor[theme] : "#E5E7EB"}`,
      }}
      {...props}
    />
  );
});

const SelectMenuLabel = SelectPrimitives.Label;

const SelectMenuItem = SelectPrimitives.Item;

const SelectMenuSeparator = SelectPrimitives.Separator;

const SelectMenuGroup = SelectPrimitives.Group;

const SelectMenuViewport = SelectPrimitives.Viewport;

const SelectMenuContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitives.Content
    ref={ref}
    className={cn(
      "z-50 w-72 rounded-md border p-4 text-popover-foreground bg-[white] shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));

// Display names
SelectMenuTrigger.displayName = SelectPrimitives.Trigger.displayName;
SelectMenuContent.displayName = SelectPrimitives.Content.displayName;
export {
  SelectMenu,
  SelectMenuContent,
  SelectMenuGroup,
  SelectMenuItem,
  SelectMenuLabel,
  SelectMenuSeparator,
  SelectMenuTrigger,
  SelectMenuViewport,
};
