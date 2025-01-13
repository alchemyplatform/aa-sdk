"use client";

import { useConnect } from "../../../hooks/useConnect.js";
import { AuthStepType, useAuthContext } from "../context.js";

export const useConnectEOA = () => {
  const { setAuthStep } = useAuthContext();
  const { connectors, connect } = useConnect({
    onMutate: ({ connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: AuthStepType.WalletConnect });
      } else {
        setAuthStep({ type: AuthStepType.EoaConnect, connector });
      }
    },
    onError: (error, { connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: AuthStepType.WalletConnect, error });
      } else {
        setAuthStep({ type: AuthStepType.EoaConnect, connector, error });
      }
    },
    onSuccess: () => {
      setAuthStep({ type: AuthStepType.Complete });
    },
  });

  return {
    connect,
    connectors,
  };
};
