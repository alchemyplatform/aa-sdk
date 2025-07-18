"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useAuthContext } from "../context.js";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

export const useConnectSolanaEOA = () => {
  const { setAuthStep } = useAuthContext();

  const {
    select,
    connect: connectInternal,
    connected,
    connecting,
    wallet,
  } = useWallet();

  const { mutate: connect } = useMutation({
    mutationFn: (...args: Parameters<typeof select>): Promise<void> => {
      console.log("selecting", args);
      select(...args);
      console.log("connecting");
      console.log(connectInternal);
      return connectInternal();
    },
    onMutate: () => {
      setAuthStep({ type: "eoa_connect" });
    },
    onError: (error) => {
      setAuthStep({ type: "eoa_connect", error });
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  useEffect(() => {
    console.log(connected, connecting, wallet, "status");
  }, [connected, connecting, wallet]);

  return {
    connect,
  };
};
