"use client";
import React from "react";

import { Root, Close } from "@radix-ui/react-toast";
import { XIcon } from "../icons/x";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

// Toast is not themed due to its positioning over the perma-white nav bar

export const Toast = () => {
  const { closeToast, toast } = useToast();
  const { type, text, open } = toast;

  return (
    <>
      <Root
        id="toast"
        open={open}
        onOpenChange={closeToast}
        className={cn(
          type === "success"
            ? "bg-demo-surface-success-subtle"
            : "bg-demo-surface-critical-subtle",
          "align-middle rounded-lg shadow-lg px-3 py-2 flex justify-center items-center"
        )}
      >
        <p
          className={cn(
            type === "success"
              ? "text-demo-text-success"
              : "text-demo-text-critical",
            "text-center pr-2 align-middle whitespace-nowrap"
          )}
        >
          <span
            className={cn(
              type === "success"
                ? "bg-demo-surface-success"
                : "bg-demo-surface-critical",
              "align-middle px-2 py-1 text-demo-text-invert text-xs font-semibold rounded mr-2 hidden md:inline"
            )}
          >
            {type === "success" ? "Success" : "Error"}
          </span>
          {text}
        </p>
        <Close>
          <XIcon
            className={cn(
              type === "success"
                ? "stroke-demo-surface-success"
                : "stroke-demo-surface-critical"
            )}
          />
        </Close>
      </Root>
    </>
  );
};
