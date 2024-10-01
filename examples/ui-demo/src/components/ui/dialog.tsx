"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogOverlay = DialogPrimitive.Overlay;

const DialogPortal = DialogPrimitive.Portal;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Content
    asChild
    className={cn(
      "animate-slide-up absolute bottom-0 left-0 flex flex-col w-full h-auto z-20 bg-bg-surface-default pb-10 pt-5 rounded-t-2xl px-6",
      className
    )}
    ref={ref}
    {...props}
  >
    {props.children}
  </DialogPrimitive.Content>
));

DialogContent.displayName = DialogPrimitive.Content.displayName;

export { Dialog, DialogTrigger, DialogContent, DialogOverlay, DialogPortal };
