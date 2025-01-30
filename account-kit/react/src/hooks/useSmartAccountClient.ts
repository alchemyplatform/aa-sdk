"use client";

import type {
  GetSmartAccountClientParams,
  GetSmartAccountClientResult,
  SupportedAccount,
  SupportedAccounts,
  SupportedAccountTypes,
} from "@account-kit/core";
import {
  getSmartAccountClient,
  watchSmartAccountClient,
} from "@account-kit/core";
import { useMemo, useSyncExternalStore } from "react";
import type { Chain } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";

export type UseSmartAccountClientProps<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccountTypes = SupportedAccountTypes
> = GetSmartAccountClientParams<TChain, TAccount>;

export type UseSmartAccountClientResult<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccounts = SupportedAccounts
> = GetSmartAccountClientResult<TChain, TAccount>;

export function useSmartAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccountTypes = SupportedAccountTypes
>(
  args: UseSmartAccountClientProps<TChain, TAccount>
): UseSmartAccountClientResult<TChain, SupportedAccount<TAccount>>;

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSmartAccountClient.ts) that uses the provided smart account client parameters to create or retrieve an existing smart account client, handling different types of accounts including LightAccount, MultiOwnerLightAccount, and MultiOwnerModularAccount.
 * Under the hood, Smart Account Client takes care of all the necessary middleware operations needed to populate a user operation such as gas estimation and paymaster data.
 *
 * If passing in an undefined client, Smart Account Client will treat the connected account as an EOA.
 *
 * If using with an EOA, Smart Account Client won’t throw an error, but the client itself will stay undefined forever. We recommend useBundlerClient instead when using an EOA. The EOA must also be connected or authenticated with a signer.
 *
 * @example
 * ```ts
 * import { useSmartAccountClient } from "@account-kit/react";
 *
 * const { client, address, isLoadingClient } = useSmartAccountClient({
 *  type: "LightAccount",
 *  accountParams: {...}, // optional [params](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/core/src/actions/createAccount.ts#L23) to further configure the account
 * });
 * ```
 *
 * @param {UseSmartAccountClientProps} props The properties required to use the smart account client, including account parameters, type, and additional client parameters. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSmartAccountClient.ts#L19)
 * @returns {UseSmartAccountClientResult} An object containing the smart account client, the address, and a loading state. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSmartAccountClient.ts#L24)
 */
export function useSmartAccountClient({
  accountParams,
  type,
  ...clientParams
}: UseSmartAccountClientProps): UseSmartAccountClientResult {
  const {
    config: {
      _internal: { wagmiConfig },
    },
    config,
  } = useAlchemyAccountContext();

  const result = useSyncExternalStore(
    watchSmartAccountClient({ type, accountParams, ...clientParams }, config),
    () =>
      getSmartAccountClient({ type, accountParams, ...clientParams }, config),
    () =>
      getSmartAccountClient({ type, accountParams, ...clientParams }, config)
  );

  const { isConnected, address: eoaAddress } = wagmi_useAccount({
    config: wagmiConfig,
  });

  const eoaClient = useMemo(() => {
    if (!isConnected) return null;
    console.warn("EOA is connected, will not return an SCA client");

    return {
      client: undefined,
      address: eoaAddress,
      isLoadingClient: false,
    };
  }, [eoaAddress, isConnected]);

  if (eoaClient) {
    return eoaClient;
  }

  return result;
}
