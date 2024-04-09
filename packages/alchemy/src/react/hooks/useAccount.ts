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
} from "../../config/index.js";
import { useAlchemyAccountContext } from "../context.js";
import { useSignerStatus } from "./useSignerStatus.js";

export type UseAccountResult<TAccount extends SupportedAccountTypes> = {
  account?: SupportedAccount<TAccount>;
  isLoadingAccount: boolean;
};

export type UseAccountProps<TAccount extends SupportedAccountTypes> =
  GetAccountParams<TAccount> & {
    skipCreate?: boolean;
  };

export function useAccount<TAccount extends SupportedAccountTypes>(
  params: UseAccountProps<TAccount>
): UseAccountResult<TAccount> {
  const { config, queryClient } = useAlchemyAccountContext();
  const status = useSignerStatus();
  const account = useSyncExternalStore(
    watchAccount(params.type, config),
    () => getAccount(params, config),
    defaultAccountState<TAccount>
  );

  const { mutate, isPending } = useMutation(
    {
      mutationFn: async () => account?.account ?? createAccount(params, config),
      mutationKey: ["createAccount", params.type],
    },
    queryClient
  );

  useEffect(() => {
    if (
      !params.skipCreate &&
      status.isConnected &&
      !account?.account &&
      !isPending
    ) {
      mutate();
    }
  }, [account, isPending, mutate, params.skipCreate, status]);

  return {
    account: account.status === "READY" ? account?.account : undefined,
    isLoadingAccount:
      isPending ||
      account?.status === "INITIALIZING" ||
      status.isAuthenticating ||
      status.isInitializing,
  };
}
