"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import { createAccount } from "../../config/actions/createAccount.js";
import {
  getAccount,
  type GetAccountParams,
} from "../../config/actions/getAccount.js";
import { watchAccount } from "../../config/actions/watchAccount.js";
import {
  defaultAccountState,
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
    defaultAccountState<TAccount>
  );

  const { mutate, isPending } = useMutation(
    {
      mutationFn: async () => account?.account ?? createAccount(params, config),
      mutationKey: ["createAccount", type],
      ...mutationArgs,
    },
    queryClient
  );

  useEffect(() => {
    if (!skipCreate && status.isConnected && !account?.account && !isPending) {
      mutate();
    }
  }, [account, isPending, mutate, skipCreate, status]);

  return {
    account: account.status === "READY" ? account?.account : undefined,
    isLoadingAccount:
      isPending ||
      account?.status === "INITIALIZING" ||
      status.isAuthenticating ||
      status.isInitializing,
  };
}
