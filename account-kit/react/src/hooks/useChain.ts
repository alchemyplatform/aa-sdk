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
  setChain: (params: { chain: Chain }) => void;
  isSettingChain: boolean;
}

/**
 * A hook that returns the current chain as well as a function to set the chain.
 * Note: when calling `setChain` the chain that's passed in must be defined in
 * your initial `createConfig` call.
 *
 * @example
 * ```tsx
 * import { useChain } from "@account-kit/react";
 * // Assuming the chain sepolia is defined in your initial createConfig call
 * import { sepolia } from "@account-kit/infra";
 *
 * function ComponentUsingChain() {
 *  const { chain, setChain, isSettingChain } = useChain();
 *
 *  return (
 *    <div>
 *      <p>Current Chain: {chain.id}</p>
 *      <button onClick={() => setChain({chain: sepolia})} disabled={isSettingChain}>Set Chain</button>
 *    </div>
 *  );
 * }
 * ```
 *
 * @param {UseChainParams} mutationArgs optional properties which contain mutation arg overrides
 * @returns {UseChainResult} an object containing the current chain and a function to set the chain as well as loading state of setting the chain
 */
export function useChain(mutationArgs?: UseChainParams): UseChainResult {
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
