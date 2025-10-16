"use client";

import { useState, type PropsWithChildren } from "react";
import { Dialog } from "../dialog/dialog.js";
import { AuthModalContext, type AuthStep } from "./context.js";

type AuthModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
}>;

export const AuthModal = ({ isOpen, onClose, children }: AuthModalProps) => {
  const [authStep, setAuthStepInternal] = useState<AuthStep>({
    type: "initial",
  });

  const setAuthStep = (step: AuthStep) => {
    setAuthStepInternal(step);
    if (step.type === "complete") {
      onClose();
    }
  };

  const resetAuthStep = () => {
    setAuthStepInternal({ type: "initial" });
  };

  return (
    <AuthModalContext.Provider value={{ authStep, setAuthStep, resetAuthStep }}>
      <Dialog isOpen={isOpen} onClose={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {children}
        </div>
      </Dialog>
    </AuthModalContext.Provider>
  );
};
