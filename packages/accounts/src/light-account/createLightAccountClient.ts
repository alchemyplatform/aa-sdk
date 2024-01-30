import {
  createSmartAccountClientFromExisting,
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
  client: CreateLightAccountParams<TTransport, TOwner>["client"];
  account: Omit<CreateLightAccountParams<TTransport, TOwner>, "client">;
} & Omit<SmartAccountClientConfig<TTransport, TChain>, "transport" | "account">;

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
  client,
  ...clientConfig
}: CreateLightAccountClientParams): Promise<SmartAccountClient> {
  const lightAccount = await createLightAccount({
    client,
    ...account,
  });

  return createSmartAccountClientFromExisting({
    ...clientConfig,
    client,
    chain: client.chain,
    account: lightAccount,
  }).extend(lightAccountClientActions);
}
