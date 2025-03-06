"use client";

import { ToastContext } from "@/contexts/ToastProvider";
import { useContext } from "react";

export const useToast = () => {
  if (!ToastContext) {
    throw Error(
      "useToast can only be used by components that are descendants of the ToastProvider`"
    );
  }
  const toastContext = useContext(ToastContext);
  return toastContext;
};
