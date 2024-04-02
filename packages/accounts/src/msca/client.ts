import {
  createSmartAccountClient,
  type EntryPointDef,
  type EntryPointVersion,
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
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  account: Omit<
    CreateMultiOwnerModularAccountParams<
      TEntryPointVersion,
      TTransport,
      TSigner
    >,
    "transport" | "chain"
  >;
} & Omit<
  CreateLightAccountClientParams<TEntryPointVersion, TChain, TSigner>,
  "account"
>;

export function createMultiOwnerModularAccountClient<
  TAccount extends
    | MultiOwnerModularAccount<TEntryPointVersion, TSigner>
    | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends MultiOwnerModularAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultiOwnerModularAccountClientParams<
    TEntryPointVersion,
    Transport,
    TChain,
    TSigner
  >
): Promise<
  SmartAccountClient<
    TEntryPointVersion,
    CustomTransport,
    Chain,
    MultiOwnerModularAccount<TEntryPointVersion, TSigner>,
    SmartAccountClientActions<
      TEntryPointVersion,
      Chain,
      MultiOwnerModularAccount<TEntryPointVersion, TSigner>
    > &
      MultiOwnerPluginActions<
        TEntryPointVersion,
        MultiOwnerModularAccount<TEntryPointVersion, TSigner>
      > &
      PluginManagerActions<
        TEntryPointVersion,
        MultiOwnerModularAccount<TEntryPointVersion, TSigner>
      > &
      AccountLoupeActions<
        TEntryPointVersion,
        MultiOwnerModularAccount<TEntryPointVersion, TSigner>
      >
  >
>;

export async function createMultiOwnerModularAccountClient<
  TAccount extends
    | MultiOwnerModularAccount<TEntryPointVersion, TSigner>
    | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends MultiOwnerModularAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  account,
  transport,
  chain,
  ...clientConfig
}: CreateMultiOwnerModularAccountClientParams<
  TEntryPointVersion,
  Transport,
  Chain,
  TSigner
>): Promise<
  SmartAccountClient<
    TEntryPointVersion,
    Transport,
    Chain,
    MultiOwnerModularAccount<TEntryPointVersion, TSigner>
  >
> {
  const modularAccount = (await createMultiOwnerModularAccount<
    EntryPointDef<TEntryPointVersion>,
    TEntryPointVersion,
    Transport,
    TSigner
  >({
    ...account,
    transport,
    chain,
  })) as MultiOwnerModularAccount<TEntryPointVersion, TSigner>;

  return createSmartAccountClient<
    MultiOwnerModularAccount<TEntryPointVersion, TSigner>,
    TEntryPointVersion,
    Transport,
    Chain
  >({
    ...clientConfig,
    transport,
    chain,
    account: modularAccount,
  })
    .extend(pluginManagerActions)
    .extend(multiOwnerPluginActions)
    .extend(accountLoupeActions);
}
