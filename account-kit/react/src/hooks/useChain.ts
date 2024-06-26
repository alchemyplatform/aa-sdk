"use client";

import {
  getChain,
  setChain as setChainInternal,
  watchChain,
} from "@account-kit/core";
import { useMutation } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import type { Chain } from "viem";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";

export type UseChainParams = BaseHookMutationArgs<void, { chain: Chain }>;

export interface UseChainResult {
  chain: Chain;
  setChain: (chain: Chain) => void;
  isSettingChain: boolean;
}

/**
 * A hook that returns the current chain as well as a function to set the chain
 *
 * @param {UseChainParams} mutationArgs optional properties which contain mutation arg overrides
 * @returns {UseChainResult} an object containing the current chain and a function to set the chain as well as loading state of setting the chain
 */
export function useChain(mutationArgs?: UseChainParams) {
  const { config } = useAlchemyAccountContext();

  const chain = useSyncExternalStore(
    watchChain(config),
    () => getChain(config),
    () => getChain(config)
  );

  const { mutate: setChain, isPending } = useMutation({
    mutationFn: ({ chain }: { chain: Chain }) =>
      setChainInternal(config, chain),
    ...mutationArgs,
  });

  return {
    chain,
    setChain,
    isSettingChain: isPending,
  };
}
