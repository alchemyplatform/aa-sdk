"use client";

import * as SelectPrimitives from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import React from "react";

const SelectMenu = SelectPrimitives.Root;

const SelectMenuTrigger = SelectPrimitives.Trigger;

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
      "z-50 w-72 rounded-md border p-4 text-popover-foreground bg-bg-surface-default shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));

SelectMenuContent.displayName = SelectPrimitives.Content.displayName;
export {
  SelectMenu,
  SelectMenuTrigger,
  SelectMenuContent,
  SelectMenuLabel,
  SelectMenuItem,
  SelectMenuSeparator,
  SelectMenuGroup,
  SelectMenuViewport,
};
