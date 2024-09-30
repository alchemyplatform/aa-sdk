"use client";

import { ToastContext } from "@/contexts/ToastProvider";
import { useContext } from "react";

export const useToast = () => {
  const { toast, setToast, closeToast } = useContext(ToastContext);
  return { toast, setToast, closeToast };
};
