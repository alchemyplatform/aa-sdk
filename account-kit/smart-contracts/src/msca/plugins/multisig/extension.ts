import {
  type GetAccountParameter,
  type GetEntryPointFromAccount,
  type IsUndefined,
  type SendUserOperationParameters,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { type Address, type Chain, type Client, type Transport } from "viem";
import type { GetPluginAddressParameter } from "../types.js";
import { getThreshold } from "./actions/getThreshold.js";
import { isOwnerOf } from "./actions/isOwnerOf.js";
import { proposeUserOperation } from "./actions/proposeUserOperation.js";
import { readOwners } from "./actions/readOwners.js";
import { signMultisigUserOperation } from "./actions/signMultisigUserOperation.js";
import {
  multisigPluginActions as multisigPluginActions_,
  type MultisigPluginActions as MultisigPluginActions_,
} from "./plugin.js";
import {
  type MultisigUserOperationContext,
  type ProposeUserOperationResult,
  type SignMultisigUserOperationParams,
  type SignMultisigUserOperationResult,
} from "./types.js";

export type MultisigPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = MultisigPluginActions_<TAccount, MultisigUserOperationContext> & {
  readOwners: (
    params: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) => Promise<ReadonlyArray<Address>>;

  isOwnerOf: (
    params: { address: Address } & GetPluginAddressParameter &
      GetAccountParameter<TAccount>
  ) => Promise<boolean>;

  getThreshold: (
    params: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) => Promise<bigint>;

  proposeUserOperation: (
    params: SendUserOperationParameters<TAccount, undefined>
  ) => Promise<
    ProposeUserOperationResult<TAccount, GetEntryPointFromAccount<TAccount>>
  >;

  signMultisigUserOperation: (
    params: SignMultisigUserOperationParams<TAccount>
  ) => Promise<SignMultisigUserOperationResult>;
} & (IsUndefined<TAccount> extends false
    ? {
        readOwners: (
          params?: GetPluginAddressParameter & GetAccountParameter<TAccount>
        ) => Promise<ReadonlyArray<Address>>;
      }
    : {});

/**
 * Provides actions for managing a multisig plugin within the specified client, including reading owners, checking ownership, getting the threshold, proposing user operations, and signing multisig user operations.
 *
 * @example
 * ```ts
 * import { createModularAccountAlchemyClient, multisigPluginActions } from "@account-kit/smart-contracts";
 *
 * const client = createModularAccountAlchemyClient(...).extend(multisigPluginActions);
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance configured with transport, chain, and account information
 * @returns {MultisigPluginActions<TAccount>} An object containing methods to perform actions related to the multisig plugin
 */
export const multisigPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => MultisigPluginActions<TAccount> = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => ({
  ...multisigPluginActions_(client),
  readOwners: (
    args: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) => readOwners(client, args),

  isOwnerOf: (
    args: { address: Address } & GetPluginAddressParameter &
      GetAccountParameter<TAccount>
  ) => isOwnerOf(client, args),

  getThreshold: (
    args: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) => getThreshold(client, args),

  proposeUserOperation: (
    args: SendUserOperationParameters<TAccount, undefined>
  ) => proposeUserOperation(client, args),

  signMultisigUserOperation: (
    params: SignMultisigUserOperationParams<TAccount>
  ): Promise<SignMultisigUserOperationResult> =>
    signMultisigUserOperation(client, params),
});
