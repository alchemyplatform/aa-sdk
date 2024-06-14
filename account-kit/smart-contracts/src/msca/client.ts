import {
  createSmartAccountClient,
  smartAccountClientActions,
  type SmartAccountClient,
  type SmartAccountClientRpcSchema,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import type { CreateLightAccountClientParams } from "../light-account/clients/lightAccount";
import {
  accountLoupeActions,
  type AccountLoupeActions,
} from "./account-loupe/decorator.js";
import {
  createMultiOwnerModularAccount,
  type CreateMultiOwnerModularAccountParams,
  type MultiOwnerModularAccount,
} from "./account/multiOwnerAccount.js";
import {
  createMultisigModularAccount,
  type CreateMultisigModularAccountParams,
  type MultisigModularAccount,
} from "./account/multisigAccount.js";
import {
  pluginManagerActions,
  type PluginManagerActions,
} from "./plugin-manager/decorator.js";
import {
  multiOwnerPluginActions,
  type MultiOwnerPluginActions,
} from "./plugins/multi-owner/index.js";
import {
  multisigPluginActions,
  type MultisigPluginActions,
  type MultisigUserOperationContext,
} from "./plugins/multisig/index.js";
import { multisigSignatureMiddleware } from "./plugins/multisig/middleware.js";

export type CreateMultiOwnerModularAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  account: Omit<
    CreateMultiOwnerModularAccountParams<TTransport, TSigner>,
    "transport" | "chain"
  >;
} & Omit<
  CreateLightAccountClientParams<TTransport, TChain, TSigner>,
  "account"
>;

export type CreateMultisigModularAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  account: Omit<
    CreateMultisigModularAccountParams<TTransport, TSigner>,
    "transport" | "chain"
  >;
} & Omit<
  CreateLightAccountClientParams<TTransport, TChain, TSigner>,
  "account"
>;

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

export async function createMultiOwnerModularAccountClient({
  account,
  transport,
  chain,
  ...clientConfig
}: CreateMultiOwnerModularAccountClientParams): Promise<SmartAccountClient> {
  const modularAccount = await createMultiOwnerModularAccount({
    ...account,
    transport,
    chain,
  });

  return createSmartAccountClient({
    ...clientConfig,
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

export async function createMultisigModularAccountClient({
  account,
  transport,
  chain,
  ...clientConfig
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
    ...account,
    transport,
    chain,
  });

  const client = createSmartAccountClient({
    ...clientConfig,
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
