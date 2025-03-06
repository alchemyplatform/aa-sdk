import {
  createSmartAccountClient,
  smartAccountClientActions,
  type NotType,
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
import type { AlchemyModularAccountClientConfig } from "./alchemyClient.js";
import {
  createAlchemySmartAccountClient,
  isAlchemyTransport,
  type AlchemySmartAccountClient,
  type AlchemyTransport,
} from "@account-kit/infra";
import type { AlchemyMultisigAccountClientConfig } from "./multiSigAlchemyClient.js";

export type CreateMultiOwnerModularAccountClientWithoutAlchemyParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultiOwnerModularAccountParams<TTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<CreateLightAccountClientParams<TTransport, TChain, TSigner>, "account">;
export type CreateMultiOwnerModularAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> =
  | CreateMultiOwnerModularAccountClientWithoutAlchemyParams<
      TTransport,
      TChain,
      TSigner
    >
  | AlchemyModularAccountClientConfig<TSigner>;

export type CreateMultisigModularAccountClientWithoutAlchemyParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultisigModularAccountParams<TTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<CreateLightAccountClientParams<TTransport, TChain, TSigner>, "account">;

export type CreateMultisigModularAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> =
  | CreateMultisigModularAccountClientWithoutAlchemyParams<
      TTransport,
      TChain,
      TSigner
    >
  | AlchemyMultisigAccountClientConfig<TSigner>;

export function createMultiOwnerModularAccountClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyModularAccountClientConfig<TSigner> & {
    transport: AlchemyTransport;
  }
): Promise<
  AlchemySmartAccountClient<
    Chain | undefined,
    MultiOwnerModularAccount<TSigner>,
    MultiOwnerPluginActions<MultiOwnerModularAccount<TSigner>> &
      PluginManagerActions<MultiOwnerModularAccount<TSigner>> &
      AccountLoupeActions<MultiOwnerModularAccount<TSigner>>
  >
>;

export function createMultiOwnerModularAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultiOwnerModularAccountClientParams<
    TTransport,
    TChain,
    TSigner
  > &
    NotType<TTransport, AlchemyTransport>
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
 * @example
 * ```ts
 * import { createMultiOwnerModularAccountClient } from "@account-kit/smart-contracts";
 * import { sepolia, alchemy } from "@account-kit/infra";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const alchemyAccountClient = await createMultiOwnerModularAccountClient({
 *  transport: alchemy({ apiKey: "your-api-key" }),
 *  chain: sepolia,
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
}: CreateMultiOwnerModularAccountClientParams): Promise<
  SmartAccountClient | AlchemySmartAccountClient
> {
  const modularAccount = await createMultiOwnerModularAccount({
    ...params,
    transport,
    chain,
  });
  if (isAlchemyTransport(transport, chain)) {
    const { opts } = params;

    return createAlchemySmartAccountClient({
      ...params,
      account: modularAccount,
      transport,
      chain,
      opts,
    })
      .extend(multiOwnerPluginActions)
      .extend(pluginManagerActions)
      .extend(accountLoupeActions);
  }

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
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultisigAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    Chain | undefined,
    MultisigModularAccount<TSigner>,
    MultisigPluginActions<MultisigModularAccount<TSigner>> &
      PluginManagerActions<MultisigModularAccount<TSigner>> &
      AccountLoupeActions<MultisigModularAccount<TSigner>>,
    MultisigUserOperationContext
  >
>;

export function createMultisigModularAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultisigModularAccountClientParams<TTransport, TChain, TSigner> &
    NotType<TTransport, AlchemyTransport>
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
 * @example
 * ```ts
 * import { createMultisigModularAccountClient } from "@account-kit/smart-contracts";
 * import { sepolia } from "@account-kit/infra";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const alchemyAccountClient = await createMultisigModularAccountClient({
 *  transport: alchemy({ apiKey: "your-api-key" }),
 *  chain: sepolia,
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
 *  owners: [...], // other owners on the account
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
  | SmartAccountClient<
      Transport,
      Chain,
      MultisigModularAccount<SmartAccountSigner>,
      {},
      SmartAccountClientRpcSchema,
      MultisigUserOperationContext
    >
  | AlchemySmartAccountClient<
      Chain | undefined,
      MultisigModularAccount<SmartAccountSigner>,
      MultisigPluginActions<MultisigModularAccount<SmartAccountSigner>> &
        PluginManagerActions<MultisigModularAccount<SmartAccountSigner>> &
        AccountLoupeActions<MultisigModularAccount<SmartAccountSigner>>,
      MultisigUserOperationContext
    >
> {
  const modularAccount = await createMultisigModularAccount({
    ...params,
    transport,
    chain,
  });
  if (isAlchemyTransport(transport, chain)) {
    // Need to fit the type into this since the previous multiSigAlchemyClient had it at this point, but without an Value as Type should be safe
    // And the createAlchemySmartAccountClient signUserOperation could not infer without this
    let config: AlchemyMultisigAccountClientConfig = {
      ...params,
      chain,
      transport,
    };
    const { opts } = config;

    return createAlchemySmartAccountClient({
      ...config,
      account: modularAccount,
      opts,
      signUserOperation: multisigSignatureMiddleware,
    })
      .extend(smartAccountClientActions)
      .extend(multisigPluginActions)
      .extend(pluginManagerActions)
      .extend(accountLoupeActions);
  }

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
