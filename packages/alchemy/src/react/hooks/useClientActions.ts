import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Chain, Client, Transport } from "viem";
import type { SupportedAccounts } from "../../config";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient";

export type UseClientActionsProps<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TActions extends { [x: string]: (...args: any[]) => unknown } = {
    [x: string]: (...args: any[]) => unknown;
  }
> = {
  client?: UseSmartAccountClientResult<
    TTransport,
    TChain,
    SupportedAccounts
  >["client"];
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
 * A hook that allows you to leverage client decorators to execute actions
 * and await them in your UX. This is particularly useful for using Plugins
 * with Modular Accounts.
 *
 * @param args the arguments for the hook
 * @param args.client the smart account client to use for executing the actions
 * @param args.actions the smart account client decorator actions to execute
 * @returns a set of functions for executing the actions inlcuding the state of execution see {@link UseClientActionsResult}
 *
 * @example
 * ```tsx
 * const Foo = () => {
 *  const { client } = useSmartAccountClient({ type: "MultiOwnerModularAccount" });
 *  const { executeAction } = useClientActions({
 *    client,
 *    pluginActions: sessionKeyPluginActions,
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
        // TODO: use the strongly typed error here
        throw new Error("no client");
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
