"use client";

import { Root, Thumb } from "@radix-ui/react-switch";
import { forwardRef, ElementRef, ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const selectedStyles = "text-[#475569]";
const unselectedStyles = "text-[#020617]";

const WalletTypeSwitch = forwardRef<
  ElementRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(({ className, checked, ...props }, ref) => (
  <Root
    className={cn(
      "relative peer inline-flex w-full h-9 shrink-0 cursor-pointer items-center rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-active border border-[#94A3B8]",
      className
    )}
    checked={checked}
    {...props}
    ref={ref}
  >
    <Thumb
      className={cn(
        "pointer-events-none block h-full w-2/4 rounded-[7px] bg-background ring-0 transition-transform data-[state=checked]:translate-x-[100%] data-[state=unchecked]:translate-x-[0%] border border-active"
      )}
    ></Thumb>
    <div className="absolute flex text-sm items-center z-10 justify-between bg-transparent w-full">
      <div className="flex items-center justify-center flex-1 basis-0">
        <p
          className={`${
            checked ? selectedStyles : unselectedStyles
          } font-normal`}
        >
          Smart Account
        </p>
      </div>
      <div className="flex items-center justify-center flex-1 basis-0">
        <p
          className={`${
            checked ? unselectedStyles : selectedStyles
          } font-normal`}
        >
          Smart EOA (EIP-7702)
        </p>
      </div>
    </div>
  </Root>
));
WalletTypeSwitch.displayName = Root.displayName;

export { WalletTypeSwitch };
