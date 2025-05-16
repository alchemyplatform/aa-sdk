"use client";

import {
  getChain,
  setChain as setChainInternal,
  watchChain,
} from "@account-kit/core";
import { useMutation } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import type { Chain } from "viem";
import type { BaseHookMutationArgs } from "../types.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

export type UseChainParams = BaseHookMutationArgs<void, { chain: Chain }>;

export interface UseChainResult {
  chain: Chain;
  setChain: (params: { chain: Chain }) => void;
  isSettingChain: boolean;
}

/**
 * A [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useChain.ts) that returns the current chain as well as a function to set the chain.
 * Note: when calling `setChain` the chain that's passed in must be defined in
 * your initial `createConfig` call. Calling `setChain` causes the chain to change across the board. For example, if you use set chain then use `useSmartAccountClient`, the client will flip to the loading state and address for the account on the changed chain.
 *
 * For switching chains, you can also use [createBundlerClient](https://www.alchemy.com/docs/wallets/reference/aa-sdk/core/functions/createBundlerClient#createbundlerclient) or [createSmartAccoutClient](https://www.alchemy.com/docs/wallets/reference/aa-sdk/core/functions/createSmartAccountClient) directly and create a different client for each chain. You would have to manage different clients, but you wouldn't have to wait for any hooks to complete and can run these queries in parallel. This way the chain set in the config that the smart account client and other hooks inherit is not also affected.
 *
 * @param {UseChainParams} mutationArgs optional properties which contain mutation arg overrides. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useChain.ts#L14)
 * @returns {UseChainResult} an object containing the current chain and a function to set the chain as well as loading state of setting the chain. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useChain.ts#L16)
 *
 * @example
 * ```tsx twoslash
 * import React from 'react';
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
