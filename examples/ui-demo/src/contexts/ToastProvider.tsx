"use client";

import { Toast } from "@/components/shared/Toast";
import { Provider } from "@radix-ui/react-toast";
import { createContext, PropsWithChildren, ReactNode, useState } from "react";

export type ToastType = {
  text: ReactNode | string;
  type: "success" | "error";
  open: boolean;
};
export const ToastContext = createContext<{
  toast: ToastType;
  setToast: (toast: ToastType) => void;
  closeToast: () => void;
}>({
  toast: {
    text: "",
    type: "success",
    open: false,
  },
  setToast: (toast: ToastType) => {},
  closeToast: () => {},
});
export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toast, setToast] = useState<ToastType>({
    text: "",
    type: "success",
    open: false,
  });
  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));
  return (
    <ToastContext.Provider value={{ toast, setToast, closeToast }}>
      <Provider duration={3000}>
        <>
          {children}
          <Toast />
        </>
      </Provider>
    </ToastContext.Provider>
  );
};
