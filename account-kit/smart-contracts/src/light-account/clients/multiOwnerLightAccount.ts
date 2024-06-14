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
  createMultiOwnerLightAccount,
  type CreateMultiOwnerLightAccountParams,
  type MultiOwnerLightAccount,
} from "../accounts/multiOwner.js";
import {
  multiOwnerLightAccountClientActions,
  type MultiOwnerLightAccountClientActions,
} from "../decorators/multiOwnerLightAccount.js";

export type CreateMultiOwnerLightAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: CreateMultiOwnerLightAccountParams<
    TTransport,
    TSigner
  >["transport"];
  chain: CreateMultiOwnerLightAccountParams<TTransport, TSigner>["chain"];
  account: Omit<
    CreateMultiOwnerLightAccountParams<TTransport, TSigner>,
    "transport" | "chain"
  >;
} & Omit<
  SmartAccountClientConfig<TTransport, TChain>,
  "transport" | "account" | "chain"
>;

export function createMultiOwnerLightAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultiOwnerLightAccountClientParams<Transport, TChain, TSigner>
): Promise<
  SmartAccountClient<
    CustomTransport,
    Chain,
    MultiOwnerLightAccount<TSigner>,
    SmartAccountClientActions<Chain, SmartContractAccount> &
      MultiOwnerLightAccountClientActions<
        TSigner,
        MultiOwnerLightAccount<TSigner>
      >
  >
>;

export async function createMultiOwnerLightAccountClient({
  account,
  transport,
  chain,
  ...clientConfig
}: CreateMultiOwnerLightAccountClientParams): Promise<SmartAccountClient> {
  const lightAccount = await createMultiOwnerLightAccount({
    ...account,
    transport,
    chain,
  });

  return createSmartAccountClient({
    ...clientConfig,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(multiOwnerLightAccountClientActions);
}
