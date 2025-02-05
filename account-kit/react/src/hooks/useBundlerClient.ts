"use client";

import { getBundlerClient, watchBundlerClient } from "@account-kit/core";
import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

export type UseBundlerClientResult = ClientWithAlchemyMethods;

/**
 * Custom [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useBundlerClient.ts) to get a bundler client using the Alchemy account context.
 * It uses `useSyncExternalStore` to watch for any changes in the bundler client configuration and provides the updated bundler client. React hooks don’t handle their own state management directly, so they rely on external stores, like `useSyncExternalStore`, to manage state. useBundlerClient’s only job is to call the bundler JSON RPC methods directly; it does not do additional processing, unlike useSmartAccountClient. For example, if you call sendUserOperation, it expects a fully formed user operation.
 * It is an extension of [Viem’s Public Client](https://viem.sh/docs/clients/public) and provides access to public actions, talking to public RPC APIs like getBlock, eth_call, etc. It does not require an account as context.
 * Use cases: connecting with a EOA or checking for gas eligibility.
 *
 * @returns {BundlerClient} The bundler client based on the current Alchemy account configuration. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/aa-sdk/core/src/client/bundlerClient.ts#L24)
 *
 * @example
 * ```ts twoslash
 * import { useBundlerClient } from "@account-kit/react";
 *
 * const bundlerClient = useBundlerClient();
 * ```
 */
export const useBundlerClient = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchBundlerClient(config),
    () => getBundlerClient(config),
    () => getBundlerClient(config)
  );
};
