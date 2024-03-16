import {
  createSmartAccountClient,
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
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateLightAccountClientParams<EntryPointVersion, TChain, TSigner>
): Promise<
  SmartAccountClient<
    EntryPointVersion,
    Transport,
    TChain,
    LightAccount<EntryPointVersion, TSigner>,
    SmartAccountClientActions<
      EntryPointVersion,
      TChain,
      SmartContractAccount<EntryPointVersion>
    > &
      LightAccountClientActions<
        EntryPointVersion,
        TSigner,
        LightAccount<EntryPointVersion, TSigner>
      >
  >
>;

export async function createLightAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  account,
  transport,
  chain,
  ...clientConfig
}: CreateLightAccountClientParams<EntryPointVersion, TChain, TSigner>): Promise<
  SmartAccountClient<
    EntryPointVersion,
    Transport,
    TChain,
    LightAccount<EntryPointVersion>
  >
> {
  const lightAccount = await createLightAccount({
    ...account,
    transport,
    chain,
  });

  return createSmartAccountClient<
    EntryPointVersion,
    Transport,
    TChain,
    LightAccount<EntryPointVersion>
  >({
    ...clientConfig,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(lightAccountClientActions);
}
