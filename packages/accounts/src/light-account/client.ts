import {
  createSmartAccountClient,
  type EntryPointDef,
  type EntryPointVersion,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Chain, type Transport } from "viem";
import {
  createLightAccount,
  type CreateLightAccountParams,
  type LightAccount,
} from "./account.js";
import {
  lightAccountClientActions,
  type LightAccountClientActions,
} from "./decorator.js";

export type CreateLightAccountClientParams<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: CreateLightAccountParams<
    TEntryPointVersion,
    Transport,
    TSigner
  >["transport"];
  chain: CreateLightAccountParams<
    TEntryPointVersion,
    Transport,
    TSigner
  >["chain"];
  account: Omit<
    CreateLightAccountParams<TEntryPointVersion, Transport, TSigner>,
    "transport" | "chain"
  >;
} & Omit<
  SmartAccountClientConfig<TEntryPointVersion, Transport, TChain>,
  "transport" | "account" | "chain"
>;

export function createLightAccountClient<
  TAccount extends LightAccount<TEntryPointVersion, TSigner> | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends LightAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateLightAccountClientParams<TEntryPointVersion, TChain, TSigner>
): Promise<
  SmartAccountClient<
    TEntryPointVersion,
    Transport,
    TChain,
    LightAccount<TEntryPointVersion, TSigner>,
    SmartAccountClientActions<
      TEntryPointVersion,
      TChain,
      SmartContractAccount<TEntryPointVersion>
    > &
      LightAccountClientActions<
        TEntryPointVersion,
        TSigner,
        LightAccount<TEntryPointVersion, TSigner>
      >
  >
>;

export async function createLightAccountClient<
  TAccount extends LightAccount<TEntryPointVersion, TSigner> | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends LightAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  account,
  transport,
  chain,
  ...clientConfig
}: CreateLightAccountClientParams<
  TEntryPointVersion,
  TChain,
  TSigner
>): Promise<
  SmartAccountClient<
    TEntryPointVersion,
    Transport,
    TChain,
    LightAccount<TEntryPointVersion>
  >
> {
  const lightAccount = (await createLightAccount<
    EntryPointDef<TEntryPointVersion>,
    TEntryPointVersion,
    Transport,
    TSigner
  >({
    ...account,
    transport,
    chain,
  })) as LightAccount<TEntryPointVersion, TSigner>;

  return createSmartAccountClient<
    LightAccount<TEntryPointVersion, TSigner>,
    TEntryPointVersion,
    Transport,
    TChain
  >({
    ...clientConfig,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(lightAccountClientActions);
}
