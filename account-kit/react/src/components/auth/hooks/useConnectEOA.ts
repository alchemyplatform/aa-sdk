"use client";

import { useConnect } from "../../../hooks/useConnect.js";
import { AuthStepType, useAuthContext } from "../context.js";

export const useConnectEOA = () => {
  const { setAuthStep } = useAuthContext();
  const { connectors, connect } = useConnect({
    onMutate: ({ connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: AuthStepType.wallet_connect });
      } else {
        setAuthStep({ type: AuthStepType.eoa_connect, connector });
      }
    },
    onError: (error, { connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: AuthStepType.wallet_connect, error });
      } else {
        setAuthStep({ type: AuthStepType.eoa_connect, connector, error });
      }
    },
    onSuccess: () => {
      setAuthStep({ type: AuthStepType.complete });
    },
  });

  return {
    connect,
    connectors,
  };
};
