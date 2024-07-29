import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { type Chain, type CustomTransport, type Transport } from "viem";

import type { SmartAccountClientConfig } from "@aa-sdk/core";

import {
  createSingleSignerRIAccount,
  type CreateSingleSignerRIAccountParams,
  type SingleSignerRIAccount,
} from "./account/account.js";

export type CreateSingleSignerRIAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = 
  CreateSingleSignerRIAccountParams<TTransport, TSigner>
   & Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export function createSingleSignerRIAccountClient<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateSingleSignerRIAccountClientParams<Transport, TChain, TSigner>
): Promise<
  SmartAccountClient<CustomTransport, Chain, SingleSignerRIAccount<TSigner>>
>;

export async function createSingleSignerRIAccountClient({
  ...config
}: CreateSingleSignerRIAccountClientParams): Promise<SmartAccountClient> {
  const singleSignerRIAccount = await createSingleSignerRIAccount({
    ...config,
  });

  return createSmartAccountClient({
    ...config,
    account: singleSignerRIAccount,
  });
}
