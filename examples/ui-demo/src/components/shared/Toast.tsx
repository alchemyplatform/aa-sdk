"use client";
import React from "react";

import { Root, Viewport, Close } from "@radix-ui/react-toast";
import { XIcon } from "../icons/x";
import { useToast } from "@/hooks/useToast";

// Toast is not themed due to its positioning over the perma-white nav bar

export const Toast = () => {
  const { closeToast, toast } = useToast();
  const { type, text, open } = toast;
  const getBGColor = () => {
    switch (toast?.type) {
      case "error":
        // "bg-bg-surface-critical"
        return "bg-[#FEF2F2]";
      case "success":
        // bg-bg-surface-success-subtle
        return "bg-[#F0FdF4]";
    }
  };

  const getTextColor = () => {
    switch (toast?.type) {
      case "error":
        //  "text-fg-critical";
        return "text-[#B91C1C]";
      case "success":
        //  "text-bg-surface-success";
        return "text-[#15803D]";
    }
  };

  const getButtonColor = () => {
    switch (toast?.type) {
      case "error":
        // "bg-surface-error";
        return "#DC2626";
      case "success":
        // "bg-surface-success";
        return "#16A34A";
    }
  };

  return (
    <>
      <Root
        id="toast"
        open={open}
        onOpenChange={closeToast}
        className={`${getBGColor()} align-middle rounded-lg shadow-lg px-3 py-2 flex justify-center items-center`}
      >
        <p
          className={`${getTextColor()} text-center pr-2 align-middle whitespace-nowrap`}
        >
          <span
            className={`${
              type === "success"
                ? "bg-demo-surface-success"
                : "bg-demo-surface-critical"
            } align-middle px-2 py-1 text-[#FFFFFF] text-xs font-semibold rounded mr-2 hidden md:inline`}
          >
            {type === "success" ? "Success" : "Error"}
          </span>
          {text}
        </p>
        <Close>
          <XIcon stroke={getButtonColor()} />
        </Close>
      </Root>
      <Viewport className="fixed top-2 right-1/2 translate-x-1/2 z-50 outline-none" />
    </>
  );
};
