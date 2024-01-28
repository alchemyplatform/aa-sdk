import {
  createSmartAccountClientFromExisting,
  type SmartAccountClient,
  type SmartAccountClientConfig,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import {
  createLightAccount,
  type CreateLightAccountParams,
  type LightAccount,
} from "./account.js";

export type CreateLightAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = {
  client: CreateLightAccountParams<TTransport, TOwner>["client"];
  account: Omit<CreateLightAccountParams<TTransport, TOwner>, "client">;
  clientConfig?: Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account"
  >;
};

export const createLightAccountClient: <
  TChain extends Chain = Chain,
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateLightAccountClientParams<Transport, TChain, TOwner>
) => Promise<
  SmartAccountClient<CustomTransport, TChain, LightAccount<TOwner>>
> = async ({ account, client, clientConfig }) => {
  const lightAccount = await createLightAccount({
    client,
    ...account,
  });

  return createSmartAccountClientFromExisting({
    ...clientConfig,
    client,
    account: lightAccount,
  });
};
