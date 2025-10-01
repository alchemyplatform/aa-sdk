"use client";

import { useConnect } from "../../../hooks/useConnect.js";
import { useAuthContext } from "../context.js";

export const useConnectEOA = () => {
  const { setAuthStep } = useAuthContext();
  const { connectors, connect } = useConnect({
    onMutate: ({ connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: "wallet_connect" });
      } else {
        setAuthStep({ type: "eoa_connect", connector });
      }
    },
    onError: (error, { connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: "wallet_connect", error });
      } else {
        setAuthStep({ type: "eoa_connect", connector, error });
      }
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  return {
    connect,
    connectors,
  };
};
