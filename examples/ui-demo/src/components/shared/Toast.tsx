"use client";
import React from "react";

import { Root, Viewport, Close } from "@radix-ui/react-toast";
import { XIcon } from "../icons/x";

type ToastProps = {
  text: string;
  type: "success" | "error";
  open: boolean;
  setOpen: (open: boolean) => void;
};

// TODO: Success dark mode looks bad, consider hard coding.

export const Toast = ({ text, open, setOpen, type }: ToastProps) => {
  const getBGColor = () => {
    switch (type) {
      case "error":
        return "bg-bg-surface-critical";
      case "success":
        return "bg-bg-surface-success-subtle";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "error":
        return "text-fg-critical";
      case "success":
        return "text-bg-surface-success";
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "error":
        return "bg-surface-error";
      case "success":
        return "bg-surface-success";
    }
  };

  return (
    <>
      <Root
        open={open}
        onOpenChange={setOpen}
        className={`${getBGColor()} rounded-lg shadow-lg px-3 py-2 flex justify-center items-center`}
      >
        <p className={`${getTextColor()} text-center pr-2`}>
          <span
            className={`bg-${getButtonColor()} px-2 py-1 text-fg-invert text-xs font-semibold rounded mr-2`}
          >
            {type === "success" ? "Success" : "Error"}
          </span>
          {text}
        </p>
        <Close>
          <XIcon className={`text-${getButtonColor()}`} />
        </Close>
      </Root>
      <Viewport className="fixed top-2 right-1/2 translate-x-1/2 z-50 outline-none" />
    </>
  );
};
