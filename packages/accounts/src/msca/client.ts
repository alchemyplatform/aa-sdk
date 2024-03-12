import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import type { CreateLightAccountClientParams } from "../light-account/client";
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
  pluginManagerActions,
  type PluginManagerActions,
} from "./plugin-manager/decorator.js";
import {
  multiOwnerPluginActions,
  type MultiOwnerPluginActions,
} from "./plugins/multi-owner/index.js";

export type CreateMultiOwnerModularAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = {
  account: Omit<
    CreateMultiOwnerModularAccountParams<TTransport, TSigner>,
    "transport" | "chain"
  >;
} & Omit<
  CreateLightAccountClientParams<TTransport, TChain, TSigner>,
  "account"
>;

export function createMultiOwnerModularAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(
  args: CreateMultiOwnerModularAccountClientParams<Transport, TChain, TSigner>,
): Promise<
  SmartAccountClient<
    CustomTransport,
    Chain,
    MultiOwnerModularAccount<TSigner>,
    SmartAccountClientActions<Chain, MultiOwnerModularAccount<TSigner>> &
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
