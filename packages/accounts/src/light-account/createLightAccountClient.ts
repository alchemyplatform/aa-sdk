import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import {
  createLightAccount,
  type CreateLightAccountParams,
  type LightAccount,
} from "./account.js";
import {
  lightAccountClientActions,
  type LightAccountClientActions,
} from "./lightAccountClientDecorator.js";

export type CreateLightAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: CreateLightAccountParams<TTransport, TOwner>["transport"];
  chain: CreateLightAccountParams<TTransport, TOwner>["chain"];
  account: Omit<
    CreateLightAccountParams<TTransport, TOwner>,
    "transport" | "chain"
  >;
} & Omit<
  SmartAccountClientConfig<TTransport, TChain>,
  "transport" | "account" | "chain"
>;

export function createLightAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateLightAccountClientParams<Transport, TChain, TOwner>
): Promise<
  SmartAccountClient<
    CustomTransport,
    Chain,
    LightAccount<TOwner>,
    SmartAccountClientActions<Chain, SmartContractAccount> &
      LightAccountClientActions<TOwner, LightAccount<TOwner>>
  >
>;

export async function createLightAccountClient({
  account,
  transport,
  chain,
  ...clientConfig
}: CreateLightAccountClientParams): Promise<SmartAccountClient> {
  const lightAccount = await createLightAccount({
    ...account,
    transport,
    chain,
  });

  return createSmartAccountClient({
    ...clientConfig,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(lightAccountClientActions);
}
