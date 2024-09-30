"use client";

import { Toast } from "@/components/shared/Toast";
import { Provider } from "@radix-ui/react-toast";
import { createContext, PropsWithChildren, useState } from "react";

export type ToastType = { text: string; type: "success" | "error" };
export const ToastContext = createContext<{
  toast: ToastType | null;
  setToast: (toast: ToastType | null) => void;
  closeToast: () => void;
}>({
  toast: null,
  setToast: (toast: ToastType | null) => {},
  closeToast: () => {},
});
export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toast, setToast] = useState<ToastType | null>(null);
  const closeToast = () => setToast(null);
  return (
    <ToastContext.Provider value={{ toast, setToast, closeToast }}>
      <Provider>
        <>
          {children}
          <Toast />
        </>
      </Provider>
    </ToastContext.Provider>
  );
};
