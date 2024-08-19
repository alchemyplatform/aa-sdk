import type { Chain, Transport } from "viem";
import { ClientOnlyPropertyError } from "../errors.js";
import type {
  AlchemyAccountsConfig,
  SupportedAccount,
  SupportedAccountTypes,
} from "../types";
import {
  getSmartAccountClient,
  type GetSmartAccountClientParams,
  type GetSmartAccountClientResult,
} from "./getSmartAccountClient.js";

/**
 * Watches for changes to the smart account client and triggers the provided callback when a change is detected.
 *
 * @example
 * ```ts
 * import { watchSmartAccountClient } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchSmartAccountClient({ type: "LightAccount" }, config)(console.log);
 * ```
 *
 * @template TAccount extends SupportedAccountTypes
 * @template TTransport extends Transport = Transport
 * @template TChain extends Chain | undefined = Chain | undefined
 *
 * @param {GetSmartAccountClientParams<TTransport, TChain, TAccount>} params the parameters needed to get the smart account client
 * @param {AlchemyAccountsConfig} config the configuration containing the client store and other settings
 * @returns {(onChange: (client: GetSmartAccountClientResult<TTransport, TChain, SupportedAccount<TAccount>>) => void) => (() => void)} a function that accepts a callback to be called when the client changes and returns a function to unsubscribe from the store
 */ export function watchSmartAccountClient<
  TAccount extends SupportedAccountTypes,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  params: GetSmartAccountClientParams<TTransport, TChain, TAccount>,
  config: AlchemyAccountsConfig
) {
  return (
    onChange: (
      client: GetSmartAccountClientResult<
        TTransport,
        TChain,
        SupportedAccount<TAccount>
      >
    ) => void
  ) => {
    const accounts = config.store.getState().accounts;
    if (!accounts) {
      throw new ClientOnlyPropertyError("account");
    }

    return config.store.subscribe(
      ({ signerStatus, accounts, bundlerClient, chain }) => ({
        signerStatus,
        account: accounts![chain.id][params.type],
        bundlerClient,
      }),
      () => onChange(getSmartAccountClient(params, config)),
      {
        equalityFn(a, b) {
          return (
            a.signerStatus === b.signerStatus &&
            a.account === b.account &&
            a.bundlerClient === b.bundlerClient
          );
        },
      }
    );
  };
}
