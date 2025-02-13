"use client";

import type { SupportedAccounts } from "@account-kit/core";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Chain, Client, Transport } from "viem";
import { ClientUndefinedHookError } from "../errors.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient";

export type UseClientActionsProps<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TActions extends { [x: string]: (...args: any[]) => unknown } = {
    [x: string]: (...args: any[]) => unknown;
  }
> = {
  client?: UseSmartAccountClientResult<TChain, SupportedAccounts>["client"];
  actions: (client: Client<TTransport, TChain, SupportedAccounts>) => TActions;
};

export type UseClientActionsResult<
  TActions extends { [x: string]: (...args: any[]) => unknown } = {
    [x: string]: (...args: any[]) => unknown;
  }
> = {
  executeAction: <TFunctionName extends ExecutableFunctionName<TActions>>(
    params: ClientActionParameters<TActions, TFunctionName>
  ) => void;
  executeActionAsync: <TFunctionName extends ExecutableFunctionName<TActions>>(
    params: ClientActionParameters<TActions, TFunctionName>
  ) => Promise<ExecuteableFunctionResult<TFunctionName>>;
  data: ReturnType<TActions[keyof TActions]> | undefined;
  isExecutingAction: boolean;
  error?: Error | null;
};

export type ExecutableFunctionName<
  TActions extends { [x: string]: (...args: any[]) => unknown } = {
    [x: string]: (...args: any[]) => unknown;
  }
> = keyof TActions extends infer functionName extends string
  ? [functionName] extends [never]
    ? string
    : functionName
  : string;

export type ExecuteableFunctionResult<
  TFunctionName extends ExecutableFunctionName<TActions>,
  TActions extends { [x: string]: (...args: any[]) => unknown } = {
    [x: string]: (...args: any[]) => unknown;
  }
> = ReturnType<TActions[TFunctionName]>;

export type ExecutableFunctionArgs<
  TActions extends { [x: string]: (...args: any[]) => unknown } = {
    [x: string]: (...args: any[]) => unknown;
  },
  TFunctionName extends ExecutableFunctionName<TActions> = ExecutableFunctionName<TActions>
> = Parameters<TActions[TFunctionName]>;

// All of this is based one how viem's `encodeFunctionData` works
export type ClientActionParameters<
  TActions extends { [x: string]: (...args: any[]) => unknown } = {
    [x: string]: (...args: any[]) => unknown;
  },
  TFunctionName extends ExecutableFunctionName<TActions> = ExecutableFunctionName<TActions>,
  allArgs = ExecutableFunctionArgs<
    TActions,
    TFunctionName extends ExecutableFunctionName<TActions>
      ? TFunctionName
      : ExecutableFunctionName<TActions>
  >
> = {
  functionName: TFunctionName;
  args: allArgs;
};

/**
 * A [hook](https://github.com/alchemyplatform/aa-sdk/blob/4c3956c01ce5ae3c157f006bf58fffde758e5d1b/account-kit/react/src/hooks/useClientActions.ts) that allows you to leverage client decorators to execute actions
 * and await them in your UX. This is particularly useful for using Plugins
 * with Modular Accounts.
 *
 * @param {UseClientActionsProps<TTransport, TChain, TActions>} args the hooks arguments highlighted below. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useClientActions.ts#L10)
 * @param {SmartAccountClient} args.client the smart account client returned from useSmartAccountClient
 * @param {object} args.actions the smart account client decorator you want to execute actions from
 * @returns {UseClientActionsResult<TActions>} an object containing methods to execute the actions as well loading and error states [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useClientActions.ts#L21)
 *
 * @example
 * ```tsx twoslash
 * import React from 'react';
 * import { useSmartAccountClient } from "@account-kit/react";
 * import { sessionKeyPluginActions } from "@account-kit/smart-contracts";
 * import { useClientActions } from "@account-kit/react";
 *
 * const Foo = () => {
 *  const { client } = useSmartAccountClient({ type: "MultiOwnerModularAccount" });
 *  const { executeAction } = useClientActions({
 *    client: client,
 *    actions: sessionKeyPluginActions,
 *  });
 *
 *  executeAction({
 *    functionName: "isAccountSessionKey",
 *    args: [{ key: "0x0" }],
 *  });
 * };
 * ```
 */
export function useClientActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TActions extends { [x: string]: (...args: any[]) => any } = {
    [x: string]: (...args: any[]) => any;
  }
>(
  args: UseClientActionsProps<TTransport, TChain, TActions>
): UseClientActionsResult<TActions> {
  const { client, actions } = args;

  const {
    mutate,
    isPending: isExecutingAction,
    error,
    mutateAsync,
    data,
  } = useMutation<
    ReturnType<TActions[keyof TActions]>,
    Error,
    ClientActionParameters<TActions, ExecutableFunctionName<TActions>>
  >({
    mutationFn: async <TFunctionName extends ExecutableFunctionName<TActions>>({
      functionName,
      args,
    }: ClientActionParameters<TActions, TFunctionName>) => {
      if (!client) {
        throw new ClientUndefinedHookError("useClientActions");
      }

      const actions_ = actions(client);
      return actions_[functionName](...args);
    },
  });

  const executeAction = useCallback(
    <TFunctionName extends ExecutableFunctionName<TActions>>(
      params: ClientActionParameters<TActions, TFunctionName>
    ) => {
      const { functionName, args } = params;
      return mutate({ functionName, args });
    },
    [mutate]
  );

  const executeActionAsync = useCallback(
    async <TFunctionName extends ExecutableFunctionName<TActions>>(
      params: ClientActionParameters<TActions, TFunctionName>
    ) => {
      const { functionName, args } = params;
      return mutateAsync({ functionName, args });
    },
    [mutateAsync]
  );

  return {
    executeAction,
    executeActionAsync,
    data,
    isExecutingAction,
    error,
  };
}
