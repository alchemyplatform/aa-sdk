import {
  createSmartAccountClient,
  smartAccountClientActions,
  type SmartAccountClient,
  type SmartAccountClientRpcSchema,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import type { CreateLightAccountClientParams } from "../../light-account/clients/client.js";
import {
  accountLoupeActions,
  type AccountLoupeActions,
} from "../account-loupe/decorator.js";
import {
  createMultiOwnerModularAccount,
  type CreateMultiOwnerModularAccountParams,
  type MultiOwnerModularAccount,
} from "../account/multiOwnerAccount.js";
import {
  createMultisigModularAccount,
  type CreateMultisigModularAccountParams,
  type MultisigModularAccount,
} from "../account/multisigAccount.js";
import {
  pluginManagerActions,
  type PluginManagerActions,
} from "../plugin-manager/decorator.js";
import {
  multiOwnerPluginActions,
  type MultiOwnerPluginActions,
} from "../plugins/multi-owner/index.js";
import {
  multisigPluginActions,
  type MultisigPluginActions,
  type MultisigUserOperationContext,
} from "../plugins/multisig/index.js";
import { multisigSignatureMiddleware } from "../plugins/multisig/middleware.js";

export type CreateMultiOwnerModularAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultiOwnerModularAccountParams<TTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<CreateLightAccountClientParams<TTransport, TChain, TSigner>, "account">;

export type CreateMultisigModularAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultisigModularAccountParams<TTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<CreateLightAccountClientParams<TTransport, TChain, TSigner>, "account">;

export function createMultiOwnerModularAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultiOwnerModularAccountClientParams<Transport, TChain, TSigner>
): Promise<
  SmartAccountClient<
    CustomTransport,
    Chain,
    MultiOwnerModularAccount<TSigner>,
    MultiOwnerPluginActions<MultiOwnerModularAccount<TSigner>> &
      PluginManagerActions<MultiOwnerModularAccount<TSigner>> &
      AccountLoupeActions<MultiOwnerModularAccount<TSigner>>
  >
>;

/**
 * Creates a multi-owner modular account client with the provided parameters including account, transport, chain, and additional client configuration. This function uses a modular account and extends it with various plugin actions.
 *
 * @example
 * ```ts
 * import { createMultiOwnerModularAccountClient } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http } from "viem";
 * import { generatePrivateKey } from "viem/accounts";
 *
 * const accountClient = await createMultiOwnerModularAccountClient({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {CreateMultiOwnerModularAccountClientParams} config The parameters for creating the multi-owner modular account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance with extended plugin actions
 */
export async function createMultiOwnerModularAccountClient({
  transport,
  chain,
  ...params
}: CreateMultiOwnerModularAccountClientParams): Promise<SmartAccountClient> {
  const modularAccount = await createMultiOwnerModularAccount({
    ...params,
    transport,
    chain,
  });

  return createSmartAccountClient({
    ...params,
    transport,
    chain,
    account: modularAccount,
  })
    .extend(pluginManagerActions)
    .extend(multiOwnerPluginActions)
    .extend(accountLoupeActions);
}

export function createMultisigModularAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultisigModularAccountClientParams<Transport, TChain, TSigner>
): Promise<
  SmartAccountClient<
    CustomTransport,
    Chain,
    MultisigModularAccount<TSigner>,
    MultisigPluginActions<MultisigModularAccount<TSigner>> &
      PluginManagerActions<MultisigModularAccount<TSigner>> &
      AccountLoupeActions<MultisigModularAccount<TSigner>>,
    SmartAccountClientRpcSchema,
    MultisigUserOperationContext
  >
>;

/**
 * Creates a multisig modular account client using the provided parameters including account details, transport, chain, and additional client configuration. This function constructs the multisig modular account and extends it with various actions to create a comprehensive client.
 *
 * @example
 * ```ts
 * import { createMultisigModularAccountClient } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http } from "viem"
 * import { generatePrivateKey } from "viem/accounts";
 *
 * const accountClient = await createMultisigModularAccountClient({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
 *  owners: [], // other owners on the account
 *  threshold: 2, // 2 of N signatures
 * });
 * ```
 *
 * @param {CreateMultisigModularAccountClientParams} config the parameters for configuring the multisig modular account client
 * @returns {Promise<SmartAccountClient<Transport, Chain, MultisigModularAccount<SmartAccountSigner>, {}, SmartAccountClientRpcSchema, MultisigUserOperationContext>>} a promise that resolves to a `SmartAccountClient` object extended with the multisig modular account and additional actions
 */
export async function createMultisigModularAccountClient({
  transport,
  chain,
  ...params
}: CreateMultisigModularAccountClientParams): Promise<
  SmartAccountClient<
    Transport,
    Chain,
    MultisigModularAccount<SmartAccountSigner>,
    {},
    SmartAccountClientRpcSchema,
    MultisigUserOperationContext
  >
> {
  const modularAccount = await createMultisigModularAccount({
    ...params,
    transport,
    chain,
  });

  const client = createSmartAccountClient({
    ...params,
    transport,
    chain,
    account: modularAccount,
    signUserOperation: multisigSignatureMiddleware,
  })
    .extend(smartAccountClientActions)
    .extend(pluginManagerActions)
    .extend(multisigPluginActions)
    .extend(accountLoupeActions);

  return client;
}
