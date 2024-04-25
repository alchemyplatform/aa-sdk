"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import type { Address } from "viem";
import { createAccount } from "../../config/actions/createAccount.js";
import {
  getAccount,
  type GetAccountParams,
} from "../../config/actions/getAccount.js";
import { watchAccount } from "../../config/actions/watchAccount.js";
import {
  type SupportedAccount,
  type SupportedAccountTypes,
  type SupportedAccounts,
} from "../../config/index.js";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSignerStatus } from "./useSignerStatus.js";

export type UseAccountMutationArgs<TAccount extends SupportedAccountTypes> =
  BaseHookMutationArgs<SupportedAccount<TAccount> | SupportedAccounts, void>;

export type UseAccountResult<TAccount extends SupportedAccountTypes> = {
  account?: SupportedAccount<TAccount>;
  address?: Address;
  isLoadingAccount: boolean;
};

export type UseAccountProps<TAccount extends SupportedAccountTypes> =
  GetAccountParams<TAccount> & {
    skipCreate?: boolean;
  } & UseAccountMutationArgs<TAccount>;

export function useAccount<TAccount extends SupportedAccountTypes>(
  params: UseAccountProps<TAccount>
): UseAccountResult<TAccount> {
  const { type, accountParams, skipCreate, ...mutationArgs } = params;
  const { config, queryClient } = useAlchemyAccountContext();
  const status = useSignerStatus();
  const account = useSyncExternalStore(
    watchAccount(type, config),
    () => getAccount(params, config),
    () => getAccount(params, config)
  );

  const { mutate, isPending } = useMutation(
    {
      mutationFn: async () => {
        if (account.status !== "RECONNECTING" && account?.account) {
          return account.account;
        }

        return createAccount(params, config);
      },
      mutationKey: ["createAccount", type],
      ...mutationArgs,
    },
    queryClient
  );

  useEffect(() => {
    if (!skipCreate && status.isConnected && !account?.account && !isPending) {
      mutate();
    }
  }, [account, isPending, mutate, skipCreate, status.isConnected]);

  return {
    account: account.status === "READY" ? account?.account : undefined,
    address:
      account.status === "RECONNECTING" || account.status === "READY"
        ? account.account.address
        : undefined,
    isLoadingAccount:
      isPending ||
      account?.status === "INITIALIZING" ||
      account?.status === "RECONNECTING" ||
      status.isAuthenticating ||
      status.isInitializing,
  };
}
